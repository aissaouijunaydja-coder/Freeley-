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
// Version 234 : chaque paiement reçu est aussi noté dans le livre des recettes du freelance (table recettes, script
// SQL v234) : date du paiement, client, numéro de facture, nature, montant, moyen de paiement (demandé à Stripe).
// Le paiement d'un lien sans contrat (lettre de recouvrement) y est noté aussi. Si la table n'existe pas encore, le
// paiement est enregistré dans le contrat comme avant.
//
// Variables d'environnement : STRIPE_WEBHOOK_SECRET, STRIPE_SECRET_KEY (version 234 : moyen de paiement utilisé),
// VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.

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

// ── Version 234 : livre des recettes (table recettes, script SQL v234) ──
// Chaque paiement en ligne reçu y est noté : date d'encaissement, client, numéro de facture, nature, montant payé par le
// client (avant les frais de Stripe) et moyen de paiement. Une seule ligne par paiement Stripe (clé « stripe:<numéro> »),
// même si l'information arrive plusieurs fois (message de Stripe, lien de paiement, vérification de secours).
// Sans gravité si cela échoue : le paiement reste enregistré dans le contrat, et l'application propose au freelance de
// noter lui-même la date (« À compléter », dans le livre des recettes).
// (Ce bloc est le même dans api/stripe-webhook.js, api/pay.js et api/check-payment.js.)
const LEDGER_SESSION_ID = /^cs_(test|live)_[A-Za-z0-9]{10,200}$/;
const LEDGER_TYPE_LABEL = { link: "Link", paypal: "PayPal", bancontact: "Bancontact", ideal: "iDEAL", klarna: "Klarna", revolut_pay: "Revolut Pay", amazon_pay: "Amazon Pay", eps: "EPS", p24: "Przelewy24" };

function ledgerContent(raw) {
  if (!raw) return {};
  if (typeof raw === "string") {
    try { return JSON.parse(raw) || {}; } catch (e) { return {}; }
  }
  return typeof raw === "object" ? raw : {};
}

// Jour de Paris (AAAA-MM-JJ) d'un moment donné en secondes (maintenant s'il manque)
function ledgerParisDay(seconds) {
  const ms = Number(seconds) > 0 ? Number(seconds) * 1000 : Date.now();
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date(ms));
  const get = (type) => (parts.find((p) => p.type === type) || {}).value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

