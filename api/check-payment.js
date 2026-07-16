export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const sessionId = req.method === "GET" ? req.query.sessionId : req.body?.sessionId;
  if (!sessionId) return res.status(400).json({ error: "sessionId manquant" });

  try {
    const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
      headers: { "Authorization": `Bearer ${process.env.STRIPE_SECRET_KEY}` },
    });
    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || "Erreur Stripe" });
    }
    return res.status(200).json({ paid: data.payment_status === "paid" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
