export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const accountId = req.method === "GET" ? req.query.accountId : req.body?.accountId;
  if (!accountId) return res.status(400).json({ error: "accountId manquant" });
  try {
    const response = await fetch(`https://api.stripe.com/v1/accounts/${accountId}`, {
      headers: { "Authorization": `Bearer ${process.env.STRIPE_SECRET_KEY}` },
    });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data.error?.message || "Erreur Stripe" });
    return res.status(200).json({
      ready: !!(data.charges_enabled && data.details_submitted),
      chargesEnabled: !!data.charges_enabled,
      detailsSubmitted: !!data.details_submitted,
    });
  } catch (err) {
    console.error("[stripe-connect-status] Erreur:", err);
    return res.status(500).json({ error: err.message });
  }
}
