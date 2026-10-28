// /api/retraction.js
//
// Un seul fichier pour toutes les tâches serveur liées aux contrats signés (limite de 12 fonctions
// sur le plan gratuit de Vercel). Le front-end appelle "/api/retraction" avec un champ "action" :
//   - action: "confirm"   → un client confirme sa rétractation (accusé de réception + notification freelance)
//   - action: "find"      → un client cherche son contrat perdu par email
//   - action: "stamp-waiver" → enregistre la date serveur de la case cochée par le client
//   - action: "client-waive" → le client coche la case de démarrage anticipé (enregistrée par le serveur)
//   - action: "client-sign"  → le client signe à distance (enregistrée par le serveur, puis confirmation)
//   - action: "stamp-early-payment" → heure serveur de la réponse du freelance qui demande un paiement
//                           pendant les 7 jours d'un contrat hors établissement (art. L221-10)
//   - action: "send-link" → juste après la signature du client (en présence OU à distance) :
//                           envoi automatique de la CONFIRMATION DU CONTRAT sur support durable (email),
//                           avec le texte du contrat, et pour un client particulier l'information officielle
//                           sur la rétractation + le formulaire officiel. La date d'envoi est enregistrée
//                           par le serveur (horloge serveur), une seule fois par contrat.
//   - action: "content-delivered" → (freelance connecté, propriétaire du contrat) contenu numérique fourni
//                           au client : date et heure du serveur, une seule fois (version 208).
//   - action: "sign-in-person" → (freelance connecté, propriétaire) les deux signatures faites ensemble sur son
//                           appareil, enregistrées par le serveur avec la preuve, puis confirmation (version 232).
//   - action: "avenant-sign" → le client signe un avenant à distance (version 232).
//   - action: "avenant-sign-in-person" → (freelance connecté) avenant signé ensemble sur son appareil (version 232).
//   - action: "nda-sign"  → l'autre partie signe un NDA à distance (version 232).
//
// Variables d'environnement : VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY.
// Version 202 : lecture du contrat sans la colonne contract_text (qui n'existe pas), et un email
// refusé par Resend n'est plus jamais enregistré comme envoyé.
// Version 203 : le client n'a pas de compte, et la base lui refuse de modifier un contrat déjà signé
// (« Erreur lors de l'enregistrement » en se rétractant). Toutes les actions du client (rétractation,
// case de démarrage anticipé, signature à distance) sont donc enregistrées ICI, par le serveur, avec la
// clé de service, puis relues pour vérifier qu'elles sont bien en base. Téléphone écrit par paires.
// Version 204 : heure serveur de la réponse « J'ai compris, je demande quand même le paiement » (contrat
// hors établissement, moins de 7 jours) : Freeley ne bloque pas le paiement, il garde la preuve qu'il a prévenu.
// Version 205 : mention « EI » à côté du nom du freelance entrepreneur individuel dans les emails envoyés
// au client (confirmation du contrat, information et formulaire de rétractation, accusé de réception).
// Version 206 : information sur la perte du droit de rétractation (démarrage anticipé, contenu numérique),
// et « EI » repris du texte du contrat quand le formulaire enregistré n'a pas le statut juridique.
// Version 207 : « Retrouver mon contrat » envoie UN seul email, vouvoyé, avec tous les contrats signés de
// l'adresse (nom du prestataire et date de signature). L'email de confirmation signale que le client peut
// télécharger son exemplaire signé (PDF) sur sa page.
// Version 208 : contenu numérique déjà existant. Le freelance indique dans Mes contrats le moment où il fournit
// le contenu (action « content-delivered »). Si le client l'avait accepté avant et que la confirmation lui a
// été envoyée, son droit de rétractation prend fin à ce moment (art. L221-28, 13° C. conso) : la rétractation
// en ligne est alors refusée (« right_lost »). Avant ce moment, elle reste possible. L'email envoyé au
// freelance après une rétractation est adapté au contenu numérique, et l'email de confirmation parle de
// « votre accord » (et non plus de « votre demande ») pour un contenu numérique.
// Version 209 : petite entreprise cliente (art. L221-3 C. conso). Un contrat signé hors établissement avec un
// professionnel qui emploie au plus cinq salariés, et dont l'objet n'entre pas dans son activité principale, lui
// donne les droits d'un consommateur. Le freelance le déclare à la signature en présence (clientPetitPro) : la case
// de démarrage, la rétractation en ligne, l'information et le formulaire de l'email de confirmation valent alors pour
// ce client comme pour un particulier. Noms sans espace en trop dans les emails (« Bonjour Nom, »).
// Version 232 : preuve de signature. Chaque signature (contrat, avenant, NDA) est enregistrée par le serveur avec
// une preuve : l'heure du serveur, l'adresse IP et le navigateur de l'appareil qui signe, et l'empreinte SHA-256
// du texte signé (« signatureProof »). La base refuse qu'une preuve soit écrite par l'application, et verrouille
// les documents signés (script SQL v232). Signature à distance : si le texte a changé pendant que le client le
// lisait, la signature est refusée (« text_changed ») et la page lui montre la nouvelle version. Deux signatures
// envoyées en même temps : seule la première compte. L'email de confirmation reprend la preuve.
//
// ⚠️ Les textes officiels ci-dessous (information sur la rétractation, formulaire) existent aussi dans
// contrat-freelance.jsx (buildRetractationNotice / buildRetractationForm). Si tu modifies l'un, modifie l'autre.

import crypto from "crypto";
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

