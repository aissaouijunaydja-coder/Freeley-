// api/generate.js — passage vers le service de rédaction (Anthropic), réservé aux comptes Freeley connectés.
//
// Version 230 (sécurité). Avant, n'importe qui sur internet pouvait appeler cette adresse et utiliser la clé
// Anthropic de Freeley, avec le modèle et la longueur de son choix. Maintenant :
//   - il faut être connecté : l'application envoie son jeton de connexion, vérifié ici auprès de Supabase ;
//   - le modèle et la longueur maximale sont imposés ici : le navigateur ne peut plus choisir plus cher ;
//   - seuls des messages simples passent (texte, image, document PDF) : pas d'outils payants, pas de consignes cachées ;
//   - 50 utilisations par jour et par compte (heure de Paris), comptées dans Supabase (script SQL v230).
//     Une utilisation est rendue quand le service ne répond pas (panne, surcharge).
// Si le compteur est indisponible (script SQL pas encore lancé, panne), la demande passe quand même :
// la connexion obligatoire reste la protection principale, et la limite de dépense Anthropic le filet de sécurité.
//
// Variables d'environnement : ANTHROPIC_API_KEY, VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const MODEL = "claude-sonnet-5-5";
const MAX_TOKENS = 8000;      // le plus long usage de Freeley : la rédaction d'un contrat complet
const DAILY_LIMIT = 50;       // utilisations par jour et par compte
const MAX_MESSAGES = 6;       // la rédaction avec reprise en utilise 3 au plus
const MAX_BLOCKS = 30;        // le scanner envoie une image par page photographiée
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);

const sendError = (res, status, type, message, extra = {}) =>
  res.status(status).json({ type: "error", error: { type, message }, ...extra });

async function userFromRequest(req) {
  const token = String(req.headers?.authorization || "").replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user?.id) return null;
    return data.user;
  } catch (e) {
    console.error("[generate] jeton de connexion illisible", e);
    return null;
  }
}

// Ne garde que des messages simples : rôle user ou assistant, avec du texte, une image ou un document PDF.
// Tout le reste (outils, consignes système, autres champs) est refusé ou retiré.
function cleanMessages(messages) {
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) return null;
  const out = [];
  for (const m of messages) {
    if (!m || (m.role !== "user" && m.role !== "assistant")) return null;
    if (typeof m.content === "string") {
      if (!m.content.trim()) return null;
      out.push({ role: m.role, content: m.content });
      continue;
    }
    if (!Array.isArray(m.content) || m.content.length === 0 || m.content.length > MAX_BLOCKS) return null;
    const blocks = [];
    for (const b of m.content) {
      if (!b || typeof b !== "object") return null;
      if (b.type === "text") {
        if (typeof b.text !== "string") return null;
        blocks.push({ type: "text", text: b.text });
        continue;
      }
      if (b.type !== "image" && b.type !== "document") return null;
      const s = b.source;
      if (!s || s.type !== "base64" || typeof s.data !== "string" || typeof s.media_type !== "string") return null;
      if (b.type === "image" && !IMAGE_TYPES.has(s.media_type)) return null;
      if (b.type === "document" && s.media_type !== "application/pdf") return null;
      blocks.push({ type: b.type, source: { type: "base64", media_type: s.media_type, data: s.data } });
    }
    out.push({ role: m.role, content: blocks });
  }
  return out[0].role === "user" ? out : null;
}

async function consumeQuota(userId) {
  try {
    const { data, error } = await supabase.rpc("consume_ai_quota", { p_user_id: userId, p_limit: DAILY_LIMIT });
    if (error) { console.error("[generate] compteur indisponible :", error.message || error); return null; }
    const row = Array.isArray(data) ? data[0] : data;
    return row && typeof row === "object" ? row : null;
  } catch (e) {
    console.error("[generate] compteur indisponible", e);
    return null;
  }
}

async function releaseQuota(userId) {
  try { await supabase.rpc("release_ai_quota", { p_user_id: userId }); } catch (e) { /* tant pis : une utilisation de perdue */ }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return sendError(res, 405, "invalid_request_error", "Method not allowed");

  const user = await userFromRequest(req);
  if (!user) return sendError(res, 401, "login_required", "Connexion requise.");

  const body = req.body && typeof req.body === "object" ? req.body : {};
  const messages = cleanMessages(body.messages);
  if (!messages) return sendError(res, 400, "invalid_request_error", "Demande invalide.");
  const maxTokens = Math.min(MAX_TOKENS, Math.max(1, Math.floor(Number(body.max_tokens)) || 1024));
  const wantsStream = body.stream === true;

  const quota = await consumeQuota(user.id);
  if (quota && quota.allowed === false) {
    const limit = Number(quota.limit) || DAILY_LIMIT;
    return sendError(res, 429, "daily_limit", `Limite de ${limit} utilisations par jour atteinte.`, { limit });
  }

  const payload = { model: MODEL, max_tokens: maxTokens, messages };
  if (body.thinking && body.thinking.type === "between_tools") payload.thinking = { type: "between_tools" };
  if (wantsStream) payload.stream = true;

  let response;
  try {
    response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error("[generate] service injoignable", err);
    await releaseQuota(user.id);
    return sendError(res, 502, "api_error", "Le service de rédaction ne répond pas. Réessaie dans un instant.");
  }

  if (!wantsStream) {
    const data = await response.json().catch(() => null);
    if (!response.ok) await releaseQuota(user.id);
    if (!data) return sendError(res, 502, "api_error", "Réponse illisible du service de rédaction.");
    return res.status(response.ok ? 200 : response.status).json(data);
  }

  if (!response.ok || !response.body) {
    await releaseQuota(user.id);
    const errData = await response.json().catch(() => ({ type: "error", error: { type: "api_error", message: "Erreur du service de rédaction" } }));
    return res.status(response.status || 502).json(errData);
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();
  try {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(decoder.decode(value, { stream: true }));
    }
  } catch (err) {
    console.error("[generate] flux interrompu", err);
  }
  res.end();
}
