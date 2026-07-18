// api/delete-account.js
//
// Supprime réellement le compte d'un utilisateur (auth Supabase) + toutes ses données.
// Doit rester côté serveur : la clé service_role a tous les droits et ne doit
// JAMAIS être exposée au navigateur (ne jamais la préfixer par VITE_).
//
// Variables d'environnement nécessaires sur Vercel :
//   - VITE_SUPABASE_URL           (déjà présente dans le projet)
//   - SUPABASE_SERVICE_ROLE_KEY   (déjà en place)

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

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
  if (userError || !userData?.user) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }

  const userId = userData.user.id;

  try {
    const tablesToClean = ['contracts', 'invoice_counters', 'client_ratings', 'ndas'];
    for (const table of tablesToClean) {
      const { error } = await supabaseAdmin.from(table).delete().eq('user_id', userId);
      if (error) {
        console.error(`delete-account: failed to clean table "${table}"`, error);
      }
    }

    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (deleteUserError) throw deleteUserError;

    return res.status(200).json({ success: true });
  } catch (e) {
    console.error('delete-account error:', e);
    return res.status(500).json({ error: 'Deletion failed' });
  }
}
