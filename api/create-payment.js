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
// Variables d'environnement : STRIPE_SECRET_KEY, VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const SITE_URL = "https://www.freeley.fr";
const ALLOWED_ORIGIN = /^https:\/\/((www\.)?freeley\.fr|freeley-[a-z0-9-]+\.vercel\.app)$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PAYMENT_TYPES = new Set(["contract", "solde", "avenant"]);
const MAX_AMOUNT = 999999.99;

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

    // Session de paiement Stripe Checkout (montant en centimes)
    const params = new URLSearchParams();
    params.append("mode", "payment");
    params.append("line_items[0][price_data][currency]", "eur");
    params.append("line_items[0][price_data][product_data][name]", String(body.description || "Paiement Freeley").trim().slice(0, 200) || "Paiement Freeley");
    params.append("line_items[0][price_data][unit_amount]", String(Math.round(amount * 100)));
    params.append("line_items[0][quantity]", "1");
    params.append("success_url", safeReturnUrl(body.successUrl, `${SITE_URL}/?paiement=succes`));
    params.append("cancel_url", safeReturnUrl(body.cancelUrl, `${SITE_URL}/?paiement=annule`));
    const email = String(body.customerEmail || "").trim();
    if (email && email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) params.append("customer_email", email);
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
    const data = await response.json();
    if (!response.ok) {
      console.error("[stripe] Erreur:", data);
      return res.status(response.status).json({ error: data?.error?.message || "Erreur Stripe" });
    }
    return res.status(200).json({ url: data.url, id: data.id });
  } catch (err) {
    console.error("[create-payment] Erreur:", err);
    return res.status(500).json({ error: err.message });
  }
}
