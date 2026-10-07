// /api/retraction.js
//
// Un seul fichier pour toutes les tâches serveur liées aux contrats signés (limite de 12 fonctions
// sur le plan gratuit de Vercel). Le front-end appelle "/api/retraction" avec un champ "action" :
//   - action: "confirm"   → un client confirme sa rétractation (accusé de réception + notification freelance)
//   - action: "find"      → un client cherche son contrat perdu par email
//   - action: "stamp-waiver" → enregistre la date serveur de la case cochée par le client
//   - action: "send-link" → juste après la signature du client (en présence OU à distance) :
//                           envoi automatique de la CONFIRMATION DU CONTRAT sur support durable (email),
//                           avec le texte du contrat, et pour un client particulier l'information officielle
//                           sur la rétractation + le formulaire officiel. La date d'envoi est enregistrée
//                           par le serveur (horloge serveur), une seule fois par contrat.
//
// Variables d'environnement : VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY.
// Version 202 : lecture du contrat sans la colonne contract_text (qui n'existe pas), et un email
// refusé par Resend n'est plus jamais enregistré comme envoyé.
//
// ⚠️ Les textes officiels ci-dessous (information sur la rétractation, formulaire) existent aussi dans
// contrat-freelance.jsx (buildRetractationNotice / buildRetractationForm). Si tu modifies l'un, modifie l'autre.

import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "Freeley <contact@freeley.fr>";
const SITE_URL = process.env.SITE_URL || "https://freeley.fr";

function parseContent(row) {
  if (typeof row !== "string") return row || {};
  try { return JSON.parse(row); } catch (e) { console.error("retraction: contenu illisible", e); return {}; }
}

// Le SDK Resend ne lève pas d'exception quand l'envoi est refusé (domaine non vérifié, adresse
// invalide, quota…) : il renvoie { data, error }. On transforme ce refus en erreur pour ne jamais
// enregistrer comme "envoyé" un email qui n'est pas parti.
async function sendMail(msg) {
  const { data, error } = await resend.emails.send(msg);
  if (error) throw new Error(error.message || "Envoi refusé par Resend");
  return data;
}

// ── Textes officiels (Code de la consommation), repris mot pour mot ──
// Information : annexe à l'article R221-3. Formulaire : annexe à l'article R221-1.
function coords(f = {}) {
  return [f.freelanceName, f.freelanceAddress, f.freelancePhone, f.freelanceEmail]
    .map(s => (s || "").trim()).filter(Boolean).join(", ");
}

function buildNotice(f = {}, where) {
  const parts = [
    "Droit de rétractation",
    "Vous avez le droit de vous rétracter du présent contrat sans donner de motif dans un délai de quatorze jours.",
    "Le délai de rétractation expire quatorze jours après le jour de la conclusion du contrat.",
    `Pour exercer le droit de rétractation, vous devez nous notifier (${coords(f)}) votre décision de rétractation du présent contrat au moyen d'une déclaration dénuée d'ambiguïté (par exemple, lettre envoyée par la poste ou courrier électronique). Vous pouvez utiliser le modèle de formulaire de rétractation mais ce n'est pas obligatoire.`,
    `Vous pouvez également exercer votre droit de rétractation en ligne sur ${where}. Si vous utilisez cette fonctionnalité en ligne, nous vous enverrons, dans les meilleurs délais, un accusé de réception de la rétractation sur un support durable (par exemple, par courriel), y compris son contenu ainsi que la date et l'heure de sa soumission.`,
    "Pour que le délai de rétractation soit respecté, il suffit que vous transmettiez votre communication relative à l'exercice du droit de rétractation avant l'expiration du délai de rétractation.",
    "Effets de rétractation",
    "En cas de rétractation de votre part du présent contrat, nous vous rembourserons tous les paiements reçus de vous, y compris les frais de livraison (à l'exception des frais supplémentaires découlant du fait que vous avez choisi, le cas échéant, un mode de livraison autre que le mode moins coûteux de livraison standard proposé par nous) sans retard excessif et, en tout état de cause, au plus tard quatorze jours à compter du jour où nous sommes informés de votre décision de rétractation du présent contrat. Nous procéderons au remboursement en utilisant le même moyen de paiement que celui que vous aurez utilisé pour la transaction initiale, sauf si vous convenez expressément d'un moyen différent ; en tout état de cause, ce remboursement n'occasionnera pas de frais pour vous.",
  ];
  if (!f.contenuNumeriquePret) {
    parts.push("Si vous avez demandé de commencer la prestation de services pendant le délai de rétractation, vous devrez nous payer un montant proportionnel à ce qui vous a été fourni jusqu'au moment où vous nous avez informé de votre rétractation du présent contrat, par rapport à l'ensemble des prestations prévues par le contrat.");
  }
  return parts.join("\n\n");
}

