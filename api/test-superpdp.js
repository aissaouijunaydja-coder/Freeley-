// Test de connexion Super PDP — étape 1 de l'intégration facturation électronique.
// Ne fait rien de réel : récupère juste un token, vérifie l'entreprise de test, et envoie
// une fausse facture de test fournie par Super PDP lui-même (aucun risque, aucune vraie donnée).
// Une fois qu'on aura confirmé que ça fonctionne, on construira notre propre génération Factur-X
// (étape 2) pour remplacer la fausse facture de test par une vraie facture Freeley.
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const endpoint = "https://api.superpdp.tech";
  const clientId = process.env.SUPER_PDP_CLIENT_ID;
  const clientSecret = process.env.SUPER_PDP_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return res.status(500).json({
      error: "Variables d'environnement SUPER_PDP_CLIENT_ID / SUPER_PDP_CLIENT_SECRET manquantes sur Vercel.",
    });
  }

  try {
    // 1. Obtention d'un token oauth2 (authentification auprès de Super PDP)
    const tokenResp = await fetch(`${endpoint}/oauth2/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
      }).toString(),
    });
    if (!tokenResp.ok) {
      const errText = await tokenResp.text();
      return res.status(502).json({ step: "oauth2_token", error: `HTTP ${tokenResp.status}`, details: errText });
    }
    const { access_token } = await tokenResp.json();
    const authHeaders = { Authorization: `Bearer ${access_token}` };

    // 2. Vérification de l'entreprise associée à la clé (doit afficher "Burger Queen" en sandbox)
    const companyResp = await fetch(`${endpoint}/v1.beta/companies/me`, { headers: authHeaders });
    if (!companyResp.ok) {
      const errText = await companyResp.text();
      return res.status(502).json({ step: "companies_me", error: `HTTP ${companyResp.status}`, details: errText });
    }
    const company = await companyResp.json();

    // 3. Téléchargement d'une facture de test prête à l'emploi, fournie par Super PDP
    const testInvoiceResp = await fetch(`${endpoint}/v1.beta/invoices/generate_test_invoice?format=ubl`, {
      headers: authHeaders,
    });
    if (!testInvoiceResp.ok) {
      const errText = await testInvoiceResp.text();
      return res.status(502).json({ step: "generate_test_invoice", error: `HTTP ${testInvoiceResp.status}`, details: errText });
    }
    const testInvoiceContent = await testInvoiceResp.text();

    // 4. Envoi réel de cette facture de test à Super PDP
    const sendResp = await fetch(`${endpoint}/v1.beta/invoices`, {
      method: "POST",
      headers: authHeaders,
      body: testInvoiceContent,
    });
    if (!sendResp.ok) {
      const errText = await sendResp.text();
      return res.status(502).json({ step: "send_invoice", error: `HTTP ${sendResp.status}`, details: errText });
    }
    const sentInvoice = await sendResp.json();

    return res.status(200).json({
      success: true,
      message: "Connexion Super PDP fonctionnelle — facture de test envoyée avec succès.",
      company_name: company.formal_name,
      invoice_id: sentInvoice.id,
    });
  } catch (err) {
    console.error("[test-superpdp] Erreur:", err);
    return res.status(500).json({ error: err.message });
  }
}
