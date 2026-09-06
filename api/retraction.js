// /api/retraction.js
//
// NOUVEAU FICHIER — remplace les 3 fichiers séparés créés plus tôt aujourd'hui
// (confirm-retraction.js, find-contract.js, send-contract-link.js). Ils ont été fusionnés
// ici en un seul, car le plan gratuit de Vercel limite à 12 fonctions serverless par
// déploiement, et le projet était déjà à 12 avant d'ajouter le 3e fichier séparé.
//
// Si tu avais déjà copié confirm-retraction.js et find-contract.js dans ton dossier /api,
// SUPPRIME-les (et ne copie pas send-contract-link.js) : ce seul fichier fait maintenant
// le travail des trois.
//
// Comment ça marche : le front-end appelle toujours "/api/retraction", en précisant dans le
// corps de la requête un champ "action" pour dire laquelle des 3 tâches effectuer :
//   - action: "confirm"   → un client confirme sa rétractation (accusé de réception + notif freelance)
//   - action: "find"      → un client cherche son contrat perdu par email
//   - action: "send-link" → après une signature tactile, envoyer au client son lien permanent
//
// Mêmes variables d'environnement que prévu : VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
// RESEND_API_KEY. Adresse "from" à vérifier dans Resend (Domains → freeley.fr).

import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "Freeley <contact@freeley.fr>"; // vérifie que cette adresse est bien validée dans Resend
const SITE_URL = process.env.SITE_URL || "https://freeley.fr"; // adapte si ton domaine diffère

function parseContent(row) {
  return typeof row === "string" ? JSON.parse(row) : (row || {});
}

// ── action: "confirm" — accusé de réception client + notification freelance ──
async function handleConfirm(contractId) {
  const { data: row, error } = await supabase
    .from("contracts")
    .select("content, user_id")
    .eq("id", contractId)
    .single();
  if (error || !row) return { status: 404, body: { error: "Contrat introuvable" } };

  const content = parseContent(row.content);
  const clientEmail = content.form?.clientEmail || content.clientEmail || "";
  const clientName = content.form?.clientName || content.clientName || "";
  const missionTitle = content.missionTitle || content.form?.missionTitle || "votre mission";
  const exercisedAt = content.retractationExercisedAt || new Date().toISOString();
  const dateStr = new Date(exercisedAt).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" });

  let freelanceEmail = null;
  try {
    const { data: userData } = await supabase.auth.admin.getUserById(row.user_id);
    freelanceEmail = userData?.user?.email || null;
  } catch (e) {
    console.error("retraction/confirm: email freelance introuvable", e);
  }

  const results = { clientEmailSent: false, freelanceEmailSent: false };

  if (clientEmail) {
    try {
      await resend.emails.send({
        from: FROM, to: clientEmail,
        subject: `Confirmation de votre rétractation — ${missionTitle}`,
        text: `Bonjour ${clientName},\n\nNous confirmons la bonne réception de votre demande de rétractation concernant le contrat « ${missionTitle} », reçue le ${dateStr}.\n\nConformément à l'article D221-5 du Code de la consommation, cet email constitue votre accusé de réception. Le contrat est annulé à compter de cette date.\n\nCordialement,\nFreeley`,
      });
      results.clientEmailSent = true;
    } catch (e) { console.error("retraction/confirm: échec email client", e); }
  }

  if (freelanceEmail) {
    try {
      await resend.emails.send({
        from: FROM, to: freelanceEmail,
        subject: `Un client s'est rétracté — ${missionTitle}`,
        text: `Bonjour,\n\n${clientName || "Votre client"} a exercé son droit de rétractation le ${dateStr} pour la mission « ${missionTitle} ».\n\nSi une partie de la prestation a déjà été réalisée, pense à établir la facturation proportionnelle correspondante.\n\nCordialement,\nFreeley`,
      });
      results.freelanceEmailSent = true;
    } catch (e) { console.error("retraction/confirm: échec email freelance", e); }
  }

  return { status: 200, body: { ok: true, ...results } };
}

// ── action: "find" — retrouver un contrat perdu par email, toujours même réponse ──
async function handleFind(email) {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: 200, body: { ok: true } };
  }
  try {
    const { data: rows } = await supabase.from("contracts").select("id, content").eq("status", "signed");
    const emailLower = email.trim().toLowerCase();
    const matches = (rows || []).filter(r => {
      const c = parseContent(r.content);
      return (c.form?.clientEmail || c.clientEmail || "").toLowerCase() === emailLower;
    });
    for (const m of matches) {
      const c = parseContent(m.content);
      const link = `${SITE_URL}/?sign=${m.id}`;
      const missionTitle = c.missionTitle || c.form?.missionTitle || "";
      try {
        await resend.emails.send({
          from: FROM, to: email,
          subject: `Retrouve ton contrat — ${missionTitle}`,
          text: `Bonjour,\n\nVoici le lien vers ton contrat « ${missionTitle} » :\n${link}\n\nCordialement,\nFreeley`,
        });
      } catch (e) { console.error("retraction/find: échec email pour", m.id, e); }
    }
  } catch (e) {
    console.error("retraction/find: erreur de recherche", e);
  }
  return { status: 200, body: { ok: true } };
}

// ── action: "send-link" — après signature tactile, envoyer au client son lien permanent ──
async function handleSendLink(contractId) {
  const { data: row, error } = await supabase.from("contracts").select("content").eq("id", contractId).single();
  if (error || !row) return { status: 404, body: { error: "Contrat introuvable" } };

  const content = parseContent(row.content);
  const clientEmail = content.form?.clientEmail || content.clientEmail || "";
  const clientName = content.form?.clientName || content.clientName || "";
  const missionTitle = content.missionTitle || content.form?.missionTitle || "ta mission";
  const link = `${SITE_URL}/?sign=${contractId}`;

  if (!clientEmail) return { status: 200, body: { ok: true, sent: false, reason: "no_client_email" } };

  try {
    await resend.emails.send({
      from: FROM, to: clientEmail,
      subject: `Ton contrat signé — ${missionTitle}`,
      text: `Bonjour ${clientName},\n\nVoici le lien vers ton contrat signé « ${missionTitle} » :\n${link}\n\nGarde ce lien précieusement : il te permet de consulter ton contrat à tout moment, et, si tu es un particulier, d'exercer ton droit de rétractation pendant 14 jours si besoin.\n\nCordialement,\nFreeley`,
    });
    return { status: 200, body: { ok: true, sent: true } };
  } catch (e) {
    console.error("retraction/send-link: échec envoi email", e);
    return { status: 500, body: { error: "Erreur envoi email" } };
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { action, contractId, email } = req.body || {};
  let result;

  if (action === "confirm") {
    if (!contractId) return res.status(400).json({ error: "contractId manquant" });
    result = await handleConfirm(contractId);
  } else if (action === "find") {
    result = await handleFind(email);
  } else if (action === "send-link") {
    if (!contractId) return res.status(400).json({ error: "contractId manquant" });
    result = await handleSendLink(contractId);
  } else {
    return res.status(400).json({ error: "action inconnue" });
  }

  return res.status(result.status).json(result.body);
}
