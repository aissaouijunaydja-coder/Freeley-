// api/delete-account.js
//
// Supprime réellement le compte d'un utilisateur (auth Supabase) + toutes ses données.
// Doit rester côté serveur : la clé service_role a tous les droits et ne doit
// JAMAIS être exposée au navigateur (ne jamais la préfixer par VITE_).
//
// Version 239 : tout ou rien, et une réponse qui dit ce qui s'est vraiment passé.
//  - Avec le script SQL v239 (déclencheur sur auth.users) : supprimer le compte efface aussi toutes ses données,
//    dans la même opération de la base. Si quelque chose échoue, rien n'est effacé.
//  - Script v239 lancé sans déclencheur : les données partent d'un seul coup (fonction delete_account_data),
//    puis le compte.
//  - Script v239 pas encore lancé : les données sont effacées table par table, en s'arrêtant à la première
//    erreur, et le compte n'est supprimé qu'une fois toutes ses données effacées.
// Réponses :
//   200 { success: true }
//   500 { error, stage: 'data', nothingDeleted: true }     rien n'a été effacé
//   500 { error, stage: 'data', partial: true }            une partie des données a pu être effacée, le compte existe encore
//   500 { error, stage: 'account', dataDeleted: true }     les données sont effacées, mais le compte existe encore
//   500 { error, stage: 'account', nothingDeleted: true }  (script v239) rien n'a été effacé
//
// Variables d'environnement nécessaires sur Vercel :
//   - VITE_SUPABASE_URL           (déjà présente dans le projet)
//   - SUPABASE_SERVICE_ROLE_KEY   (déjà en place)

import { createClient } from '@supabase/supabase-js';

// Sans le script SQL v239 : les tables rangées par compte, celles qui dépendent des contrats d'abord.
// Le profil (rangé par id) passe en dernier.
const TABLES_BY_USER = ['alert_reads', 'recettes', 'payment_links', 'ai_usage', 'client_ratings', 'invoice_counters', 'ndas', 'contracts'];

// Table ou fonction absente de la base (script pas lancé) : on passe à la suite
const isMissingTable = (error) => !!error && (error.code === 'PGRST205' || error.code === '42P01'
  || /could not find the table|does not exist/i.test(String(error.message || '')));
const isMissingFunction = (error) => !!error && (error.code === 'PGRST202' || error.code === '42883'
  || /could not find the function/i.test(String(error.message || '')));

const fail = (res, body) => res.status(500).json({ error: 'Deletion failed', ...body });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Missing authorization token', nothingDeleted: true });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('delete-account: missing env vars (VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY)');
    return res.status(500).json({ error: 'Server misconfigured', stage: 'data', nothingDeleted: true });
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
  if (userError || !userData?.user) {
    return res.status(401).json({ error: 'Invalid or expired session', nothingDeleted: true });
  }

  const userId = userData.user.id;
  // Où on en est, pour répondre juste même en cas d'erreur imprévue
  let progress = 'none'; // none | some | data_done | atomic

  try {
    // 1) Script SQL v239 en place : une seule opération, tout ou rien
    let ready = false;
    try {
      const { data, error } = await supabaseAdmin.rpc('account_deletion_ready');
      ready = !error && data === true;
    } catch (e) { ready = false; }

    if (ready) {
      progress = 'atomic';
      const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
      if (error) {
        console.error('delete-account: deleteUser failed, nothing deleted', error);
        return fail(res, { stage: 'account', nothingDeleted: true });
      }
      return res.status(200).json({ success: true });
    }

    // 2) Script v239 lancé sans déclencheur : toutes les données d'un seul coup
    let dataDeleted = false;
    const { error: rpcError } = await supabaseAdmin.rpc('delete_account_data', { p_user_id: userId });
    if (!rpcError) {
      dataDeleted = true;
    } else if (!isMissingFunction(rpcError)) {
      console.error('delete-account: delete_account_data failed, nothing deleted', rpcError);
      return fail(res, { stage: 'data', nothingDeleted: true });
    }

    // 3) Script v239 pas lancé : table par table, arrêt à la première erreur (le compte reste alors intact)
    if (!dataDeleted) {
      for (const table of TABLES_BY_USER) {
        const { error, count } = await supabaseAdmin.from(table).delete({ count: 'exact' }).eq('user_id', userId);
        if (error) {
          if (isMissingTable(error)) continue;
          console.error(`delete-account: failed to clean table "${table}"`, error);
          return fail(res, { stage: 'data', ...(progress === 'some' ? { partial: true } : { nothingDeleted: true }) });
        }
        if (count === null || count === undefined || count > 0) progress = 'some';
      }
      const { error: profileError, count: profileCount } = await supabaseAdmin.from('profiles').delete({ count: 'exact' }).eq('id', userId);
      if (profileError && !isMissingTable(profileError)) {
        console.error('delete-account: failed to clean table "profiles"', profileError);
        return fail(res, { stage: 'data', ...(progress === 'some' ? { partial: true } : { nothingDeleted: true }) });
      }
      if (!profileError && (profileCount === null || profileCount === undefined || profileCount > 0)) progress = 'some';
    }
    progress = 'data_done';

    // 4) Le compte lui-même, une fois toutes ses données effacées
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (deleteUserError) {
      console.error('delete-account: data deleted but deleteUser failed', deleteUserError);
      return fail(res, { stage: 'account', dataDeleted: true });
    }

    return res.status(200).json({ success: true });
  } catch (e) {
    console.error('delete-account error:', e);
    if (progress === 'data_done') return fail(res, { stage: 'account', dataDeleted: true });
    if (progress === 'some') return fail(res, { stage: 'data', partial: true });
    if (progress === 'atomic') return fail(res, { stage: 'account', nothingDeleted: true });
    return fail(res, { stage: 'data', nothingDeleted: true });
  }
}
