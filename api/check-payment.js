// api/check-payment.js — vérification de secours : demande directement à Stripe si le client a payé, au cas où le
// message automatique de Stripe (api/stripe-webhook) ne serait pas arrivé.
//
// Version 231. Avant, cette adresse était ouverte à tous, cherchait le paiement sur le compte Stripe de Freeley
// (alors que l'argent arrive sur le compte du freelance : elle ne le trouvait donc jamais), et c'était l'application
// qui écrivait ensuite « payé » dans le contrat. Maintenant :
//   - il faut être le freelance connecté (jeton de connexion vérifié auprès de Supabase) ;
//   - le contrat doit lui appartenir ; le numéro du lien de paiement est lu dans le contrat, pas dans la demande ;
//   - le paiement est cherché sur SON compte Stripe (celui de son profil), et il doit être relié à ce contrat ;
//   - c'est le serveur qui écrit « payé » (acompte ou solde), seulement si l'argent est vraiment encaissé.
//
// Demande : POST { contractId, kind } — kind = "contract" (acompte ou paiement comptant) ou "solde".
// Réponse : { paid: true | false }.
//
// Variables d'environnement : STRIPE_SECRET_KEY, VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SESSION_ID = /^cs_(test|live)_[A-Za-z0-9]{10,200}$/;
// Pour chaque sorte de paiement : où est gardé le numéro du lien, et quelle colonne passe en « payé »
const KINDS = {
  contract: { sessionColumn: "stripe_session_id", statusColumn: "payment_status" },
  solde: { sessionColumn: "solde_stripe_session_id", statusColumn: "solde_status" },
};

async function userFromRequest(req) {
  const token = String(req.headers?.authorization || "").replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user?.id) return null;
    return data.user;
  } catch (e) {
    console.error("[check-payment] jeton de connexion illisible", e);
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
    const contractId = String(body.contractId || "").trim();
    if (!UUID.test(contractId)) return res.status(400).json({ error: "Contrat invalide" });
    const kindName = body.kind === "solde" ? "solde" : "contract";
    const kind = KINDS[kindName];

    const { data: row, error: contractError } = await supabase
      .from("contracts").select(`id, user_id, ${kind.sessionColumn}, ${kind.statusColumn}`).eq("id", contractId).maybeSingle();
    if (contractError) {
      console.error("[check-payment] lecture du contrat impossible", contractError);
      return res.status(500).json({ error: "Impossible de lire le contrat. Réessaie." });
    }
    if (!row || row.user_id !== user.id) return res.status(403).json({ error: "Ce contrat n'est pas relié à ton compte." });
    if (row[kind.statusColumn] === "paid") return res.status(200).json({ paid: true, already: true });

    const sessionId = String(row[kind.sessionColumn] || "");
    if (!SESSION_ID.test(sessionId)) return res.status(200).json({ paid: false });

    const { data: profile, error: profileError } = await supabase
      .from("profiles").select("stripe_connect_account_id").eq("id", user.id).maybeSingle();
    if (profileError) {
      console.error("[check-payment] lecture du profil impossible", profileError);
      return res.status(500).json({ error: "Impossible de lire ton profil. Réessaie." });
    }
    const accountId = profile?.stripe_connect_account_id;
    if (!accountId) return res.status(200).json({ paid: false });

    // Le lien a été créé sur le compte Stripe du freelance : c'est là qu'on le cherche
    const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
      headers: { "Authorization": `Bearer ${process.env.STRIPE_SECRET_KEY}`, "Stripe-Account": accountId },
    });
    let session = {};
    try { session = (await response.json()) || {}; } catch (e) { /* réponse illisible */ }
    if (!response.ok) {
      // Lien inconnu sur ce compte (compte changé, lien d'un autre environnement…) : rien à marquer
      if (response.status === 404 || session.error?.code === "resource_missing") return res.status(200).json({ paid: false });
      console.error("[check-payment] Stripe a refusé la vérification", session.error || response.status);
      return res.status(502).json({ error: session.error?.message || "Erreur Stripe" });
    }

    const meta = session.metadata || {};
    const sameContract = meta.contractId === contractId;
    const sameKind = kindName === "solde" ? meta.paymentType === "solde" : (!meta.paymentType || meta.paymentType === "contract");
    const paid = session.payment_status === "paid" && sameContract && sameKind;
    if (!paid) return res.status(200).json({ paid: false });

    const { error: updateError } = await supabase.from("contracts").update({ [kind.statusColumn]: "paid" }).eq("id", contractId);
    if (updateError) {
      console.error("[check-payment] paiement trouvé mais pas enregistré", updateError);
      return res.status(500).json({ error: "Le paiement est bien arrivé, mais il n'a pas pu être enregistré. Réessaie." });
    }
    return res.status(200).json({ paid: true });
  } catch (err) {
    console.error("[check-payment] Erreur:", err);
    return res.status(500).json({ error: err.message });
  }
}