function buildForm(f = {}) {
  return [
    "Modèle de formulaire de rétractation",
    "(Veuillez compléter et renvoyer le présent formulaire uniquement si vous souhaitez vous rétracter du contrat.)",
    `A l'attention de ${coords(f)} :`,
    "Je/nous (*) vous notifie/notifions (*) par la présente ma/notre (*) rétractation du contrat portant sur la vente du bien (*)/pour la prestation de services (*) ci-dessous :",
    "Commandé le (*)/reçu le (*) :",
    "Nom du (des) consommateur(s) :",
    "Adresse du (des) consommateur(s) :",
    "Signature du (des) consommateur(s) (uniquement en cas de notification du présent formulaire sur papier) :",
    "Date :",
    "(*) Rayez la mention inutile.",
  ].join("\n\n");
}

async function saveContent(contractId, newContent, status) {
  try {
    const { error } = await supabase.rpc("update_contract_content", {
      p_contract_id: contractId,
      p_new_content: JSON.stringify(newContent),
      p_new_status: status,
    });
    if (error) console.error("retraction: échec enregistrement", error);
  } catch (e) { console.error("retraction: échec enregistrement", e); }
}

async function getFreelanceAuthEmail(userId) {
  if (!userId) return null;
  try {
    const { data } = await supabase.auth.admin.getUserById(userId);
    return data?.user?.email || null;
  } catch (e) {
    console.error("retraction: email freelance introuvable", e);
    return null;
  }
}

// ── action: "confirm" — accusé de réception client + notification freelance ──
async function handleConfirm(contractId) {
  const { data: row, error } = await supabase
    .from("contracts")
    .select("content, user_id, status")
    .eq("id", contractId)
    .single();
  if (error || !row) return { status: 404, body: { error: "Contrat introuvable" } };

  const content = parseContent(row.content);
  if (content.retractationExercisedAtServer) return { status: 200, body: { ok: true, alreadyConfirmed: true } };
  const form = content.form || {};
  const clientEmail = form.clientEmail || content.clientEmail || "";
  const clientName = form.clientName || content.clientName || "";
  const freelanceName = form.freelanceName || "votre prestataire";
  const missionTitle = content.missionTitle || form.missionTitle || "votre mission";
  const exercisedAt = new Date().toISOString(); // horloge du serveur, au moment où la demande arrive
  const dateStr = new Date(exercisedAt).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short", timeZone: "Europe/Paris" });

  const freelanceEmail = (await getFreelanceAuthEmail(row.user_id)) || form.freelanceEmail || null;
  const results = { clientEmailSent: false, freelanceEmailSent: false };

  if (clientEmail) {
    try {
      await sendMail({
        from: FROM, to: clientEmail,
        subject: `Accusé de réception de votre rétractation — ${missionTitle}`,
        text: `Bonjour ${clientName},\n\nNous accusons réception de votre rétractation, soumise en ligne le ${dateStr}.\n\nContenu de votre demande : rétractation du contrat « ${missionTitle} » conclu avec ${freelanceName}.\n\nCet email constitue votre accusé de réception sur un support durable. Le contrat est annulé à compter de cette date.\n\nCordialement,\n${freelanceName}\n(message envoyé par Freeley pour le compte de ${freelanceName})`,
      });
      results.clientEmailSent = true;
    } catch (e) { console.error("retraction/confirm: échec email client", e); }
  }

  if (freelanceEmail) {
    try {
      await sendMail({
        from: FROM, to: freelanceEmail,
        subject: `Un client s'est rétracté — ${missionTitle}`,
        text: `Bonjour,\n\n${clientName || "Votre client"} a exercé son droit de rétractation le ${dateStr} pour la mission « ${missionTitle} ».\n\n${results.clientEmailSent ? "Un accusé de réception lui a été envoyé automatiquement." : "Attention : l'accusé de réception automatique n'a pas pu lui être envoyé. Envoie-lui toi-même, dès maintenant, un email confirmant que tu as bien reçu sa rétractation, avec la date et l'heure ci-dessus."}\n\nSi une partie de la prestation a déjà été réalisée à sa demande expresse, pense à établir la facturation proportionnelle correspondante. Tu dois rembourser les sommes reçues dans les 14 jours.\n\nCordialement,\nFreeley`,
      });
      results.freelanceEmailSent = true;
    } catch (e) { console.error("retraction/confirm: échec email freelance", e); }
  }

  await saveContent(contractId, { ...content, retractationExercisedAtServer: exercisedAt }, row.status);
  return { status: 200, body: { ok: true, ...results } };
}

