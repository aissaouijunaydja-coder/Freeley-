// api/stripe-webhook.js — reçoit le message automatique de Stripe quand un client a payé, et passe le contrat
// en « payé » dans Freeley.
//
// Les paiements arrivent sur le compte Stripe de chaque freelance : Stripe envoie ces messages à la destination
// « Comptes connectés » (Stripe → Développeurs → Webhooks), avec sa propre clé secrète (STRIPE_WEBHOOK_SECRET).
//
// Version 231 :
//   - le solde payé passe bien le SOLDE en « payé » (avant, c'était l'acompte qui repassait en « payé » et le
//     solde restait « en attente ») ;
//   - le paiement doit venir du compte Stripe du freelance à qui appartient le contrat, sinon il est ignoré
//     (un autre compte ne peut pas faire passer en « payé » le contrat de quelqu'un d'autre) ;
//   - un paiement pas encore encaissé (prélèvement bancaire en cours) n'est pas marqué payé : il le sera à son
//     encaissement (message « checkout.session.async_payment_succeeded ») ;
//   - un message vieux de plus de 5 minutes est refusé, comme le fait la bibliothèque officielle de Stripe ;
//   - si l'enregistrement échoue, Freeley répond une erreur : Stripe renvoie alors le message plus tard
//     (pendant 3 jours), au lieu de le perdre.
//
// Version 232 : un paiement fait avec un lien Freeley permanent (api/pay.js) porte le numéro de ce lien (payLinkId).
// Le lien est alors marqué « payé » : une nouvelle visite affiche « paiement déjà reçu » au lieu d'ouvrir un
// deuxième paiement. Comme pour les contrats, le paiement doit venir du compte Stripe du freelance à qui appartient
// le lien.
//
// Variables d'environnement : STRIPE_WEBHOOK_SECRET, VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.

import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

export const config = {
  api: {
    bodyParser: false, // Stripe a besoin du corps BRUT de la requête pour vérifier la signature
  },
};

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const TOLERANCE_SECONDS = 300;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PAID_EVENTS = new Set(["checkout.session.completed", "checkout.session.async_payment_succeeded"]);

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

// Vérifie la signature Stripe (même méthode que la bibliothèque officielle, sans l'installer) : en-tête
// « t=horodatage,v1=signature[,v1=…] », signature HMAC-SHA256 de « horodatage.corps » avec la clé secrète.
function verifyStripeSignature(rawBody, signatureHeader, secret, nowSeconds = Math.floor(Date.now() / 1000)) {
  if (!signatureHeader || !secret) return false;
  let timestamp = null;
  const signatures = [];
  for (const part of String(signatureHeader).split(",")) {
    const i = part.indexOf("=");
    if (i <= 0) continue;
    const key = part.slice(0, i).trim();
    const value = part.slice(i + 1).trim();
    if (key === "t") timestamp = value;
    else if (key === "v1") signatures.push(value);
  }
  if (!timestamp || !/^\d{1,12}$/.test(timestamp) || signatures.length === 0) return false;
  if (nowSeconds - Number(timestamp) > TOLERANCE_SECONDS) return false; // message trop ancien (rejoué ?)
  const expected = crypto.createHmac("sha256", secret).update(`${timestamp}.`, "utf8").update(rawBody).digest();
  return signatures.some((sig) => {
    if (!/^[0-9a-f]{64}$/i.test(sig)) return false;
    return crypto.timingSafeEqual(Buffer.from(sig, "hex"), expected);
  });
}

function parseContent(raw) {
  if (!raw) return {};
  if (typeof raw === "string") {
    try { return JSON.parse(raw) || {}; } catch (e) { return {}; }
  }
  return raw;
}

