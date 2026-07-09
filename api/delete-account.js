// api/delete-account.js
//
// Supprime réellement le compte d'un utilisateur (auth Supabase) + ses contrats.
// Doit rester côté serveur : la clé service_role a tous les droits et ne doit
// JAMAIS être exposée au navigateur (ne jamais la préfixer par VITE_).
//
// Variables d'environnement nécessaires sur Vercel :
//   - VITE_SUPABASE_URL           (déjà présente dans le projet)
//   - SUPABASE_SERVICE_ROLE_KEY   (NOUVELLE — à ajouter, voir instructions ci-dessous)
//
// Où trouver la clé service_role :
//   Dashboard Supabase → Settings → API → "service_role" (secret) → copier
//   Vercel → Project Settings → Environment Variables → ajouter
//   SUPABASE_SERVICE_ROLE_KEY = <la clé copiée>
//   ⚠️ Ne jamais nommer cette variable avec le préfixe VITE_, sinon Vite
//   l'inclurait dans le code envoyé au navigateur.

import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Missing authorization token' });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('delete-account: missing env vars (VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY)');
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  // Client "admin" avec la clé service_role — contourne les policies RLS, à utiliser avec précaution
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

  // Vérifie que le token fourni correspond bien à un utilisateur réel et authentifié
  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
  if (userError || !userData?.user) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }

  const userId = userData.user.id;

  try {
    // Supprime les contrats de l'utilisateur (au cas où le nettoyage côté client aurait échoué)
    const { error: contractsError } = await supabaseAdmin.from('contracts').delete().eq('user_id', userId);
    if (contractsError) {
      console.error('delete-account: failed to delete contracts', contractsError);
      // On continue quand même : mieux vaut supprimer le compte que rien du tout
    }

    // Supprime le compte d'authentification lui-même — irréversible
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (deleteUserError) throw deleteUserError;

    return res.status(200).json({ success: true });
  } catch (e) {
    console.error('delete-account error:', e);
    return res.status(500).json({ error: 'Deletion failed' });
  }
}
