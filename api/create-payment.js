// api/create-payment.js — crée un lien de paiement par carte (Stripe Checkout) sur le compte Stripe du freelance.
// L'argent du client va directement chez le freelance : Freeley ne touche jamais ces fonds.
//
// Version 230 (sécurité). Avant, n'importe qui pouvait créer un lien, avec le montant, le compte Stripe et le
// contrat de son choix (par exemple un faux lien à 1 € relié à son propre contrat, qui passait ensuite en « payé »).
// Maintenant :
//   - il faut être le freelance connecté (jeton de connexion vérifié auprès de Supabase) ;
//   - le compte Stripe utilisé est celui enregistré dans SON profil, jamais celui envoyé par le navigateur ;
//   - un lien relié à un contrat n'est créé que si ce contrat lui appartient ;
//   - après le paiement, le client revient toujours sur Freeley.
//
// Version 231 :
//   - le serveur garde lui-même le numéro du lien (acompte ou solde) dans le contrat : la vérification de secours
//     (api/check-payment) marche aussi pour les liens créés pendant la signature ou depuis une facture ;
//   - si Stripe ne reconnaît plus le compte du profil (par exemple un compte de test après le passage en
//     production), le profil repasse en « pas encore connecté » et le message dit quoi faire.
//
// Version 232 : le lien donné au client n'expire plus. Un lien de paiement Stripe expire au bout de 24 heures, alors
// qu'une facture ou une relance est souvent payée plusieurs jours après. Le serveur enregistre donc un lien Freeley
// permanent (table payment_links, script SQL v232) : https://www.freeley.fr/api/pay?l=<numéro>. À chaque visite,
// api/pay.js reprend le paiement Stripe encore ouvert, ou en crée un nouveau. Le même contrat, pour le même paiement
// et le même montant, garde le même lien. Sans la table (script SQL pas encore lancé), le lien Stripe est renvoyé
// comme avant.
//
// Variables d'environnement : STRIPE_SECRET_KEY, VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const SITE_URL = "https://www.freeley.fr";
const ALLOWED_ORIGIN = /^https:\/\/((www\.)?freeley\.fr|freeley-[a-z0-9-]+\.vercel\.app)$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PAYMENT_TYPES = new Set(["contract", "solde", "avenant"]);
const MAX_AMOUNT = 999999.99;
// Réponses de Stripe qui veulent dire : ce compte n'existe pas (ou plus) pour cette clé
const ACCOUNT_GONE = new Set(["account_invalid", "resource_missing", "livemode_mismatch"]);
// Colonne du contrat où le numéro du lien est gardé, selon ce que le client paie
const SESSION_COLUMN = { contract: "stripe_session_id", solde: "solde_stripe_session_id" };

function safeReturnUrl(url, fallback) {
  try {
    const u = new URL(String(url));
    if (ALLOWED_ORIGIN.test(u.origin)) return u.toString();
  } catch (e) { /* adresse absente ou illisible */ }
  return fallback;
}

// Version 232 : lien permanent. Reprend le lien pas encore payé du même contrat, pour le même paiement et le même
// montant (ou, sans contrat, du même montant et du même libellé) ; sinon en crée un. Renvoie son numéro, ou null
// si la table n'existe pas encore (le client reçoit alors le lien Stripe, comme avant).
async function findOrCreatePaymentLink({ userId, metadata, amountCents, description, email }) {
  try {
    const kind = metadata.contractId ? metadata.paymentType : "other";
    let q = supabase.from("payment_links").select("id")
      .eq("user_id", userId).eq("kind", kind).eq("amount_cents", amountCents).is("paid_at", null);
    q = metadata.contractId ? q.eq("contract_id", metadata.contractId) : q.is("contract_id", null).eq("description", description);
    if (kind === "avenant") q = q.eq("avenant_num", metadata.avenantNum);
    const { data: found, error: findError } = await q.order("created_at", { ascending: false }).limit(1);
    if (findError) throw findError;
    if (Array.isArray(found) && found[0]?.id) {
      const { error } = await supabase.from("payment_links").update({ description, customer_email: email || null }).eq("id", found[0].id);
      if (error) throw error;
      return found[0].id;
    }
    const { data: created, error } = await supabase.from("payment_links").insert({
      user_id: userId,
      contract_id: metadata.contractId || null,
      kind,
      avenant_num: kind === "avenant" ? metadata.avenantNum : null,
      amount_cents: amountCents,
      description,
      customer_email: email || null,
    }).select("id").single();
    if (error) throw error;
    return created?.id || null;
  } catch (e) {
    console.error("[create-payment] lien permanent impossible (script SQL v232 lancé ?)", e);
    return null;
  }
}

