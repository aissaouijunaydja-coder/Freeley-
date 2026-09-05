// /api/send-contract-link.js
//
// NOUVEAU FICHIER — à ajouter dans ton dossier /api, à côté des deux autres créés aujourd'hui
// (confirm-retraction.js et find-contract.js). Mêmes variables d'environnement, déjà en place :
// VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY.
//
// Rôle : après une signature EN PERSONNE (mode "Ensemble maintenant, sur le même appareil"),
// le client ne reçoit normalement jamais de lien vers son contrat, contrairement à la
// signature à distance. Cette route corrige ça : elle envoie automatiquement au client le
// même lien permanent (?sign=<contractId>) que celui utilisé pour la signature à distance,
// pour qu'il ait, lui aussi, accès à son contrat et au bouton de rétractation pendant 14 jours.

import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { contractId } = req.body || {};
  if (!contractId) return res.status(400).json({ error: "contractId manquant" });

  const { data: row, error } = await supabase
    .from("contracts")
    .select("content")
    .eq("id", contractId)
    .single();

  if (error || !row) {
    console.error("send-contract-link: contrat introuvable", error);
    return res.status(404).json({ error: "Contrat introuvable" });
  }

  const content = typeof row.content === "string" ? JSON.parse(row.content) : (row.content || {});
  const clientEmail = content.form?.clientEmail || content.clientEmail || "";
  const clientName = content.form?.clientName || content.clientName || "";
  const missionTitle = content.missionTitle || content.form?.missionTitle || "ta mission";
  const siteUrl = process.env.SITE_URL || "https://freeley.fr"; // adapte si ton domaine diffère
  const link = `${siteUrl}/?sign=${contractId}`;

  if (!clientEmail) {
    // Rien à envoyer si aucun email n'a été renseigné pour ce client — pas une erreur en soi,
    // certains clients particuliers signés en personne n'ont peut-être pas d'email saisi.
    return res.status(200).json({ ok: true, sent: false, reason: "no_client_email" });
  }

  try {
    await resend.emails.send({
      from: "Freeley <contact@freeley.fr>", // vérifie que cette adresse est bien validée dans Resend
      to: clientEmail,
      subject: `Ton contrat signé — ${missionTitle}`,
      text: `Bonjour ${clientName},\n\nVoici le lien vers ton contrat signé « ${missionTitle} » :\n${link}\n\nGarde ce lien précieusement : il te permet de consulter ton contrat à tout moment, et, si tu es un particulier, d'exercer ton droit de rétractation pendant 14 jours si besoin.\n\nCordialement,\nFreeley`,
    });
    return res.status(200).json({ ok: true, sent: true });
  } catch (e) {
    console.error("send-contract-link: échec envoi email", e);
    return res.status(500).json({ error: "Erreur envoi email" });
  }
}