// ── action: "stamp-waiver" — date serveur de la case cochée par le client ──
async function handleStampWaiver(contractId) {
  const { data: row, error } = await supabase.from("contracts").select("content, status").eq("id", contractId).single();
  if (error || !row) return { status: 404, body: { error: "Contrat introuvable" } };
  const content = parseContent(row.content);
  if (!content.retractationWaivedAt || content.retractationWaivedAtServer) return { status: 200, body: { ok: true, stamped: false } };
  await saveContent(contractId, { ...content, retractationWaivedAtServer: new Date().toISOString() }, row.status);
  return { status: 200, body: { ok: true, stamped: true } };
}

// ── action: "find" — retrouver un contrat perdu par email, toujours même réponse ──
async function handleFind(email) {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: 200, body: { ok: true } };
  }
  try {
    const { data: rows } = await supabase.from("contracts").select("id, content").eq("status", "signed");
    const emailLower = email.trim().toLowerCase();
    const matches = (rows || []).filter(r => {
      const c = parseContent(r.content);
      return (c.form?.clientEmail || c.clientEmail || "").toLowerCase() === emailLower;
    });
    for (const m of matches) {
      const c = parseContent(m.content);
      const link = `${SITE_URL}/?sign=${m.id}`;
      const missionTitle = c.missionTitle || c.form?.missionTitle || "";
      try {
        await sendMail({
          from: FROM, to: email,
          subject: `Retrouve ton contrat — ${missionTitle}`,
          text: `Bonjour,\n\nVoici le lien vers ton contrat « ${missionTitle} » :\n${link}\n\nCordialement,\nFreeley`,
        });
      } catch (e) { console.error("retraction/find: échec email pour", m.id, e); }
    }
  } catch (e) {
    console.error("retraction/find: erreur de recherche", e);
  }
  return { status: 200, body: { ok: true } };
}

