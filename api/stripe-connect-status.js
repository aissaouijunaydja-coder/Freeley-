// api/stripe-connect-status.js — vérifie auprès de Stripe si le compte du freelance peut recevoir des paiements.
//
// Version 230 (sécurité) : réservé au freelance connecté (jeton de connexion vérifié auprès de Supabase). Le compte
// vérifié est celui de SON profil, et c'est le serveur qui enregistre le résultat dans le profil (la base refuse
// que l'application le fasse elle-même, script SQL v230).
//
// Variables d'environnement : STRIPE_SECRET_KEY, VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function userFromRequest(req) {
  const token = String(req.headers?.authorization || "").replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user?.id) return null;
    return data.user;
  } catch (e) {
    console.error("[stripe-connect-status] jeton de connexion illisible", e);
    return null;
  }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET" && req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const user = await userFromRequest(req);
  if (!user) return res.status(401).json({ error: "Ta session a expiré. Reconnecte-toi, puis réessaie." });

  try {
    const { data: profile, error: profileError } = await supabase
      .from("profiles").select("stripe_connect_account_id, stripe_connect_ready").eq("id", user.id).maybeSingle();
    if (profileError) {
      console.error("[stripe-connect-status] lecture du profil impossible", profileError);
      return res.status(500).json({ error: "Impossible de lire ton profil. Réessaie." });
    }
    const accountId = profile?.stripe_connect_account_id;
    if (!accountId) return res.status(200).json({ connected: false, ready: false, chargesEnabled: false, detailsSubmitted: false });

    const response = await fetch(`https://api.stripe.com/v1/accounts/${encodeURIComponent(accountId)}`, {
      headers: { "Authorization": `Bearer ${process.env.STRIPE_SECRET_KEY}` },
    });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data.error?.message || "Erreur Stripe" });

    const ready = !!(data.charges_enabled && data.details_submitted);
    if (ready !== !!profile.stripe_connect_ready) {
      const { error: saveError } = await supabase.from("profiles").update({ stripe_connect_ready: ready }).eq("id", user.id);
      if (saveError) console.error("[stripe-connect-status] état non enregistré", saveError);
    }
    return res.status(200).json({
      connected: true,
      ready,
      chargesEnabled: !!data.charges_enabled,
      detailsSubmitted: !!data.details_submitted,
    });
  } catch (err) {
    console.error("[stripe-connect-status] Erreur:", err);
    return res.status(500).json({ error: err.message });
  }
}