// ── Preuve de signature (version 232) ──
// Empreinte SHA-256 du texte signé, tel qu'il est enregistré : si un seul caractère change, l'empreinte change.
function sha256Hex(text) {
  return crypto.createHash("sha256").update(String(text || ""), "utf8").digest("hex");
}
// Adresse IP de l'appareil qui signe. Vercel remplace lui-même ces en-têtes (une adresse envoyée par le
// navigateur est écrasée) : x-vercel-forwarded-for, x-real-ip et x-forwarded-for donnent l'adresse publique.
function clientIp(req) {
  const h = (req && req.headers) || {};
  const first = (v) => String(Array.isArray(v) ? v[0] : (v || "")).split(",")[0].trim();
  const raw = first(h["x-vercel-forwarded-for"]) || first(h["x-real-ip"]) || first(h["x-forwarded-for"])
    || String((req && req.socket && req.socket.remoteAddress) || "");
  const ip = raw.replace(/^::ffff:(?=\d+\.\d+\.\d+\.\d+$)/, "");
  return /^[0-9a-fA-F:.]{2,64}$/.test(ip) ? ip : null;
}
// Navigateur et appareil, tels que le navigateur les annonce (500 caractères au plus)
function userAgentOf(req) {
  const ua = String((req && req.headers && req.headers["user-agent"]) || "").replace(/[\u0000-\u001f\u007f]/g, " ").trim();
  return ua ? ua.slice(0, 500) : null;
}
// mode : « distance » (lien envoyé au client) ou « presence » (les deux signatures sur l'appareil du freelance)
function signatureProof(req, text, mode, at) {
  return { mode, at, ip: clientIp(req), userAgent: userAgentOf(req), textSha256: sha256Hex(text) };
}
const isPngSignature = (s) => typeof s === "string" && s.startsWith("data:image/png;base64,") && s.length > 22 && s.length <= 2000000;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// Lignes de la preuve reprises dans l'email de confirmation
function proofLinesForEmail(p) {
  if (!p || !p.at) return null;
  const when = new Date(p.at).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "medium", timeZone: "Europe/Paris" });
  return [
    "PREUVE DE SIGNATURE",
    `${p.mode === "presence" ? "Signé en présence, sur l'appareil du prestataire" : "Signé à distance"}, le ${when} (heure de Paris, horloge du serveur Freeley).`,
    p.ip ? `Adresse IP de l'appareil : ${p.ip}` : null,
    p.textSha256 ? `Empreinte numérique du texte du contrat (SHA-256) : ${p.textSha256}` : null,
  ].filter(Boolean).join("\n");
}

// ── Textes officiels (Code de la consommation), repris mot pour mot ──
// Information : annexe à l'article R221-3. Formulaire : annexe à l'article R221-1.
// Numéro français à 10 chiffres écrit par paires (0767475077 → 07 67 47 50 77) ; tout autre format est laissé tel quel
function fmtPhone(v) {
  const d = String(v || "").replace(/[\s.\-]/g, "");
  return /^0\d{9}$/.test(d) ? d.replace(/(\d{2})(?=\d)/g, "$1 ") : String(v || "");
}

// Mention « EI » obligatoire à côté du nom d'un entrepreneur individuel (décret du 28 avril 2022).
// Même règle que contractFreelanceName() dans contrat-freelance.jsx : seulement pour les contrats créés à
// partir de la version 218 de l'appli, qui enregistrent le statut juridique du freelance (même vide).
// Version 206 : un formulaire sans statut juridique suit le texte du contrat (« Nom EI ») ; une société
// apparaît sous sa dénomination quand elle est connue.
const COMPANY_STATUSES = ["EURL", "SASU", "SARL", "SAS"];
function legalFreelanceName(f = {}, contractText = "") {
  const n = String(f.freelanceName || "").trim();
  if (!n) return n;
  const t = String(contractText || "");
  if (f.freelanceLegalStatus === undefined) return (t.includes(`${n} EI`) || t.includes(`${n} (EI)`)) ? `${n} EI` : n;
  if (COMPANY_STATUSES.includes(String(f.freelanceLegalStatus || "").trim())) return String(f.freelanceCompanyName || "").trim() || n;
  if (/\bEI\b/.test(n) || /entrepreneur individuel/i.test(n)) return n;
  return `${n} EI`;
}

// Formulaire sans statut juridique alors que le texte du contrat écrit « Nom EI » : on suit le texte
function resolveStatus(f = {}, contractText = "") {
  const n = String(f.freelanceName || "").trim();
  const t = String(contractText || "");
  return f.freelanceLegalStatus === undefined && n && (t.includes(`${n} EI`) || t.includes(`${n} (EI)`))
    ? { ...f, freelanceLegalStatus: "" }
    : f;
}