// ── action: "send-link" — confirmation du contrat sur support durable, juste après la signature ──
async function handleSendLink(contractId) {
  const { data: row, error } = await supabase
    .from("contracts")
    .select("content, user_id, status")
    .eq("id", contractId)
    .single();
  if (error || !row) return { status: 404, body: { error: "Contrat introuvable" } };
  if (row.status !== "signed") return { status: 200, body: { ok: true, sent: false, reason: "not_signed" } };

  const content = parseContent(row.content);
  if (content.contractConfirmationSentAt) return { status: 200, body: { ok: true, sent: false, reason: "already_sent" } };

  const form = { ...(content.form || {}) };
  if (!form.freelanceEmail) form.freelanceEmail = (await getFreelanceAuthEmail(row.user_id)) || "";
  const clientEmail = form.clientEmail || content.clientEmail || "";
  if (!clientEmail) return { status: 200, body: { ok: true, sent: false, reason: "no_client_email" } };

  const clientName = form.clientName || content.clientName || "";
  const freelanceName = form.freelanceName || "votre prestataire";
  const missionTitle = content.missionTitle || form.missionTitle || "votre mission";
  const isParticulier = form.typeClient === "particulier";
  const isDigital = !!form.contenuNumeriquePret;
  const link = `${SITE_URL}/?sign=${contractId}`;
  const fmt = (iso) => new Date(iso).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short", timeZone: "Europe/Paris" });
  const nowIso = new Date().toISOString(); // appelé juste après la signature : horloge serveur
  const signedStr = fmt(content.signedByClientAtServer || nowIso);
  const waivedAt = content.retractationWaivedAtServer || content.retractationWaivedAt;
  const contractText = (content.contract || "").trim();

  const blocks = [
    `Bonjour ${clientName},`,
    `Ce courriel constitue la confirmation, sur un support durable, de votre contrat « ${missionTitle} » conclu avec ${freelanceName} et signé le ${signedStr}.`,
    `Vous pouvez consulter votre contrat à tout moment sur cette page :\n${link}`,
  ];

  if (isParticulier && waivedAt && content.retractationWaiverText) {
    blocks.push(`Votre demande du ${fmt(waivedAt)} (texte que vous avez coché) :\n« ${content.retractationWaiverText} »`);
    if (isDigital) {
      // Confirmation exigée pour un contenu numérique (texte relu par une juriste)
      const waivedDate = new Date(waivedAt).toLocaleDateString("fr-FR", { timeZone: "Europe/Paris" });
      blocks.push(`À la suite de votre accord exprès donné le ${waivedDate}, nous vous confirmons que vous avez consenti à ce que la fourniture du contenu numérique “${missionTitle}” commence avant l'expiration du délai de rétractation de quatorze (14) jours et que vous avez reconnu qu'en conséquence vous perdrez votre droit de rétractation dès le commencement de cette exécution.`);
    }
  }

  if (isParticulier) {
    blocks.push("────────────────────────────");
    blocks.push(buildNotice(form, link));
    blocks.push("────────────────────────────");
    blocks.push(buildForm(form));
  }

  if (contractText) {
    blocks.push("────────────────────────────");
    blocks.push(`TEXTE DU CONTRAT\n\n${contractText}`);
  }

  blocks.push(`Cordialement,\n${freelanceName}\n(message envoyé par Freeley pour le compte de ${freelanceName})`);

  try {
    await sendMail({
      from: FROM, to: clientEmail,
      subject: `Confirmation de votre contrat — ${missionTitle}`,
      text: blocks.join("\n\n"),
    });
  } catch (e) {
    console.error("retraction/send-link: échec envoi email", e);
    return { status: 500, body: { error: "Erreur envoi email" } };
  }

  // Enregistrement de la date d'envoi avec l'horloge du serveur (preuve). Pour un contenu numérique avec
  // accord du client, cet email vaut aussi confirmation de l'accord : l'alerte côté freelance disparaît.
  const newContent = { ...content, contractConfirmationSentAt: nowIso };
  if (!content.signedByClientAtServer) newContent.signedByClientAtServer = nowIso;
  if (isParticulier && isDigital && content.retractationWaivedAt && !content.retractationConfirmationSentAt) {
    newContent.retractationConfirmationSentAt = nowIso;
  }
  await saveContent(contractId, newContent, row.status);

  return { status: 200, body: { ok: true, sent: true } };
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { action, contractId, email } = req.body || {};
  let result;

  if (action === "confirm") {
    if (!contractId) return res.status(400).json({ error: "contractId manquant" });
    result = await handleConfirm(contractId);
  } else if (action === "find") {
    result = await handleFind(email);
  } else if (action === "stamp-waiver") {
    if (!contractId) return res.status(400).json({ error: "contractId manquant" });
    result = await handleStampWaiver(contractId);
  } else if (action === "send-link") {
    if (!contractId) return res.status(400).json({ error: "contractId manquant" });
    result = await handleSendLink(contractId);
  } else {
    return res.status(400).json({ error: "action inconnue" });
  }

  return res.status(result.status).json(result.body);
}