async function userFromRequest(req) {
  const token = String(req.headers?.authorization || "").replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user?.id) return null;
    return data.user;
  } catch (e) {
    console.error("[create-payment] jeton de connexion illisible", e);
    return null;
  }
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
    const amount = Number(body.amount);
    if (!Number.isFinite(amount) || amount <= 0 || amount > MAX_AMOUNT) {
      return res.status(400).json({ error: "Montant invalide" });
    }

    // Le compte Stripe vient du profil du freelance connecté, jamais de la demande
    const { data: profile, error: profileError } = await supabase
      .from("profiles").select("stripe_connect_account_id").eq("id", user.id).maybeSingle();
    if (profileError) {
      console.error("[create-payment] lecture du profil impossible", profileError);
      return res.status(500).json({ error: "Impossible de lire ton profil. Réessaie." });
    }
    const accountId = profile?.stripe_connect_account_id;
    if (!accountId) {
      return res.status(400).json({ error: "Connecte d'abord ton compte Stripe (Profil → Facturation) pour que l'argent de ton client arrive chez toi." });
    }

    // Contrat relié au paiement (pour qu'il passe en « payé » tout seul) : il doit appartenir au freelance
    const meta = body.metadata && typeof body.metadata === "object" ? body.metadata : {};
    const contractId = String(meta.contractId || "").trim();
    const metadata = { freeleyUserId: user.id };
    if (contractId) {
      if (!UUID.test(contractId)) return res.status(400).json({ error: "Contrat invalide" });
      const { data: row, error: contractError } = await supabase
        .from("contracts").select("user_id").eq("id", contractId).maybeSingle();
      if (contractError) {
        console.error("[create-payment] lecture du contrat impossible", contractError);
        return res.status(500).json({ error: "Impossible de vérifier le contrat. Réessaie." });
      }
      if (!row || row.user_id !== user.id) return res.status(403).json({ error: "Ce contrat n'est pas relié à ton compte." });
      metadata.contractId = contractId;
      metadata.paymentType = PAYMENT_TYPES.has(meta.paymentType) ? meta.paymentType : "contract";
      if (metadata.paymentType === "avenant") {
        const num = String(meta.avenantNum ?? "").trim();
        if (!/^\d{1,4}$/.test(num)) return res.status(400).json({ error: "Avenant invalide" });
        metadata.avenantNum = num;
      }
    }

    // Version 232 : lien permanent enregistré d'abord, pour que le paiement Stripe porte son numéro (payLinkId)
    const description = String(body.description || "Paiement Freeley").trim().slice(0, 200) || "Paiement Freeley";
    const amountCents = Math.round(amount * 100);
    const rawEmail = String(body.customerEmail || "").trim();
    const email = rawEmail && rawEmail.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail) ? rawEmail : "";
    const linkId = await findOrCreatePaymentLink({ userId: user.id, metadata, amountCents, description, email });
    if (linkId) metadata.payLinkId = linkId;

    // Session de paiement Stripe Checkout (montant en centimes)
    const params = new URLSearchParams();
    params.append("mode", "payment");
    params.append("line_items[0][price_data][currency]", "eur");
    params.append("line_items[0][price_data][product_data][name]", description);
    params.append("line_items[0][price_data][unit_amount]", String(amountCents));
    params.append("line_items[0][quantity]", "1");
    params.append("success_url", safeReturnUrl(body.successUrl, `${SITE_URL}/?paiement=succes`));
    params.append("cancel_url", safeReturnUrl(body.cancelUrl, `${SITE_URL}/?paiement=annule`));
    if (email) params.append("customer_email", email);
    Object.entries(metadata).forEach(([key, value]) => params.append(`metadata[${key}]`, String(value)));

    const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "Stripe-Account": accountId,
      },
      body: params.toString(),
    });
    let data = {};
    try { data = (await response.json()) || {}; } catch (e) { /* réponse illisible */ }
    if (!response.ok) {
      console.error("[stripe] Erreur:", data);
      if (ACCOUNT_GONE.has(data?.error?.code)) {
        // Le compte du profil n'existe plus pour Stripe : le bouton « Connecter mon compte Stripe » doit revenir
        const { error: saveError } = await supabase.from("profiles").update({ stripe_connect_ready: false }).eq("id", user.id);
        if (saveError) console.error("[create-payment] état Stripe non enregistré", saveError);
        return res.status(409).json({ error: "Stripe ne reconnaît plus ton compte. Recharge la page, puis reconnecte ton compte Stripe dans ton Profil → Facturation.", code: "stripe_reconnect" });
      }
      return res.status(response.status).json({ error: data?.error?.message || "Erreur Stripe" });
    }

    // Garde le numéro du lien dans le contrat, pour la vérification de secours (api/check-payment)
    const sessionColumn = metadata.contractId ? SESSION_COLUMN[metadata.paymentType] : null;
    if (sessionColumn && data.id) {
      const { error: saveError } = await supabase.from("contracts").update({ [sessionColumn]: data.id }).eq("id", metadata.contractId);
      if (saveError) console.error("[create-payment] numéro du lien non enregistré dans le contrat", saveError);
    }
    // Version 232 : le client reçoit le lien permanent ; le paiement Stripe qu'on vient d'ouvrir sert à sa première visite
    if (linkId && data.id) {
      const { error: linkError } = await supabase.from("payment_links").update({ last_session_id: data.id }).eq("id", linkId);
      if (linkError) console.error("[create-payment] lien permanent : paiement Stripe non enregistré", linkError);
      return res.status(200).json({ url: `${SITE_URL}/api/pay?l=${linkId}`, checkoutUrl: data.url, id: data.id, linkId });
    }
    return res.status(200).json({ url: data.url, id: data.id });
  } catch (err) {
    console.error("[create-payment] Erreur:", err);
    return res.status(500).json({ error: err.message });
  }
}