function coords(f = {}) {
  return [legalFreelanceName(f), f.freelanceAddress, fmtPhone(f.freelancePhone), f.freelanceEmail]
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
  // Cas où le droit de rétractation se perd (art. L221-5 et L221-28 C. conso). Même texte que dans l'appli.
  parts.push("Perte du droit de rétractation");
  parts.push(f.contenuNumeriquePret
    ? "Si vous avez expressément consenti à ce que la fourniture du contenu numérique commence avant la fin du délai de rétractation, en renonçant à votre droit de rétractation, vous perdez ce droit dès le début de cette fourniture."
    : "Si vous avez expressément demandé que la prestation commence avant la fin du délai de rétractation, en reconnaissant que vous perdrez ce droit une fois la prestation entièrement exécutée, vous perdez votre droit de rétractation dès que la prestation est entièrement exécutée, si cela intervient avant la fin du délai.");
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

// Enregistre le contenu d'un contrat avec la clé de service, puis RELIT la ligne pour vérifier.
// D'abord une mise à jour directe de la table (la clé de service passe les règles de sécurité) ;
// si elle échoue, on tente l'ancienne fonction update_contract_content. Renvoie true seulement si
// le champ « check » est vraiment enregistré (sans « check », renvoie true après la tentative).
async function saveContent(contractId, newContent, status, check) {
  const payload = { content: JSON.stringify(newContent) };
  if (status) payload.status = status;
  let direct = false;
  try {
    const { data, error } = await supabase.from("contracts").update(payload).eq("id", contractId).select("id");
    if (error) console.error("retraction: mise à jour directe refusée", error);
    direct = !error && Array.isArray(data) && data.length > 0;
  } catch (e) { console.error("retraction: mise à jour directe impossible", e); }
  if (!direct) {
    try {
      const { error } = await supabase.rpc("update_contract_content", {
        p_contract_id: contractId,
        p_new_content: JSON.stringify(newContent),
        p_new_status: status,
      });
      if (error) console.error("retraction: échec enregistrement (fonction)", error);
    } catch (e) { console.error("retraction: échec enregistrement (fonction)", e); }
  }
  if (!check) return true;
  try {
    const { data: row } = await supabase.from("contracts").select("content, status").eq("id", contractId).single();
    const saved = parseContent(row && row.content);
    return !!row && saved[check] === newContent[check] && (!status || row.status === status);
  } catch (e) {
    console.error("retraction: relecture impossible", e);
    return false;
  }
}

// Version 232 : la signature relue est-elle bien celle qu'on vient d'envoyer ? Comparaison champ par champ
// (l'ordre des clés peut changer en base).
function sameSignature(saved, sent) {
  const a = saved || {}, b = sent || {}, pa = a.signatureProof || {}, pb = b.signatureProof || {};
  return a.clientSignature === b.clientSignature && a.freelanceSignature === b.freelanceSignature
    && a.signedByClientAtServer === b.signedByClientAtServer && pa.ip === pb.ip && pa.userAgent === pb.userAgent && pa.at === pb.at;
}

// Version 232 : enregistre la signature qui termine un contrat (statut « signé »), seulement si le contrat est encore
// dans l'état attendu : deux signatures envoyées en même temps ne s'écrasent pas, la première compte.
// onlyIf : "pending_client" (signature à distance) ou "unsigned" (signature en présence : pas encore signé).
// Renvoie "saved" (enregistrée et relue), "already" (le contrat était déjà signé) ou "failed".
async function saveSignedContract(contractId, newContent, onlyIf) {
  let updated = null; // nombre de lignes modifiées ; null si la base a refusé la mise à jour
  try {
    let q = supabase.from("contracts").update({ content: JSON.stringify(newContent), status: "signed" }).eq("id", contractId);
    q = onlyIf === "pending_client" ? q.eq("status", "pending_client") : q.neq("status", "signed");
    const { data, error } = await q.select("id");
    if (error) console.error("retraction: signature refusée par la base", error);
    else updated = Array.isArray(data) ? data.length : 0;
  } catch (e) { console.error("retraction: signature non enregistrée", e); }
  try {
    if (updated === 0) {
      // Le contrat n'était plus dans l'état attendu : une autre signature est arrivée juste avant
      const { data: row } = await supabase.from("contracts").select("status").eq("id", contractId).maybeSingle();
      return row && row.status === "signed" ? "already" : "failed";
    }
    if (updated === null) {
      // Base qui refuse la mise à jour directe : ancienne fonction (sans la condition sur l'état)
      try {
        const { error } = await supabase.rpc("update_contract_content", {
          p_contract_id: contractId,
          p_new_content: JSON.stringify(newContent),
          p_new_status: "signed",
        });
        if (error) console.error("retraction: échec enregistrement de la signature (fonction)", error);
      } catch (e) { console.error("retraction: échec enregistrement de la signature (fonction)", e); }
    }
    const { data: row } = await supabase.from("contracts").select("content, status").eq("id", contractId).single();
    if (!row) return "failed";
    if (row.status === "signed" && sameSignature(parseContent(row.content), newContent)) return "saved";
    return row.status === "signed" ? "already" : "failed";
  } catch (e) {
    console.error("retraction: relecture impossible", e);
    return "failed";
  }
}

// Même chose pour un avenant, puis relecture. Un avenant déjà signé ne change plus en base (script SQL v232) :
// une deuxième signature envoyée en même temps est alors reconnue comme « déjà signé ».
async function saveSignedAvenant(contractId, avenantNum, newContent) {
  const findAv = (c) => (Array.isArray(c.avenants) ? c.avenants : []).find((a) => a && String(a.num) === String(avenantNum));
  const sent = findAv(newContent);
  try {
    const { error } = await supabase.from("contracts").update({ content: JSON.stringify(newContent) }).eq("id", contractId).select("id");
    if (error) console.error("retraction: signature d'avenant refusée par la base", error);
  } catch (e) { console.error("retraction: signature d'avenant non enregistrée", e); }
  try {
    const { data: row } = await supabase.from("contracts").select("content").eq("id", contractId).single();
    const av = row ? findAv(parseContent(row.content)) : null;
    if (av && av.status === "signed" && sameSignature(av, sent)) return "saved";
    return av && av.status === "signed" ? "already" : "failed";
  } catch (e) {
    console.error("retraction: relecture de l'avenant impossible", e);
    return "failed";
  }
}

// ── Fin du délai de rétractation (même calcul que dans contrat-freelance.jsx) ──
// 14 jours après le jour de la signature (le jour même ne compte pas), jusqu'à la fin de la journée,
// heure de Paris. S'il se termine un samedi, un dimanche ou un jour férié, il passe au premier jour
// ouvrable suivant (art. L221-19 C. conso). Calcul volontairement généreux, jamais plus court.
function easterSunday(y) {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4;
  const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const n = h + l - 7 * m + 114;
  return Date.UTC(y, Math.floor(n / 31) - 1, (n % 31) + 1);
}
function isFrenchHoliday(dayUtc) {
  const d = new Date(dayUtc), md = `${d.getUTCMonth() + 1}-${d.getUTCDate()}`;
  if (["1-1", "5-1", "5-8", "7-14", "8-15", "11-1", "11-11", "12-25"].includes(md)) return true;
  const e = easterSunday(d.getUTCFullYear()), DAY = 86400000;
  return [e + DAY, e + 39 * DAY, e + 50 * DAY].includes(dayUtc); // lundi de Pâques, Ascension, lundi de Pentecôte
}
function parisDayUtc(iso, plusDays = 0) {
  const s = new Date(iso);
  if (isNaN(s.getTime())) return null;
  const [y, mo, d] = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit" }).format(s).split("-").map(Number);
  return Date.UTC(y, mo - 1, d + plusDays);
}
function retractationDeadline(signedIso) {
  let day = signedIso ? parisDayUtc(signedIso, 14) : null;
  if (day == null) return null;
  while ([0, 6].includes(new Date(day).getUTCDay()) || isFrenchHoliday(day)) day += 86400000;
  return new Date(day + 23 * 3600000); // fin de journée à Paris (23 h UTC = minuit en hiver, 1 h du matin en été)
}

// Textes exacts des cases que le client peut cocher (copie de contrat-freelance.jsx)
const WAIVER_TEXT_DIGITAL = "Je consens expressément à ce que la fourniture du contenu numérique commence avant l'expiration du délai de rétractation de quatorze (14) jours et je reconnais qu'en conséquence je perdrai mon droit de rétractation dès le commencement de cette exécution.";
const WAIVER_TEXT_SERVICE = "Je demande expressément que l'exécution de la prestation commence avant l'expiration du délai de rétractation de quatorze (14) jours. Je reconnais que, si je me rétracte après ce début d'exécution, je devrai payer un montant correspondant à la prestation déjà fournie jusqu'à ma décision de me rétracter, et que, si la prestation est pleinement exécutée avant la fin de ce délai, je perdrai mon droit de rétractation.";

// Client protégé comme un consommateur (version 209) : un particulier, ou une petite entreprise signée hors
// établissement (art. L221-3 C. conso), déclarée par le freelance. Même règle que isConsumerLikeContract() dans
// contrat-freelance.jsx.
function isConsumerLike(form = {}, content = {}) {
  return form.typeClient === "particulier"
    || (content.signatureLocation === "hors_etablissement" && content.clientPetitPro === true);
}
// Contenu numérique déjà existant : l'appli ne le propose que pour un particulier. Un contrat pro peut garder la case
// d'un essai précédent : elle ne compte pas (le contrat pro est toujours écrit comme une prestation). Version 209.
function isDigitalContent(form = {}) {
  return form.typeClient === "particulier" && !!form.contenuNumeriquePret;
}

// Contenu numérique (version 208) : le droit de rétractation a pris fin quand le contenu a été fourni APRÈS
// l'accord exprès du client (case cochée, avec reconnaissance de la perte du droit) et que la confirmation de
// cet accord lui a été envoyée (art. L221-28, 13° et L221-13 C. conso). Même règle que dans contrat-freelance.jsx.
function digitalRightEnded(content = {}, form = {}) {
  const waivedAt = content.retractationWaivedAtServer || content.retractationWaivedAt;
  const deliveredAt = content.contentDeliveredAtServer || content.contentDeliveredAt;
  if (!isDigitalContent(form)) return null;
  if (!waivedAt || !content.retractationConfirmationSentAt || !deliveredAt) return null;
  if (!(new Date(waivedAt) <= new Date(deliveredAt))) return null;
  return { deliveredAt, waivedAt, confirmationSentAt: content.retractationConfirmationSentAt };
}

// Utilisateur connecté (freelance) à partir du jeton envoyé par l'appli (en-tête Authorization: Bearer …)
async function userIdFromToken(token) {
  if (!token) return null;
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error) return null;
    return data?.user?.id || null;
  } catch (e) {
    console.error("retraction: jeton de connexion illisible", e);
    return null;
  }
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
  const already = content.retractationExercisedAtServer || content.retractationExercisedAt;
  if (already) return { status: 200, body: { ok: true, alreadyConfirmed: true, exercisedAt: already } };
  const form = resolveStatus(content.form || {}, content.contract);
  if (row.status !== "signed") return { status: 400, body: { error: "not_signed" } };
  if (!isConsumerLike(form, content)) return { status: 400, body: { error: "not_particulier" } };
  const deadline = retractationDeadline(content.signedByClientAtServer || content.signedByClientAt);
  if (deadline && Date.now() > deadline.getTime()) return { status: 400, body: { error: "deadline_passed" } };
  // Contenu numérique fourni après l'accord du client et la confirmation : le droit a pris fin (version 208)
  const ended = digitalRightEnded(content, form);
  if (ended) return { status: 400, body: { error: "right_lost", ...ended } };
  const clientEmail = String(form.clientEmail || content.clientEmail || "").trim();
  const clientName = String(form.clientName || content.clientName || "").trim();
  const freelanceName = legalFreelanceName(form) || "votre prestataire";
  const missionTitle = content.missionTitle || form.missionTitle || "votre mission";
  const exercisedAt = new Date().toISOString(); // horloge du serveur, au moment où la demande arrive
  const dateStr = new Date(exercisedAt).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short", timeZone: "Europe/Paris" });
  // La date en base est la preuve légale : elle est enregistrée AVANT les emails, et vérifiée
  const saved = await saveContent(contractId, { ...content, retractationExercisedAt: exercisedAt, retractationExercisedAtServer: exercisedAt }, row.status, "retractationExercisedAtServer");
  if (!saved) return { status: 500, body: { error: "save_failed" } };

  const freelanceEmail = (await getFreelanceAuthEmail(row.user_id)) || form.freelanceEmail || null;
  const results = { clientEmailSent: false, freelanceEmailSent: false };

  if (clientEmail) {
    try {
      await sendMail({
        from: FROM, to: clientEmail,
        subject: `Accusé de réception de votre rétractation — ${missionTitle}`,
        text: `Bonjour${clientName ? " " + clientName : ""},\n\nNous accusons réception de votre rétractation, soumise en ligne le ${dateStr}.\n\nContenu de votre demande : rétractation du contrat « ${missionTitle} » conclu avec ${freelanceName}.\n\nCet email constitue votre accusé de réception sur un support durable. Le contrat est annulé à compter de cette date.\n\nCordialement,\n${freelanceName}\n(message envoyé par Freeley pour le compte de ${freelanceName})`,
      });
      results.clientEmailSent = true;
    } catch (e) { console.error("retraction/confirm: échec email client", e); }
  }

  if (freelanceEmail) {
    // Conseils adaptés : prestation de services, ou contenu numérique (version 208)
    const waived = !!(content.retractationWaivedAtServer || content.retractationWaivedAt);
    const advice = !isDigitalContent(form)
      ? "Si une partie de la prestation a déjà été réalisée à sa demande expresse, pense à établir la facturation proportionnelle correspondante. Tu dois rembourser les sommes reçues dans les 14 jours."
      : !waived
        ? "Ne lui fournis pas le contenu, et rembourse-lui les sommes reçues dans les 14 jours. Il n'avait pas accepté de recevoir le contenu avant la fin du délai de rétractation : sa rétractation est valable, même si tu lui avais déjà fourni le contenu."
        : !content.retractationConfirmationSentAt
          ? "Ne lui fournis pas le contenu, et rembourse-lui les sommes reçues dans les 14 jours. La confirmation de son accord ne lui avait pas été envoyée : sa rétractation est valable, même si tu lui avais déjà fourni le contenu."
          : "Il avait accepté de recevoir le contenu avant la fin du délai de rétractation, mais tu n'avais pas indiqué dans Freeley le lui avoir fourni. Ne lui fournis pas le contenu, et rembourse-lui les sommes reçues dans les 14 jours.\n\nSi tu le lui avais déjà fourni avant sa rétractation, son droit de rétractation avait pris fin à ce moment-là : réponds-lui en joignant la preuve de ton envoi (date et heure de l'email ou du lien de téléchargement). La prochaine fois, touche « J'ai fourni le contenu au client » dans Mes contrats au moment où tu le fournis.";
    try {
      await sendMail({
        from: FROM, to: freelanceEmail,
        subject: `Un client s'est rétracté — ${missionTitle}`,
        text: `Bonjour,\n\n${clientName || "Votre client"} a exercé son droit de rétractation le ${dateStr} pour la mission « ${missionTitle} ».\n\n${results.clientEmailSent ? "Un accusé de réception lui a été envoyé automatiquement." : "Attention : l'accusé de réception automatique n'a pas pu lui être envoyé. Envoie-lui toi-même, dès maintenant, un email confirmant que tu as bien reçu sa rétractation, avec la date et l'heure ci-dessus."}\n\n${advice}\n\nCordialement,\nFreeley`,
      });
      results.freelanceEmailSent = true;
    } catch (e) { console.error("retraction/confirm: échec email freelance", e); }
  }

  return { status: 200, body: { ok: true, saved: true, exercisedAt, ...results } };
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