// Enregistre le paiement. Renvoie { retry: true } si Stripe doit renvoyer le message plus tard (base injoignable),
// sinon { result } : ce qui a été fait, ou pourquoi le message est ignoré.
async function recordPayment(event) {
  const session = event.data?.object || {};
  const meta = session.metadata || {};
  const contractId = String(meta.contractId || "").trim();
  if (!contractId) return { result: "ignored_no_contract" };
  if (!UUID.test(contractId)) return { result: "ignored_bad_contract" };
  if (session.payment_status !== "paid") return { result: "ignored_not_paid_yet" };
  const account = typeof event.account === "string" ? event.account : "";
  if (!account) return { result: "ignored_no_account" };

  const { data: row, error: readError } = await supabase
    .from("contracts").select("id, user_id, content").eq("id", contractId).maybeSingle();
  if (readError) { console.error("[stripe-webhook] lecture du contrat impossible", readError); return { retry: true }; }
  if (!row) return { result: "ignored_unknown_contract" };
  if (meta.freeleyUserId && meta.freeleyUserId !== row.user_id) return { result: "ignored_other_user" };

  // Le paiement doit être arrivé sur le compte Stripe du propriétaire du contrat
  const { data: profile, error: profileError } = await supabase
    .from("profiles").select("stripe_connect_account_id").eq("id", row.user_id).maybeSingle();
  if (profileError) { console.error("[stripe-webhook] lecture du profil impossible", profileError); return { retry: true }; }
  if (!profile || profile.stripe_connect_account_id !== account) return { result: "ignored_other_account" };

  if (meta.paymentType === "avenant") {
    // Paiement d'un avenant précis : on met à jour SEULEMENT cet avenant, sans toucher au reste du contrat
    const num = String(meta.avenantNum ?? "").trim();
    if (!/^\d{1,4}$/.test(num)) return { result: "ignored_bad_avenant" };
    const content = parseContent(row.content);
    const avenants = Array.isArray(content.avenants) ? content.avenants.slice() : [];
    const idx = avenants.findIndex((a) => a && String(a.num) === num);
    if (idx === -1) return { result: "ignored_unknown_avenant" };
    if (avenants[idx].paymentReceived === true) return { result: "avenant_already_paid" };
    avenants[idx] = { ...avenants[idx], paymentReceived: true };
    const newContent = JSON.stringify({ ...content, avenants });
    const { data: saved, error: saveError } = await supabase
      .from("contracts").update({ content: newContent }).eq("id", contractId).select("id");
    if (saveError) { console.error("[stripe-webhook] avenant payé mais pas enregistré", saveError); return { retry: true }; }
    if (!Array.isArray(saved) || saved.length === 0) return { result: "ignored_unknown_contract" };
    return { result: "avenant_paid" };
  }

  // Solde, ou bien acompte / paiement comptant du contrat
  const column = meta.paymentType === "solde" ? "solde_status" : "payment_status";
  const { data: saved, error: saveError } = await supabase
    .from("contracts").update({ [column]: "paid" }).eq("id", contractId).select("id");
  if (saveError) { console.error("[stripe-webhook] paiement reçu mais pas enregistré", saveError); return { retry: true }; }
  if (!Array.isArray(saved) || saved.length === 0) return { result: "ignored_unknown_contract" };
  return { result: column === "solde_status" ? "solde_paid" : "contract_paid" };
}

// Version 232 : lien permanent payé (table payment_links). Sans gravité si cela échoue : à la visite suivante,
// api/pay.js vérifie de toute façon auprès de Stripe si le dernier paiement du lien a été payé.
async function markPaymentLinkPaid(event) {
  const session = event.data?.object || {};
  const linkId = String(session.metadata?.payLinkId || "").trim();
  const account = typeof event.account === "string" ? event.account : "";
  if (!UUID.test(linkId) || session.payment_status !== "paid" || !account) return "no_link";
  const { data: link, error: linkError } = await supabase.from("payment_links").select("id, user_id, paid_at").eq("id", linkId).maybeSingle();
  if (linkError) { console.error("[stripe-webhook] lien permanent illisible", linkError); return "link_error"; }
  if (!link) return "link_unknown";
  if (link.paid_at) return "link_already_paid";
  const { data: profile, error: profileError } = await supabase.from("profiles").select("stripe_connect_account_id").eq("id", link.user_id).maybeSingle();
  if (profileError) { console.error("[stripe-webhook] lecture du profil impossible (lien)", profileError); return "link_error"; }
  if (!profile || profile.stripe_connect_account_id !== account) return "link_other_account";
  const { error } = await supabase.from("payment_links").update({ paid_at: new Date().toISOString() }).eq("id", linkId);
  if (error) { console.error("[stripe-webhook] lien permanent non marqué payé", error); return "link_error"; }
  return "link_paid";
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  let rawBody;
  try {
    rawBody = await readRawBody(req);
  } catch (e) {
    return res.status(400).send("Corps de requête illisible");
  }

  if (!verifyStripeSignature(rawBody, req.headers["stripe-signature"], process.env.STRIPE_WEBHOOK_SECRET)) {
    console.error("[stripe-webhook] signature invalide (ou message trop ancien).");
    return res.status(400).send("Signature invalide");
  }

  let event;
  try {
    event = JSON.parse(rawBody.toString("utf8"));
  } catch (e) {
    return res.status(400).send("Corps de requête invalide");
  }

  if (!PAID_EVENTS.has(event?.type)) return res.status(200).json({ received: true });

  try {
    let link = "no_link";
    try { link = await markPaymentLinkPaid(event); } catch (e) { console.error("[stripe-webhook] lien permanent", e); link = "link_error"; }
    const outcome = await recordPayment(event);
    if (outcome.retry) return res.status(500).json({ received: false, error: "Enregistrement impossible pour le moment" });
    // Un paiement sans contrat (lettre de recouvrement d'un autre dossier) est normal quand il vient d'un lien Freeley
    if (String(outcome.result).startsWith("ignored") && !(outcome.result === "ignored_no_contract" && link === "link_paid")) {
      console.warn("[stripe-webhook]", outcome.result, event.id);
    }
    return res.status(200).json({ received: true, result: outcome.result, link });
  } catch (e) {
    console.error("[stripe-webhook] Erreur mise à jour paiement:", e);
    return res.status(500).json({ received: false, error: "Erreur interne" });
  }
}