// Moyen de paiement utilisé et moment exact du paiement, demandés à Stripe (null si Stripe ne répond pas)
async function ledgerStripeFacts(sessionId, accountId) {
  if (!process.env.STRIPE_SECRET_KEY || !accountId || !LEDGER_SESSION_ID.test(String(sessionId || ""))) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);
  try {
    const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}?expand[]=payment_intent.latest_charge`, {
      headers: { "Authorization": `Bearer ${process.env.STRIPE_SECRET_KEY}`, "Stripe-Account": accountId },
      signal: controller.signal,
    });
    if (!response.ok) return null;
    const s = (await response.json()) || {};
    const intent = s.payment_intent && typeof s.payment_intent === "object" ? s.payment_intent : null;
    const charge = intent && intent.latest_charge && typeof intent.latest_charge === "object" ? intent.latest_charge : null;
    return { type: String(charge?.payment_method_details?.type || "") || null, paidAt: Number(charge?.created) || null, ref: intent?.id || null };
  } catch (e) {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// Moyen de paiement noté dans le livre : celui que Stripe indique ; sinon, déduit du paiement
function ledgerMethod(type, session, delayed) {
  if (type === "card") return { method: "carte", note: null };
  if (type === "sepa_debit") return { method: "prelevement", note: null };
  if (type === "customer_balance") return { method: "virement", note: "Virement reçu par Stripe" };
  if (type) return { method: "autre", note: `Paiement en ligne par ${LEDGER_TYPE_LABEL[type] || type} (Stripe)` };
  const types = Array.isArray(session?.payment_method_types) ? session.payment_method_types.map(String) : [];
  if (types.length === 1) return ledgerMethod(types[0], null, delayed);
  if (delayed) return types.includes("sepa_debit") ? { method: "prelevement", note: null } : { method: "autre", note: "Paiement en ligne (Stripe)" };
  return { method: "carte", note: null };
}

// Libellé du premier paiement d'un contrat : le même que sur la facture (depositInvoiceSpec dans l'application)
function ledgerAcompteLabel(form) {
  const pct = Number(form?.acomptePourcentage) || 0;
  const days = form?.paymentTerms && form.paymentTerms !== "Comptant" ? Number(form.paymentTerms) || 0 : 0;
  if (pct <= 0 && days > 0) return "Prestation";
  return pct <= 0 || pct >= 100 ? "Paiement comptant" : `Acompte ${pct} %`;
}

// Ce que le livre note d'un paiement de contrat (lu dans le contrat) : sorte, nature, client, numéro de facture.
// paymentType : « contract » (acompte, paiement comptant ou facture libre), « solde » ou « avenant ».
function ledgerFromContract(row, content, paymentType, avenantNum) {
  const c = content && typeof content === "object" ? content : {};
  const form = c.form && typeof c.form === "object" ? c.form : {};
  const title = String(row.title || form.missionTitle || c.missionTitle || "").trim();
  let kind, label, invoice;
  if (paymentType === "solde") {
    kind = "solde"; label = "Solde"; invoice = c.soldeInvoiceNumber;
  } else if (paymentType === "avenant") {
    kind = "avenant"; label = `Avenant n°${avenantNum}`;
    const av = (Array.isArray(c.avenants) ? c.avenants : []).find((a) => a && String(a.num) === String(avenantNum));
    invoice = av?.invoiceNumber;
  } else if (c.isStandaloneInvoice) {
    kind = "facture"; label = "Facture"; invoice = c.acompteInvoiceNumber;
  } else {
    kind = "acompte"; label = ledgerAcompteLabel(form); invoice = c.acompteInvoiceNumber;
  }
  const client = String(c.clientCompany || form.clientCompany || c.clientName || form.clientName || "").trim();
  return {
    user_id: row.user_id,
    contract_id: row.id,
    kind,
    avenant_num: kind === "avenant" ? Number(avenantNum) : null,
    client: client.slice(0, 200),
    nature: (title ? `${label} — ${title}` : label).slice(0, 300),
    invoice_number: invoice ? String(invoice).slice(0, 40) : null,
  };
}

// Paiement sans contrat (lien Freeley d'une lettre de recouvrement…) : le libellé du lien
function ledgerFromLink(link, session) {
  const details = session?.customer_details || {};
  return {
    user_id: link.user_id,
    contract_id: null,
    kind: "autre",
    avenant_num: null,
    client: String(details.name || link.customer_email || details.email || "").trim().slice(0, 200),
    nature: String(link.description || "Paiement par carte").trim().slice(0, 300),
    invoice_number: null,
  };
}

// Écrit la ligne. replace = true (message de Stripe) : il fait foi et remplace une ligne notée par une vérification de
// secours ; sinon, une ligne déjà là est gardée telle quelle. Un prélèvement compte le jour où il est encaissé (delayed).
async function ledgerSave(base, { session, facts = null, eventSeconds = null, delayed = false, replace = false }) {
  const amount = Number(session?.amount_total);
  if (!base?.user_id || !Number.isInteger(amount) || amount <= 0 || !LEDGER_SESSION_ID.test(String(session?.id || ""))) return "ledger_skipped";
  const { method, note } = ledgerMethod(facts?.type || null, session, delayed);
  const row = {
    ...base,
    received_on: ledgerParisDay(delayed ? (eventSeconds || facts?.paidAt) : (facts?.paidAt || eventSeconds)),
    amount_cents: amount,
    method,
    note,
    source: "stripe",
    source_key: `stripe:${session.id}`,
    stripe_ref: facts?.ref || (typeof session.payment_intent === "string" ? session.payment_intent : null) || session.id,
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase.from("recettes").upsert(row, { onConflict: "user_id,source_key", ignoreDuplicates: !replace });
  if (error) {
    const message = String(error.message || "");
    // Script SQL v234 pas encore lancé : le paiement reste enregistré dans le contrat
    if (error.code === "42P01" || error.code === "PGRST205" || (/recettes/.test(message) && /does not exist|schema cache/.test(message))) return "ledger_missing";
    console.error("[livre des recettes] ligne non enregistrée", error);
    return "ledger_error";
  }
  return "ledger_saved";
}

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
    .from("contracts").select("id, user_id, title, content").eq("id", contractId).maybeSingle();
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
    if (avenants[idx].paymentReceived === true) return { result: "avenant_already_paid", row, content };
    avenants[idx] = { ...avenants[idx], paymentReceived: true };
    const newContent = JSON.stringify({ ...content, avenants });
    const { data: saved, error: saveError } = await supabase
      .from("contracts").update({ content: newContent }).eq("id", contractId).select("id");
    if (saveError) { console.error("[stripe-webhook] avenant payé mais pas enregistré", saveError); return { retry: true }; }
    if (!Array.isArray(saved) || saved.length === 0) return { result: "ignored_unknown_contract" };
    return { result: "avenant_paid", row, content };
  }

  // Solde, ou bien acompte / paiement comptant du contrat
  const column = meta.paymentType === "solde" ? "solde_status" : "payment_status";
  const { data: saved, error: saveError } = await supabase
    .from("contracts").update({ [column]: "paid" }).eq("id", contractId).select("id");
  if (saveError) { console.error("[stripe-webhook] paiement reçu mais pas enregistré", saveError); return { retry: true }; }
  if (!Array.isArray(saved) || saved.length === 0) return { result: "ignored_unknown_contract" };
  return { result: column === "solde_status" ? "solde_paid" : "contract_paid", row, content: parseContent(row.content) };
}

// Version 232 : lien permanent payé (table payment_links). Sans gravité si cela échoue : à la visite suivante,
// api/pay.js vérifie de toute façon auprès de Stripe si le dernier paiement du lien a été payé.
// Version 234 : renvoie aussi le lien (seulement s'il appartient bien au compte Stripe qui a reçu le paiement), pour le
// livre des recettes d'un paiement sans contrat.
async function markPaymentLinkPaid(event) {
  const session = event.data?.object || {};
  const linkId = String(session.metadata?.payLinkId || "").trim();
  const account = typeof event.account === "string" ? event.account : "";
  if (!UUID.test(linkId) || session.payment_status !== "paid" || !account) return { status: "no_link" };
  const { data: link, error: linkError } = await supabase.from("payment_links").select("id, user_id, paid_at, description, customer_email").eq("id", linkId).maybeSingle();
  if (linkError) { console.error("[stripe-webhook] lien permanent illisible", linkError); return { status: "link_error" }; }
  if (!link) return { status: "link_unknown" };
  const { data: profile, error: profileError } = await supabase.from("profiles").select("stripe_connect_account_id").eq("id", link.user_id).maybeSingle();
  if (profileError) { console.error("[stripe-webhook] lecture du profil impossible (lien)", profileError); return { status: "link_error" }; }
  if (!profile || profile.stripe_connect_account_id !== account) return { status: "link_other_account" };
  if (link.paid_at) return { status: "link_already_paid", link };
  const { error } = await supabase.from("payment_links").update({ paid_at: new Date().toISOString() }).eq("id", linkId);
  if (error) { console.error("[stripe-webhook] lien permanent non marqué payé", error); return { status: "link_error", link }; }
  return { status: "link_paid", link };
}

// Version 234 : ligne du livre des recettes pour ce paiement (contrat, ou lien sans contrat)
async function recordLedger(event, outcome, linkOutcome) {
  const session = event.data?.object || {};
  if (session.payment_status !== "paid") return "ledger_skipped";
  const meta = session.metadata || {};
  let base = null;
  if (outcome.row) base = ledgerFromContract(outcome.row, outcome.content || {}, meta.paymentType, String(meta.avenantNum ?? "").trim());
  else if (outcome.result === "ignored_no_contract" && linkOutcome.link) base = ledgerFromLink(linkOutcome.link, session);
  if (!base) return "ledger_skipped";
  const account = typeof event.account === "string" ? event.account : "";
  const facts = await ledgerStripeFacts(session.id, account);
  return ledgerSave(base, { session, facts, eventSeconds: event.created, delayed: event.type === "checkout.session.async_payment_succeeded", replace: true });
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
    let linkOutcome = { status: "no_link" };
    try { linkOutcome = await markPaymentLinkPaid(event); } catch (e) { console.error("[stripe-webhook] lien permanent", e); linkOutcome = { status: "link_error" }; }
    const link = linkOutcome.status;
    const outcome = await recordPayment(event);
    if (outcome.retry) return res.status(500).json({ received: false, error: "Enregistrement impossible pour le moment" });
    // Un paiement sans contrat (lettre de recouvrement d'un autre dossier) est normal quand il vient d'un lien Freeley
    if (String(outcome.result).startsWith("ignored") && !(outcome.result === "ignored_no_contract" && (link === "link_paid" || link === "link_already_paid"))) {
      console.warn("[stripe-webhook]", outcome.result, event.id);
    }
    // Version 234 : livre des recettes. Un échec ne fait pas renvoyer le message : le paiement est déjà enregistré.
    let ledger = "ledger_skipped";
    try { ledger = await recordLedger(event, outcome, linkOutcome); } catch (e) { console.error("[stripe-webhook] livre des recettes", e); ledger = "ledger_error"; }
    return res.status(200).json({ received: true, result: outcome.result, link, ledger });
  } catch (e) {
    console.error("[stripe-webhook] Erreur mise à jour paiement:", e);
    return res.status(500).json({ received: false, error: "Erreur interne" });
  }
}
