// api/pay.js — lien de paiement par carte qui n'expire pas (version 232).
//
// Un lien de paiement Stripe (Checkout) expire au bout de 24 heures. Une facture, une relance ou une lettre de
// recouvrement sont pourtant souvent payées plusieurs jours après. Le client reçoit donc un lien Freeley :
//   https://www.freeley.fr/api/pay?l=<numéro du lien>
// À chaque visite, ce lien :
//   - affiche « paiement déjà reçu » si le paiement a déjà été fait (ou « contrat annulé » après une rétractation) ;
//   - reprend le paiement Stripe déjà ouvert s'il est encore valable, sinon en ouvre un nouveau, pour le même montant,
//     sur le compte Stripe du freelance (jamais sur celui de Freeley) ;
//   - envoie le client sur la page de paiement sécurisée de Stripe.
// Les liens sont enregistrés par api/create-payment.js dans la table payment_links (script SQL v232). Seul le
// serveur peut lire et écrire cette table : le numéro du lien ne donne accès à rien d'autre qu'au paiement.
//
// Version 234 : quand la visite trouve le paiement fait (message de Stripe pas encore arrivé), il est aussi noté dans le
// livre des recettes du freelance (sauf s'il y est déjà).
//
// Variables d'environnement : STRIPE_SECRET_KEY, VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const SITE_URL = "https://www.freeley.fr";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SESSION_ID = /^cs_(test|live)_[A-Za-z0-9]{10,200}$/;
// Réponses de Stripe qui veulent dire : ce compte n'existe pas (ou plus) pour cette clé
const ACCOUNT_GONE = new Set(["account_invalid", "resource_missing", "livemode_mismatch"]);
// Colonnes du contrat, selon ce que le client paie (comme api/create-payment.js et api/check-payment.js)
const SESSION_COLUMN = { contract: "stripe_session_id", solde: "solde_stripe_session_id" };
const STATUS_COLUMN = { contract: "payment_status", solde: "solde_status" };

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

function parseContent(raw) {
  if (!raw) return {};
  if (typeof raw === "string") {
    try { return JSON.parse(raw) || {}; } catch (e) { return {}; }
  }
  return raw;
}

const escapeHtml = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const euros = (cents) => (Number(cents || 0) / 100).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/[  ]/g, " ");

// Petite page pour le client (pas de lien Stripe à montrer) : déjà payé, contrat annulé, lien introuvable…
function sendPage(res, status, title, message, link = null) {
  const detail = link ? `<p class="detail">${escapeHtml(link.description)} · ${escapeHtml(euros(link.amount_cents))} €</p>` : "";
  const html = `<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex"><title>${escapeHtml(title)} — Freeley</title>
<style>
body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#F5F1E8;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;color:#1B2E4B;padding:24px 16px;box-sizing:border-box}
.card{background:#fff;border-radius:14px;padding:26px 22px;max-width:440px;width:100%;box-shadow:0 4px 24px rgba(27,46,75,.08);text-align:center}
.brand{font-family:Georgia,serif;font-size:22px;font-weight:700;margin-bottom:18px}
h1{font-size:18px;margin:0 0 10px}
p{font-size:14px;line-height:1.6;color:#5A6B80;margin:0}
.detail{margin-top:12px;font-size:13px;color:#1B2E4B}
</style></head>
<body><div class="card"><div class="brand">Freeley</div><h1>${escapeHtml(title)}</h1><p>${escapeHtml(message)}</p>${detail}</div></body></html>`;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Robots-Tag", "noindex");
  return res.status(status).end(html);
}

function redirect(res, url) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Location", url);
  return res.status(303).end();
}