// ── action: "stamp-early-payment" — heure du serveur de la réponse du freelance qui demande un paiement
// pendant les 7 jours d'un contrat hors établissement (art. L221-10). N'ajoute que l'heure, une seule fois,
// et seulement si la réponse du freelance est déjà enregistrée dans le contrat.
async function handleStampEarlyPayment(contractId) {
  const { data: row, error } = await supabase.from("contracts").select("content, status").eq("id", contractId).single();
  if (error || !row) return { status: 404, body: { error: "Contrat introuvable" } };
  const content = parseContent(row.content);
  if (!content.earlyPaymentAck || content.earlyPaymentAckAtServer) return { status: 200, body: { ok: true, stamped: false } };
  const nowIso = new Date().toISOString();
  const saved = await saveContent(contractId, { ...content, earlyPaymentAckAtServer: nowIso }, row.status, "earlyPaymentAckAtServer");
  if (!saved) return { status: 500, body: { error: "save_failed" } };
  return { status: 200, body: { ok: true, stamped: true, stampedAt: nowIso } };
}

// ── action: "content-delivered" — le freelance indique qu'il vient de fournir le contenu numérique (version 208) ──
// Réservé au freelance propriétaire du contrat (jeton de connexion vérifié). Heure du serveur, une seule fois.
// Seulement quand le client a accepté la fourniture avant la fin du délai et que la confirmation lui a été
// envoyée : c'est ce moment qui met fin à son droit de rétractation.
async function handleContentDelivered(contractId, token) {
  const userId = await userIdFromToken(token);
  if (!userId) return { status: 401, body: { error: "unauthorized" } };
  const { data: row, error } = await supabase.from("contracts").select("content, user_id, status").eq("id", contractId).single();
  if (error || !row) return { status: 404, body: { error: "Contrat introuvable" } };
  if (row.user_id !== userId) return { status: 403, body: { error: "forbidden" } };
  const content = parseContent(row.content);
  const form = content.form || {};
  if (row.status !== "signed") return { status: 400, body: { error: "not_signed" } };
  if (!isDigitalContent(form)) return { status: 400, body: { error: "not_digital" } };
  if (content.retractationExercisedAtServer || content.retractationExercisedAt) return { status: 409, body: { error: "retracted" } };
  const already = content.contentDeliveredAtServer || content.contentDeliveredAt;
  if (already) return { status: 200, body: { ok: true, alreadyDelivered: true, deliveredAt: already } };
  if (!(content.retractationWaivedAtServer || content.retractationWaivedAt)) return { status: 400, body: { error: "not_waived" } };
  if (!content.retractationConfirmationSentAt) return { status: 400, body: { error: "not_confirmed" } };
  const nowIso = new Date().toISOString();
  const saved = await saveContent(contractId, { ...content, contentDeliveredAt: nowIso, contentDeliveredAtServer: nowIso }, row.status, "contentDeliveredAtServer");
  if (!saved) return { status: 500, body: { error: "save_failed" } };
  return { status: 200, body: { ok: true, saved: true, deliveredAt: nowIso } };
}

