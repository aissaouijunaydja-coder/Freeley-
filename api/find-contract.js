// /api/find-contract.js
//
// NOUVEAU FICHIER — à ajouter dans ton dossier /api. Renomme-le "find-contract.js".
//
// Rôle : la page "j'ai perdu mon lien" (?trouver-contrat=1) envoie l'email tapé par le client
// à cette route. Elle cherche tous les contrats signés liés à cet email, et renvoie un email
// avec le lien vers chacun — que le délai de rétractation soit encore ouvert ou non (retrouver
// son contrat et avoir encore le droit de se rétracter sont deux choses séparées ; le bouton
// "Renoncer au contrat" s'affiche ou non une fois SUR la page du contrat, pas ici).
//
// Sécurité : cette route renvoie TOUJOURS la même réponse au navigateur, qu'un contrat
// corresponde ou non. Ça évite qu'on puisse deviner quelles adresses email ont un contrat
// chez toi juste en testant des adresses au hasard.
//
// ⚠️ À VÉRIFIER AVANT DE DÉPLOYER (mêmes remarques que pour confirm-retraction.js) :
//   - VITE_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY existent déjà dans le projet Vercel.
//   - RESEND_API_KEY reste à créer.
//   - adresse "from" à vérifier dans Resend (Domains → freeley.fr)

import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { email } = req.body || {};
  // Toujours répondre 200 même sans email valide : ne jamais donner d'indice sur ce qui a
  // été trouvé ou non.
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(200).json({ ok: true });
  }

  try {
    const { data: rows } = await supabase
      .from("contracts")
      .select("id, content")
      .eq("status", "signed");

    const emailLower = email.trim().toLowerCase();
    const matches = (rows || []).filter(r => {
      const c = typeof r.content === "string" ? JSON.parse(r.content) : (r.content || {});
      const ce = (c.form?.clientEmail || c.clientEmail || "").toLowerCase();
      return ce === emailLower;
    });

    const siteUrl = process.env.SITE_URL || "https://freeley.fr"; // adapte si ton domaine diffère

    for (const m of matches) {
      const c = typeof m.content === "string" ? JSON.parse(m.content) : (m.content || {});
      const link = `${siteUrl}/?sign=${m.id}`;
      const missionTitle = c.missionTitle || c.form?.missionTitle || "ta mission";
      try {
        await resend.emails.send({
          from: "Freeley <contact@freeley.fr>", // vérifie que cette adresse est bien validée dans Resend
          to: email,
          subject: `Retrouve ton contrat — ${missionTitle}`,
          text: `Bonjour,\n\nVoici le lien vers ton contrat « ${missionTitle} » :\n${link}\n\nCordialement,\nFreeley`,
        });
      } catch (e) {
        console.error("find-contract: échec envoi email pour un contrat", m.id, e);
        // on continue avec les autres contrats trouvés même si l'un des envois échoue
      }
    }
  } catch (e) {
    console.error("find-contract: erreur de recherche", e);
    // jamais remontée au client — toujours la même réponse générique
  }

  return res.status(200).json({ ok: true });
}
