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
// Version 234 : un paiement trouvé ici est aussi noté dans le livre des recettes du freelance (sauf s'il y est déjà).
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
      .from("contracts").select(`id, user_id, title, content, ${kind.sessionColumn}, ${kind.statusColumn}`).eq("id", contractId).maybeSingle();
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
    // Version 234 : livre des recettes (une ligne déjà notée par le message de Stripe est gardée telle quelle)
    try {
      const base = ledgerFromContract(row, ledgerContent(row.content), kindName, null);
      await ledgerSave(base, { session, facts: await ledgerStripeFacts(sessionId, accountId) });
    } catch (e) { console.error("[check-payment] livre des recettes", e); }
    return res.status(200).json({ paid: true });
  } catch (err) {
    console.error("[check-payment] Erreur:", err);
    return res.status(500).json({ error: err.message });
  }
}