// ── action: "client-waive" — le client coche la case de démarrage avant la fin du délai ──
async function handleClientWaive(contractId, waiverText) {
  const { data: row, error } = await supabase.from("contracts").select("content, status").eq("id", contractId).single();
  if (error || !row) return { status: 404, body: { error: "Contrat introuvable" } };
  const content = parseContent(row.content);
  if (!isConsumerLike(content.form || {}, content)) return { status: 400, body: { error: "not_particulier" } };
  if (![WAIVER_TEXT_DIGITAL, WAIVER_TEXT_SERVICE].includes(waiverText)) return { status: 400, body: { error: "invalid_text" } };
  if (content.retractationWaivedAt) return { status: 200, body: { ok: true, alreadyWaived: true } };
  if (row.status === "signed") return { status: 400, body: { error: "already_signed" } };
  const nowIso = new Date().toISOString();
  const saved = await saveContent(contractId, { ...content, retractationWaiverText: waiverText, retractationWaivedAt: nowIso, retractationWaivedAtServer: nowIso }, row.status, "retractationWaivedAtServer");
  if (!saved) return { status: 500, body: { error: "save_failed" } };
  return { status: 200, body: { ok: true, saved: true, waivedAt: nowIso } };
}

// ── action: "client-sign" — signature du client à distance, puis confirmation du contrat ──
// Version 232 : preuve de signature enregistrée en même temps. « textSha256 » : empreinte du texte que la page du
// client a affiché ; si le prestataire l'a changé entre-temps, la signature est refusée (« text_changed »).
async function handleClientSign(contractId, signature, req, shownTextSha256) {
  if (!isPngSignature(signature)) {
    return { status: 400, body: { error: "invalid_signature" } };
  }
  const { data: row, error } = await supabase.from("contracts").select("content, status").eq("id", contractId).single();
  if (error || !row) return { status: 404, body: { error: "Contrat introuvable" } };
  if (row.status === "signed") return { status: 200, body: { ok: true, alreadySigned: true } };
  if (row.status !== "pending_client") return { status: 400, body: { error: "not_pending" } };
  const content = parseContent(row.content);
  const text = String(content.contract || "");
  if (typeof shownTextSha256 === "string" && /^[0-9a-f]{64}$/i.test(shownTextSha256) && shownTextSha256.toLowerCase() !== sha256Hex(text)) {
    return { status: 409, body: { error: "text_changed" } };
  }
  const nowIso = new Date().toISOString();
  const newContent = {
    ...content,
    clientSignature: signature, signedByClientAt: nowIso, signedByClientAtServer: nowIso,
    signatureProof: signatureProof(req, text, "distance", nowIso),
  };
  const outcome = await saveSignedContract(contractId, newContent, "pending_client");
  if (outcome === "already") return { status: 200, body: { ok: true, alreadySigned: true } };
  if (outcome !== "saved") return { status: 500, body: { error: "save_failed" } };
  // Confirmation sur support durable (email) — ne bloque jamais la signature si l'envoi échoue
  let confirmation = null;
  try { confirmation = (await handleSendLink(contractId)).body; } catch (e) { console.error("retraction/client-sign: confirmation", e); }
  return { status: 200, body: { ok: true, saved: true, signedAt: nowIso, confirmation } };
}

