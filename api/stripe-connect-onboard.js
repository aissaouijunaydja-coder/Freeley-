// api/stripe-connect-onboard.js — ouvre (ou reprend) l'inscription du freelance chez Stripe, pour qu'il reçoive
// les paiements de ses clients directement sur son propre compte.
//
// Version 230 (sécurité) : il faut être le freelance connecté (jeton de connexion vérifié auprès de Supabase) ; le
// compte utilisé est celui enregistré dans SON profil (sinon il est créé avec l'email de son compte) ; c'est le
// serveur qui l'enregistre dans le profil ; à la fin de l'inscription, le freelance revient toujours sur Freeley.
//
// Version 231 : nouveau type de compte, l'équivalent d'un compte Stripe « Standard » :
//   - si un compte ne peut pas rembourser une perte (litige, fraude), c'est Stripe qui l'assume, pas Freeley ;
//   - les frais de Stripe sont payés par le freelance, prélevés sur chaque paiement (Freeley ne prend rien) ;
//   - Stripe demande et vérifie lui-même les informations du freelance ;
//   - le freelance a le tableau de bord Stripe complet (paiements, remboursements, litiges, virements).
//   Le statut (particulier, société…) n'est plus imposé : le freelance le choisit chez Stripe.
//   Si le compte enregistré dans le profil n'existe plus pour Stripe (par exemple un compte de test après le
//   passage en production), un nouveau compte est créé à sa place.
//
// Variables d'environnement : STRIPE_SECRET_KEY, VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const SITE_URL = "https://www.freeley.fr";
const ALLOWED_ORIGIN = /^https:\/\/((www\.)?freeley\.fr|freeley-[a-z0-9-]+\.vercel\.app)$/;
// Réponses de Stripe qui veulent dire : ce compte n'existe pas (ou plus) pour cette clé
const ACCOUNT_GONE = new Set(["account_invalid", "resource_missing", "livemode_mismatch"]);

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

async function stripePost(path, params) {
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${process.env.STRIPE_SECRET_KEY}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });
  let data = {};
  try { data = await res.json(); } catch (e) { /* réponse illisible */ }
  return { ok: res.ok, status: res.status, data: data || {} };
}

// Enregistre le compte dans le profil, avec la clé de service (met à jour la ligne, ou la crée si elle manque)
async function saveAccountId(userId, accountId) {
  const values = { stripe_connect_account_id: accountId, stripe_connect_ready: false };
  const { data, error } = await supabase.from("profiles").update(values).eq("id", userId).select("id");
  if (error) return error;
  if (Array.isArray(data) && data.length > 0) return null;
  const { error: insertError } = await supabase.from("profiles").insert({ id: userId, ...values });
  return insertError || null;
}

// Crée le compte Stripe du freelance (équivalent « Standard »), puis l'enregistre dans son profil
async function createAndSaveAccount(user) {
  const params = new URLSearchParams();
  params.append("controller[losses][payments]", "stripe");          // les pertes : Stripe, pas Freeley
  params.append("controller[fees][payer]", "account");              // les frais Stripe : le freelance
  params.append("controller[requirement_collection]", "stripe");    // les informations demandées : par Stripe
  params.append("controller[stripe_dashboard][type]", "full");      // le tableau de bord Stripe complet
  params.append("country", "FR");
  if (user.email) params.append("email", user.email);
  params.append("metadata[freeley_user_id]", user.id);
  const acct = await stripePost("accounts", params);
  if (!acct.ok || !acct.data.id) {
    console.error("[stripe-connect] Erreur création compte:", acct.data);
    return { status: acct.status >= 400 ? acct.status : 502, error: acct.data.error?.message || "Erreur Stripe" };
  }
  const saveError = await saveAccountId(user.id, acct.data.id);
  if (saveError) {
    console.error("[stripe-connect-onboard] compte Stripe créé mais pas enregistré", acct.data.id, saveError);
    return { status: 500, error: "Ton compte Stripe n'a pas pu être enregistré. Réessaie." };
  }
  return { accountId: acct.data.id };
}

function createOnboardingLink(accountId, body) {
  const linkParams = new URLSearchParams();
  linkParams.append("account", accountId);
  linkParams.append("type", "account_onboarding");
  linkParams.append("refresh_url", safeReturnUrl(body.refreshUrl, `${SITE_URL}/?stripe_connect=refresh`));
  linkParams.append("return_url", safeReturnUrl(body.returnUrl, `${SITE_URL}/?stripe_connect=done`));
  return stripePost("account_links", linkParams);
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

    const savedAccountId = profile?.stripe_connect_account_id || null;
    let accountId = savedAccountId;
    if (!accountId) {
      const made = await createAndSaveAccount(user);
      if (made.error) return res.status(made.status).json({ error: made.error });
      accountId = made.accountId;
    }

    let link = await createOnboardingLink(accountId, body);
    // Le compte du profil n'existe plus pour Stripe : on en crée un nouveau, une seule fois
    if (!link.ok && accountId === savedAccountId && ACCOUNT_GONE.has(link.data.error?.code)) {
      console.warn("[stripe-connect-onboard] compte du profil introuvable chez Stripe, nouveau compte créé à sa place", accountId, link.data.error?.code);
      const made = await createAndSaveAccount(user);
      if (made.error) return res.status(made.status).json({ error: made.error });
      accountId = made.accountId;
      link = await createOnboardingLink(accountId, body);
    }
    if (!link.ok || !link.data.url) {
      console.error("[stripe-connect] Erreur création lien:", link.data);
      return res.status(link.status >= 400 ? link.status : 502).json({ error: link.data.error?.message || "Erreur Stripe" });
    }
    return res.status(200).json({ accountId, url: link.data.url });
  } catch (err) {
    console.error("[stripe-connect-onboard] Erreur:", err);
    return res.status(500).json({ error: err.message });
  }
}
