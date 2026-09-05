// /api/confirm-retraction.js
//
// NOUVEAU FICHIER — à ajouter dans ton dossier /api à côté de tes autres routes existantes
// (create-payment, etc.). Renomme ce fichier "confirm-retraction.js" en le plaçant dans /api.
//
// Rôle : quand un client clique "Renoncer au contrat" et confirme, le front-end appelle cette
// route. Elle envoie automatiquement :
//   1. un accusé de réception au client — c'est la pièce probatoire exigée par la loi depuis
//      le 19 juin 2026 (art. D221-5 du Code de la consommation), qui doit partir sans
//      intervention du freelance
//   2. une notification au freelance, pour qu'il soit informé tout de suite
//
// ⚠️ À VÉRIFIER AVANT DE DÉPLOYER — variables confirmées le 5 sept. 2026 dans le projet Vercel :
//   - VITE_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY existent déjà, noms alignés ci-dessous.
//   - RESEND_API_KEY reste à créer (aucune clé Resend trouvée dans les variables existantes).
//   - L'adresse "from" de l'email : doit être une adresse vérifiée dans ton compte Resend
//     (Domains → freeley.fr avec une coche verte).
//   - La récupération de l'email du freelance : ci-dessous je le cherche via l'API admin
//     Supabase à partir de user_id. Si tu stockes déjà l'email du freelance ailleurs
//     (table "profiles" par exemple), remplace ce bloc par une simple lecture de cette table.

import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // clé service_role — jamais la clé publique anon ici
);
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { contractId } = req.body || {};
  if (!contractId) return res.status(400).json({ error: "contractId manquant" });

  const { data: row, error } = await supabase
    .from("contracts")
    .select("content, user_id")
    .eq("id", contractId)
    .single();

  if (error || !row) {
    console.error("confirm-retraction: contrat introuvable", error);
    return res.status(404).json({ error: "Contrat introuvable" });
  }

  const content = typeof row.content === "string" ? JSON.parse(row.content) : (row.content || {});
  const clientEmail = content.form?.clientEmail || content.clientEmail || "";
  const clientName = content.form?.clientName || content.clientName || "";
  const missionTitle = content.missionTitle || content.form?.missionTitle || "votre mission";
  const exercisedAt = content.retractationExercisedAt || new Date().toISOString();
  const dateStr = new Date(exercisedAt).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" });

  // Récupération de l'email du freelance à partir de user_id (à adapter si tu as une table profiles)
  let freelanceEmail = null;
  try {
    const { data: userData } = await supabase.auth.admin.getUserById(row.user_id);
    freelanceEmail = userData?.user?.email || null;
  } catch (e) {
    console.error("confirm-retraction: impossible de récupérer l'email du freelance", e);
  }

  const results = { clientEmailSent: false, freelanceEmailSent: false };

  try {
    if (clientEmail) {
      await resend.emails.send({
        from: "Freeley <contact@freeley.fr>", // vérifie que cette adresse est bien validée dans Resend
        to: clientEmail,
        subject: `Confirmation de votre rétractation — ${missionTitle}`,
        text: `Bonjour ${clientName},\n\nNous confirmons la bonne réception de votre demande de rétractation concernant le contrat « ${missionTitle} », reçue le ${dateStr}.\n\nConformément à l'article D221-5 du Code de la consommation, cet email constitue votre accusé de réception. Le contrat est annulé à compter de cette date.\n\nCordialement,\nFreeley`,
      });
      results.clientEmailSent = true;
    }
  } catch (e) {
    console.error("confirm-retraction: échec envoi email client", e);
  }

  try {
    if (freelanceEmail) {
      await resend.emails.send({
        from: "Freeley <contact@freeley.fr>",
        to: freelanceEmail,
        subject: `Un client s'est rétracté — ${missionTitle}`,
        text: `Bonjour,\n\n${clientName || "Votre client"} a exercé son droit de rétractation le ${dateStr} pour la mission « ${missionTitle} ».\n\nSi une partie de la prestation a déjà été réalisée, pense à établir la facturation proportionnelle correspondante.\n\nCordialement,\nFreeley`,
      });
      results.freelanceEmailSent = true;
    }
  } catch (e) {
    console.error("confirm-retraction: échec envoi email freelance", e);
  }

  // On répond toujours 200 : l'enregistrement en base (côté front) est déjà fait et constitue
  // la preuve légale principale, même si l'un des deux emails échoue.
  return res.status(200).json({ ok: true, ...results });
}