// ── action: "sign-in-person" — les deux signatures faites ensemble, sur l'appareil du freelance (version 232) ──
// Réservé au freelance propriétaire du contrat (jeton vérifié). Le serveur enregistre les deux signatures, le lieu
// déclaré, l'heure du serveur et la preuve (appareil du freelance), puis envoie la confirmation au client.
const SIGN_LOCATION_KEYS = ["locaux", "hors_etablissement", "urgence"];
function cleanSignContext(ctx) {
  const c = ctx && typeof ctx === "object" ? ctx : {};
  if (!SIGN_LOCATION_KEYS.includes(c.signatureLocation)) return {};
  const str = (v, max) => (typeof v === "string" ? v.slice(0, max) : undefined);
  const out = {
    signatureLocation: c.signatureLocation,
    signatureLocationLabel: str(c.signatureLocationLabel, 300),
    signatureLocationDeclaredAt: str(c.signatureLocationDeclaredAt, 40),
  };
  if (typeof c.clientPetitPro === "boolean") {
    out.clientPetitPro = c.clientPetitPro;
    out.clientPetitProLabel = str(c.clientPetitProLabel, 300);
    out.clientPetitProDeclaredAt = str(c.clientPetitProDeclaredAt, 40);
  }
  Object.keys(out).forEach((k) => out[k] === undefined && delete out[k]);
  return out;
}
// Heure de l'appareil du freelance quand il a signé : gardée si elle est plausible (dans les 24 dernières heures)
function plausibleRecentIso(v, nowIso) {
  const t = new Date(v || "").getTime();
  const now = new Date(nowIso).getTime();
  return Number.isFinite(t) && t <= now + 5 * 60000 && t >= now - 24 * 3600000 ? new Date(t).toISOString() : nowIso;
}
async function handleSignInPerson(contractId, token, body, req) {
  const userId = await userIdFromToken(token);
  if (!userId) return { status: 401, body: { error: "unauthorized" } };
  if (!isPngSignature(body.freelanceSignature) || !isPngSignature(body.clientSignature)) {
    return { status: 400, body: { error: "invalid_signature" } };
  }
  const { data: row, error } = await supabase.from("contracts").select("content, user_id, status").eq("id", contractId).single();
  if (error || !row) return { status: 404, body: { error: "Contrat introuvable" } };
  if (row.user_id !== userId) return { status: 403, body: { error: "forbidden" } };
  if (row.status === "signed") return { status: 200, body: { ok: true, alreadySigned: true } };
  const content = parseContent(row.content);
  const nowIso = new Date().toISOString();
  const newContent = {
    ...content,
    ...cleanSignContext(body.signContext),
    freelanceSignature: body.freelanceSignature,
    clientSignature: body.clientSignature,
    signedByFreelanceAt: plausibleRecentIso(body.signedByFreelanceAt, nowIso),
    signedByClientAt: nowIso, signedByClientAtServer: nowIso,
    signatureProof: signatureProof(req, content.contract, "presence", nowIso),
  };
  const outcome = await saveSignedContract(contractId, newContent, "unsigned");
  if (outcome === "already") return { status: 200, body: { ok: true, alreadySigned: true } };
  if (outcome !== "saved") return { status: 500, body: { error: "save_failed" } };
  let confirmation = null;
  try { confirmation = (await handleSendLink(contractId)).body; } catch (e) { console.error("retraction/sign-in-person: confirmation", e); }
  return { status: 200, body: { ok: true, saved: true, signedAt: nowIso, confirmation } };
}