async function stripe(path, accountId, params = null) {
  const response = await fetch(`https://api.stripe.com${path}`, {
    method: params ? "POST" : "GET",
    headers: {
      "Authorization": `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      "Stripe-Account": accountId,
      ...(params ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
    },
    ...(params ? { body: params.toString() } : {}),
  });
  let data = {};
  try { data = (await response.json()) || {}; } catch (e) { /* réponse illisible */ }
  return { ok: response.ok, status: response.status, data };
}

const PAID_TITLE = "Paiement déjà reçu";
const PAID_TEXT = "Ce paiement a déjà été effectué. Merci ! Vous n'avez rien d'autre à faire.";
const UNAVAILABLE_TITLE = "Paiement par carte indisponible";
const UNAVAILABLE_TEXT = "Le paiement par carte n'est pas disponible pour le moment. Vous pouvez payer par virement, avec les coordonnées bancaires indiquées sur la facture, ou contacter votre prestataire.";

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET");
    return res.status(405).end("Method Not Allowed");
  }
  const linkId = String(req.query?.l || "").trim();
  if (!UUID.test(linkId)) {
    return sendPage(res, 404, "Lien de paiement introuvable", "Ce lien de paiement n'existe pas. Vérifiez qu'il est complet, ou contactez votre prestataire.");
  }

  try {
    const { data: link, error: linkError } = await supabase.from("payment_links").select("*").eq("id", linkId).maybeSingle();
    if (linkError) {
      console.error("[pay] lecture du lien impossible", linkError);
      return sendPage(res, 500, "Paiement momentanément indisponible", "Réessayez dans quelques minutes.");
    }
    if (!link) {
      return sendPage(res, 404, "Lien de paiement introuvable", "Ce lien de paiement n'existe pas ou n'est plus valable. Contactez votre prestataire.");
    }
    if (link.paid_at) return sendPage(res, 200, PAID_TITLE, PAID_TEXT, link);

    // Paiement relié à un contrat : déjà payé (même autrement, par exemple par virement) ? contrat annulé ?
    const kind = link.kind;
    let contract = null;
    if (kind !== "other") {
      if (link.contract_id) {
        const { data: row, error: contractError } = await supabase.from("contracts")
          .select("id, user_id, title, content, payment_status, solde_status").eq("id", link.contract_id).maybeSingle();
        if (contractError) {
          console.error("[pay] lecture du contrat impossible", contractError);
          return sendPage(res, 500, "Paiement momentanément indisponible", "Réessayez dans quelques minutes.");
        }
        contract = row && row.user_id === link.user_id ? row : null;
      }
      if (!contract) {
        return sendPage(res, 404, "Lien de paiement introuvable", "Ce lien de paiement n'est plus valable. Contactez votre prestataire.");
      }
      const content = parseContent(contract.content);
      if (content.retractationExercisedAtServer || content.retractationExercisedAt) {
        return sendPage(res, 410, "Contrat annulé", "Ce contrat a été annulé à la suite de votre rétractation : aucun paiement n'est dû.");
      }
      const avenant = kind === "avenant"
        ? (Array.isArray(content.avenants) ? content.avenants : []).find((a) => a && String(a.num) === String(link.avenant_num))
        : null;
      const alreadyPaid = kind === "avenant" ? avenant?.paymentReceived === true : contract[STATUS_COLUMN[kind]] === "paid";
      if (alreadyPaid) return sendPage(res, 200, PAID_TITLE, PAID_TEXT, link);
    }

    // Aperçu d'un lien (messagerie, vérification de sécurité) : on ne crée aucun paiement
    if (req.method === "HEAD") return res.status(200).end();

    // Compte Stripe du freelance, lu dans son profil
    const { data: profile, error: profileError } = await supabase.from("profiles")
      .select("stripe_connect_account_id").eq("id", link.user_id).maybeSingle();
    if (profileError) {
      console.error("[pay] lecture du profil impossible", profileError);
      return sendPage(res, 500, "Paiement momentanément indisponible", "Réessayez dans quelques minutes.");
    }
    const accountId = profile?.stripe_connect_account_id;
    if (!accountId) return sendPage(res, 503, UNAVAILABLE_TITLE, UNAVAILABLE_TEXT, link);

    const accountGone = async () => {
      const { error } = await supabase.from("profiles").update({ stripe_connect_ready: false }).eq("id", link.user_id);
      if (error) console.error("[pay] état Stripe non enregistré", error);
      return sendPage(res, 503, UNAVAILABLE_TITLE, UNAVAILABLE_TEXT, link);
    };

    // Le dernier paiement Stripe ouvert pour ce lien : payé ? encore ouvert ? sinon on en ouvre un nouveau
    if (link.last_session_id && SESSION_ID.test(link.last_session_id)) {
      const last = await stripe(`/v1/checkout/sessions/${encodeURIComponent(link.last_session_id)}`, accountId);
      if (!last.ok && ACCOUNT_GONE.has(last.data?.error?.code) && last.data?.error?.code !== "resource_missing") return accountGone();
      // Seulement un paiement ouvert pour CE lien (il porte son numéro)
      if (last.ok && last.data?.metadata?.payLinkId === link.id) {
        const s = last.data || {};
        if (s.status === "complete" && s.payment_status === "paid") {
          const nowIso = new Date().toISOString();
          const { error: paidError } = await supabase.from("payment_links").update({ paid_at: nowIso }).eq("id", link.id);
          if (paidError) console.error("[pay] lien payé non enregistré", paidError);
          // Même chose que la vérification de secours (api/check-payment) pour l'acompte et le solde
          if (contract && STATUS_COLUMN[kind] && s.metadata?.contractId === link.contract_id && (s.metadata?.paymentType || "contract") === kind) {
            const { error } = await supabase.from("contracts").update({ [STATUS_COLUMN[kind]]: "paid" }).eq("id", link.contract_id);
            if (error) console.error("[pay] paiement non enregistré dans le contrat", error);
          }
          // Avenant : seulement cet avenant passe en « payé », comme le fait api/stripe-webhook.js
          if (contract && kind === "avenant" && s.metadata?.contractId === link.contract_id && s.metadata?.paymentType === "avenant"
            && String(s.metadata?.avenantNum ?? "") === String(link.avenant_num ?? "")) {
            const content = parseContent(contract.content);
            const avenants = Array.isArray(content.avenants) ? content.avenants.slice() : [];
            const idx = avenants.findIndex((a) => a && String(a.num) === String(link.avenant_num));
            if (idx !== -1 && avenants[idx].paymentReceived !== true) {
              avenants[idx] = { ...avenants[idx], paymentReceived: true };
              const { error } = await supabase.from("contracts").update({ content: JSON.stringify({ ...content, avenants }) }).eq("id", link.contract_id);
              if (error) console.error("[pay] avenant payé mais pas enregistré", error);
            }
          }
          // Version 234 : livre des recettes (une ligne déjà notée par le message de Stripe est gardée telle quelle)
          try {
            const meta = s.metadata || {};
            let base = null;
            if (kind === "other") base = ledgerFromLink(link, s);
            else if (contract && meta.contractId === link.contract_id && (meta.paymentType || "contract") === kind
              && (kind !== "avenant" || String(meta.avenantNum ?? "") === String(link.avenant_num ?? ""))) {
              base = ledgerFromContract(contract, parseContent(contract.content), kind, link.avenant_num);
            }
            if (base) await ledgerSave(base, { session: s, facts: await ledgerStripeFacts(s.id, accountId) });
          } catch (e) { console.error("[pay] livre des recettes", e); }
          return sendPage(res, 200, PAID_TITLE, PAID_TEXT, link);
        }
        if (s.status === "complete") {
          return sendPage(res, 200, "Paiement en cours", "Votre paiement est en cours de traitement par votre banque. Vous n'avez rien d'autre à faire.", link);
        }
        if (s.status === "open" && s.url && Number(s.amount_total) === Number(link.amount_cents)) return redirect(res, s.url);
      }
    }

    // Nouveau paiement Stripe Checkout, sur le compte du freelance (mêmes réglages que api/create-payment.js)
    const params = new URLSearchParams();
    params.append("mode", "payment");
    params.append("line_items[0][price_data][currency]", "eur");
    params.append("line_items[0][price_data][product_data][name]", String(link.description || "Paiement Freeley").slice(0, 200) || "Paiement Freeley");
    params.append("line_items[0][price_data][unit_amount]", String(link.amount_cents));
    params.append("line_items[0][quantity]", "1");
    params.append("success_url", `${SITE_URL}/?paiement=succes`);
    params.append("cancel_url", `${SITE_URL}/?paiement=annule`);
    const email = String(link.customer_email || "").trim();
    if (email && email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) params.append("customer_email", email);
    const metadata = { freeleyUserId: link.user_id, payLinkId: link.id };
    if (kind !== "other") {
      metadata.contractId = link.contract_id;
      metadata.paymentType = kind;
      if (kind === "avenant") metadata.avenantNum = String(link.avenant_num || "");
    }
    Object.entries(metadata).forEach(([key, value]) => params.append(`metadata[${key}]`, String(value)));

    const created = await stripe("/v1/checkout/sessions", accountId, params);
    if (!created.ok || !created.data?.url) {
      console.error("[pay] Stripe a refusé le paiement", created.data);
      if (ACCOUNT_GONE.has(created.data?.error?.code)) return accountGone();
      return sendPage(res, 502, "Paiement momentanément indisponible", "Le service de paiement ne répond pas. Réessayez dans quelques minutes, ou payez par virement avec les coordonnées de la facture.", link);
    }
    const sessionId = created.data.id;
    const { error: saveError } = await supabase.from("payment_links").update({ last_session_id: sessionId }).eq("id", link.id);
    if (saveError) console.error("[pay] paiement Stripe non enregistré sur le lien", saveError);
    // Pour la vérification de secours (api/check-payment) de l'acompte et du solde
    if (contract && SESSION_COLUMN[kind]) {
      const { error } = await supabase.from("contracts").update({ [SESSION_COLUMN[kind]]: sessionId }).eq("id", link.contract_id);
      if (error) console.error("[pay] numéro du paiement non enregistré dans le contrat", error);
    }
    return redirect(res, created.data.url);
  } catch (e) {
    console.error("[pay] Erreur:", e);
    return sendPage(res, 500, "Paiement momentanément indisponible", "Réessayez dans quelques minutes.");
  }
}
