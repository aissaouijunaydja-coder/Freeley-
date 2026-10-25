// api/stripe-connect-onboard.js — ouvre (ou reprend) l'inscription du freelance chez Stripe, pour qu'il reçoive
// les paiements de ses clients directement sur son propre compte.
//
// Version 230 (sécurité). Avant, n'importe qui pouvait appeler cette adresse avec n'importe quel compte Stripe,
// et c'était l'application qui enregistrait le compte dans le profil. Maintenant :
//   - il faut être le freelance connecté (jeton de connexion vérifié auprès de Supabase) ;
//   - le compte utilisé est celui enregistré dans SON profil ; s'il n'en a pas, il est créé avec l'email de son compte ;
//   - c'est le serveur qui enregistre le compte dans le profil (la base refuse que l'application le fasse, script SQL v230) ;
//   - à la fin de l'inscription, le freelance revient toujours sur Freeley.
//
// Variables d'environnement : STRIPE_SECRET_KEY, VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const SITE_URL = "https://www.freeley.fr";
const ALLOWED_ORIGIN = /^https:\/\/((www\.)?freeley\.fr|freeley-[a-z0-9-]+\.vercel\.app)$/;

function safeReturnUrl(url, fallback) {
  try {
    const u = new URL(String(url));
    if (ALLOWED_ORIGIN.test(u.origin)) return u.toString();
  } catch (e) { /* adresse absente ou illisible */ }
  return fallback;
}

async function userFromRequest(req) {
  const token = String(req.headers?.authorization || "").replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user?.id) return null;
    return data.user;
  } catch (e) {
    console.error("[stripe-connect-onboard] jeton de connexion illisible", e);
    return null;
  }
}

const stripePost = (path, params) => fetch(`https://api.stripe.com/v1/${path}`, {
  method: "POST",
  headers: { "Authorization": `Bearer ${process.env.STRIPE_SECRET_KEY}`, "Content-Type": "application/x-www-form-urlencoded" },
  body: params.toString(),
});

// Enregistre le compte dans le profil, avec la clé de service (met à jour la ligne, ou la crée si elle manque)
async function saveAccountId(userId, accountId) {
  const values = { stripe_connect_account_id: accountId, stripe_connect_ready: false };
  const { data, error } = await supabase.from("profiles").update(values).eq("id", userId).select("id");
  if (error) return error;
  if (Array.isArray(data) && data.length > 0) return null;
  const { error: insertError } = await supabase.from("profiles").insert({ id: userId, ...values });
  return insertError || null;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const user = await userFromRequest(req);
  if (!user) return res.status(401).json({ error: "Ta session a expiré. Reconnecte-toi, puis réessaie." });

  try {
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const { data: profile, error: profileError } = await supabase
      .from("profiles").select("stripe_connect_account_id").eq("id", user.id).maybeSingle();
    if (profileError) {
      console.error("[stripe-connect-onboard] lecture du profil impossible", profileError);
      return res.status(500).json({ error: "Impossible de lire ton profil. Réessaie." });
    }

    let accountId = profile?.stripe_connect_account_id || null;
    if (!accountId) {
      const params = new URLSearchParams();
      params.append("type", "express");
      params.append("country", "FR");
      if (user.email) params.append("email", user.email);
      params.append("capabilities[card_payments][requested]", "true");
      params.append("capabilities[transfers][requested]", "true");
      params.append("business_type", "individual");
      params.append("metadata[freeley_user_id]", user.id);
      const acctRes = await stripePost("accounts", params);
      const acctData = await acctRes.json();
      if (!acctRes.ok) {
        console.error("[stripe-connect] Erreur création compte:", acctData);
        return res.status(acctRes.status).json({ error: acctData.error?.message || "Erreur Stripe" });
      }
      accountId = acctData.id;
      const saveError = await saveAccountId(user.id, accountId);
      if (saveError) {
        console.error("[stripe-connect-onboard] compte Stripe créé mais pas enregistré", accountId, saveError);
        return res.status(500).json({ error: "Ton compte Stripe n'a pas pu être enregistré. Réessaie." });
      }
    }

    const linkParams = new URLSearchParams();
    linkParams.append("account", accountId);
    linkParams.append("type", "account_onboarding");
    linkParams.append("refresh_url", safeReturnUrl(body.refreshUrl, `${SITE_URL}/?stripe_connect=refresh`));
    linkParams.append("return_url", safeReturnUrl(body.returnUrl, `${SITE_URL}/?stripe_connect=done`));
    const linkRes = await stripePost("account_links", linkParams);
    const linkData = await linkRes.json();
    if (!linkRes.ok) {
      console.error("[stripe-connect] Erreur création lien:", linkData);
      return res.status(linkRes.status).json({ error: linkData.error?.message || "Erreur Stripe" });
    }
    return res.status(200).json({ accountId, url: linkData.url });
  } catch (err) {
    console.error("[stripe-connect-onboard] Erreur:", err);
    return res.status(500).json({ error: err.message });
  }
}