// ── Avenants (version 232) : à distance (le client, sans compte) ou en présence (freelance connecté) ──
async function readAvenant(contractId, avenantNum) {
  const num = String(avenantNum ?? "").trim();
  if (!/^\d{1,4}$/.test(num)) return { result: { status: 400, body: { error: "invalid_avenant" } } };
  const { data: row, error } = await supabase.from("contracts").select("content, user_id, status").eq("id", contractId).single();
  if (error || !row) return { result: { status: 404, body: { error: "Contrat introuvable" } } };
  const content = parseContent(row.content);
  const avenants = Array.isArray(content.avenants) ? content.avenants.slice() : [];
  const idx = avenants.findIndex((a) => a && String(a.num) === num);
  if (idx === -1) return { result: { status: 404, body: { error: "Avenant introuvable" } } };
  return { row, content, avenants, idx, num };
}
async function handleAvenantSign(contractId, avenantNum, signature, req) {
  if (!isPngSignature(signature)) return { status: 400, body: { error: "invalid_signature" } };
  const r = await readAvenant(contractId, avenantNum);
  if (r.result) return r.result;
  const av = r.avenants[r.idx];
  if (av.status === "signed") return { status: 200, body: { ok: true, alreadySigned: true } };
  if (av.status !== "pending_signature") return { status: 400, body: { error: "not_pending" } };
  const nowIso = new Date().toISOString();
  r.avenants[r.idx] = {
    ...av, clientSignature: signature, signedByClientAt: nowIso, signedByClientAtServer: nowIso, status: "signed",
    signatureProof: signatureProof(req, av.text, "distance", nowIso),
  };
  const outcome = await saveSignedAvenant(contractId, r.num, { ...r.content, avenants: r.avenants });
  if (outcome === "already") return { status: 200, body: { ok: true, alreadySigned: true } };
  if (outcome !== "saved") return { status: 500, body: { error: "save_failed" } };
  return { status: 200, body: { ok: true, saved: true, signedAt: nowIso } };
}
async function handleAvenantSignInPerson(contractId, avenantNum, token, body, req) {
  const userId = await userIdFromToken(token);
  if (!userId) return { status: 401, body: { error: "unauthorized" } };
  if (!isPngSignature(body.freelanceSignature) || !isPngSignature(body.clientSignature)) {
    return { status: 400, body: { error: "invalid_signature" } };
  }
  const r = await readAvenant(contractId, avenantNum);
  if (r.result) return r.result;
  if (r.row.user_id !== userId) return { status: 403, body: { error: "forbidden" } };
  const av = r.avenants[r.idx];
  if (av.status === "signed") return { status: 200, body: { ok: true, alreadySigned: true } };
  const nowIso = new Date().toISOString();
  r.avenants[r.idx] = {
    ...av, freelanceSignature: body.freelanceSignature, clientSignature: body.clientSignature,
    signedByClientAt: nowIso, signedByClientAtServer: nowIso, status: "signed",
    signatureProof: signatureProof(req, av.text, "presence", nowIso),
  };
  const outcome = await saveSignedAvenant(contractId, r.num, { ...r.content, avenants: r.avenants });
  if (outcome === "already") return { status: 200, body: { ok: true, alreadySigned: true } };
  if (outcome !== "saved") return { status: 500, body: { error: "save_failed" } };
  return { status: 200, body: { ok: true, saved: true, signedAt: nowIso } };
}

// ── action: "nda-sign" — l'autre partie signe un NDA à distance (version 232) ──
// Même vérification que l'ancienne fonction sign_nda (NDA en attente, signature en image PNG), avec la preuve en plus.
async function handleNdaSign(ndaId, signature, req) {
  if (!UUID.test(String(ndaId || ""))) return { status: 400, body: { error: "invalid_id" } };
  if (!isPngSignature(signature)) return { status: 400, body: { error: "invalid_signature" } };
  const { data: nda, error } = await supabase.from("ndas").select("id, content, status").eq("id", ndaId).maybeSingle();
  if (error) { console.error("retraction/nda-sign: lecture impossible", error); return { status: 500, body: { error: "read_failed" } }; }
  if (!nda) return { status: 404, body: { error: "NDA introuvable" } };
  if (nda.status === "signed") return { status: 200, body: { ok: true, alreadySigned: true } };
  if (nda.status !== "pending_signature") return { status: 400, body: { error: "not_pending" } };
  const nowIso = new Date().toISOString();
  const text = typeof nda.content === "string" ? nda.content : JSON.stringify(nda.content ?? "");
  const proof = signatureProof(req, text, "distance", nowIso);
  const { data: saved, error: saveError } = await supabase.from("ndas")
    .update({ client_signature: signature, status: "signed", signed_at: nowIso, signature_proof: proof })
    .eq("id", ndaId).eq("status", "pending_signature").select("id");
  if (saveError) {
    // Par exemple : colonne signature_proof pas encore créée (script SQL v232) → l'appli passe par sign_nda
    console.error("retraction/nda-sign: enregistrement refusé", saveError);
    return { status: 500, body: { error: "save_failed" } };
  }
  if (!Array.isArray(saved) || saved.length === 0) {
    const { data: again } = await supabase.from("ndas").select("status").eq("id", ndaId).maybeSingle();
    if (again && again.status === "signed") return { status: 200, body: { ok: true, alreadySigned: true } };
    return { status: 500, body: { error: "save_failed" } };
  }
  return { status: 200, body: { ok: true, saved: true, signedAt: nowIso } };
}

// ── action: "find" — retrouver un contrat perdu par email, toujours même réponse ──
async function handleFind(rawEmail) {
  const email = String(rawEmail || "").trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: 200, body: { ok: true } };
  }
  try {
    const { data: rows } = await supabase.from("contracts").select("id, content").eq("status", "signed");
    const emailLower = email.toLowerCase();
    const matches = (rows || []).filter(r => {
      const c = parseContent(r.content);
      return String(c.form?.clientEmail || c.clientEmail || "").trim().toLowerCase() === emailLower;
    });
    if (matches.length) {
      // Un seul email, même avec plusieurs contrats (avant : un email par contrat, et tutoyé)
      const fmtDay = (iso) => iso ? new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Paris" }) : "";
      const titles = [];
      const items = matches.map(m => {
        const c = parseContent(m.content);
        const f = c.form || {};
        const title = c.missionTitle || f.missionTitle || "votre mission";
        titles.push(title);
        const who = legalFreelanceName(f, c.contract || "");
        const day = fmtDay(c.signedByClientAtServer || c.signedByClientAt);
        return `« ${title} »${who ? `, conclu avec ${who}` : ""}${day ? `, signé le ${day}` : ""} :\n${SITE_URL}/?sign=${m.id}`;
      });
      const several = matches.length > 1;
      const text = [
        "Bonjour,",
        several
          ? "Vous avez demandé à retrouver vos contrats sur Freeley. Voici le lien vers chacun d'eux :"
          : "Vous avez demandé à retrouver votre contrat sur Freeley. Voici le lien pour y accéder :",
        items.join("\n\n"),
        `Sur ${several ? "chaque" : "cette"} page, vous pouvez relire votre contrat et télécharger votre exemplaire signé (PDF). Si vous bénéficiez du droit de rétractation (client particulier, ou dans certains cas petite entreprise), elle vous permet aussi de l'exercer en ligne tant que le délai de 14 jours n'est pas écoulé.`,
        "Si vous n'êtes pas à l'origine de cette demande, ignorez simplement ce message.",
        "Cordialement,\nFreeley",
      ].join("\n\n");
      try {
        await sendMail({
          from: FROM, to: email,
          subject: several ? "Retrouvez vos contrats signés sur Freeley" : `Retrouvez votre contrat — ${titles[0]}`,
          text,
        });
      } catch (e) { console.error("retraction/find: échec email", e); }
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

  const form = { ...resolveStatus(content.form || {}, content.contract) };
  if (!form.freelanceEmail) form.freelanceEmail = (await getFreelanceAuthEmail(row.user_id)) || "";
  const clientEmail = String(form.clientEmail || content.clientEmail || "").trim();
  if (!clientEmail) return { status: 200, body: { ok: true, sent: false, reason: "no_client_email" } };

  const clientName = String(form.clientName || content.clientName || "").trim();
  const freelanceName = legalFreelanceName(form) || "votre prestataire";
  const missionTitle = content.missionTitle || form.missionTitle || "votre mission";
  // Particulier, ou petite entreprise protégée (version 209) : information et formulaire de rétractation
  const isParticulier = isConsumerLike(form, content);
  const isPetitPro = isParticulier && form.typeClient !== "particulier";
  const isDigital = isDigitalContent(form);
  const link = `${SITE_URL}/?sign=${contractId}`;
  const fmt = (iso) => new Date(iso).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short", timeZone: "Europe/Paris" });
  const nowIso = new Date().toISOString(); // appelé juste après la signature : horloge serveur
  const signedStr = fmt(content.signedByClientAtServer || nowIso);
  const waivedAt = content.retractationWaivedAtServer || content.retractationWaivedAt;
  const contractText = (content.contract || "").trim();

  const blocks = [
    `Bonjour${clientName ? " " + clientName : ""},`,
    `Ce courriel constitue la confirmation, sur un support durable, de votre contrat « ${missionTitle} » conclu avec ${freelanceName} et signé le ${signedStr}.`,
    `Vous pouvez consulter votre contrat et télécharger votre exemplaire signé (PDF) à tout moment sur cette page :\n${link}`,
  ];

  if (isParticulier && waivedAt && content.retractationWaiverText) {
    // Contenu numérique : le client a donné son accord (version 208) ; prestation : il l'a demandé
    blocks.push(`${isDigital ? "Votre accord" : "Votre demande"} du ${fmt(waivedAt)} (texte que vous avez coché) :\n« ${content.retractationWaiverText} »`);
    if (isDigital) {
      // Confirmation exigée pour un contenu numérique (texte relu par une juriste)
      const waivedDate = new Date(waivedAt).toLocaleDateString("fr-FR", { timeZone: "Europe/Paris" });
      blocks.push(`À la suite de votre accord exprès donné le ${waivedDate}, nous vous confirmons que vous avez consenti à ce que la fourniture du contenu numérique “${missionTitle}” commence avant l'expiration du délai de rétractation de quatorze (14) jours et que vous avez reconnu qu'en conséquence vous perdrez votre droit de rétractation dès le commencement de cette exécution.`);
    }
  }

  if (isParticulier) {
    blocks.push("────────────────────────────");
    if (isPetitPro) {
      blocks.push("Votre prestataire a indiqué que votre entreprise emploie cinq salariés au plus et que ce contrat, signé hors de ses locaux, n'entre pas dans votre activité principale. Vous bénéficiez donc, comme un particulier, du droit de rétractation (article L221-3 du Code de la consommation).");
    }
    blocks.push(buildNotice({ ...form, contenuNumeriquePret: isDigital }, link));
    blocks.push("────────────────────────────");
    blocks.push(buildForm(form));
  }

  if (contractText) {
    blocks.push("────────────────────────────");
    blocks.push(`TEXTE DU CONTRAT\n\n${contractText}`);
  }

  // Version 232 : la preuve de signature, gardée aussi dans la boîte email du client
  const proofText = proofLinesForEmail(content.signatureProof);
  if (proofText) {
    blocks.push("────────────────────────────");
    blocks.push(proofText);
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

  const { action, contractId, email, waiverText, signature, textSha256, avenantNum, ndaId } = req.body || {};
  // Jeton de connexion du freelance, seulement pour ses propres actions (version 208)
  const token = String(req.headers?.authorization || "").replace(/^Bearer\s+/i, "").trim();
  let result;

  if (action === "confirm") {
    if (!contractId) return res.status(400).json({ error: "contractId manquant" });
    result = await handleConfirm(contractId);
  } else if (action === "find") {
    result = await handleFind(email);
  } else if (action === "stamp-waiver") {
    if (!contractId) return res.status(400).json({ error: "contractId manquant" });
    result = await handleStampWaiver(contractId);
  } else if (action === "stamp-early-payment") {
    if (!contractId) return res.status(400).json({ error: "contractId manquant" });
    result = await handleStampEarlyPayment(contractId);
  } else if (action === "send-link") {
    if (!contractId) return res.status(400).json({ error: "contractId manquant" });
    result = await handleSendLink(contractId);
  } else if (action === "client-waive") {
    if (!contractId) return res.status(400).json({ error: "contractId manquant" });
    result = await handleClientWaive(contractId, waiverText);
  } else if (action === "client-sign") {
    if (!contractId) return res.status(400).json({ error: "contractId manquant" });
    result = await handleClientSign(contractId, signature, req, textSha256);
  } else if (action === "content-delivered") {
    if (!contractId) return res.status(400).json({ error: "contractId manquant" });
    result = await handleContentDelivered(contractId, token);
  } else if (action === "sign-in-person") {
    if (!contractId) return res.status(400).json({ error: "contractId manquant" });
    result = await handleSignInPerson(contractId, token, req.body || {}, req);
  } else if (action === "avenant-sign") {
    if (!contractId) return res.status(400).json({ error: "contractId manquant" });
    result = await handleAvenantSign(contractId, avenantNum, signature, req);
  } else if (action === "avenant-sign-in-person") {
    if (!contractId) return res.status(400).json({ error: "contractId manquant" });
    result = await handleAvenantSignInPerson(contractId, avenantNum, token, req.body || {}, req);
  } else if (action === "nda-sign") {
    if (!ndaId) return res.status(400).json({ error: "ndaId manquant" });
    result = await handleNdaSign(ndaId, signature, req);
  } else {
    return res.status(400).json({ error: "action inconnue" });
  }

  return res.status(result.status).json(result.body);
}
