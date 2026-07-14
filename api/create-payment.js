export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { amount, description, successUrl, cancelUrl, customerEmail, metadata } = req.body;
    console.log("[create-payment] metadata reçue :", JSON.stringify(metadata));
    if (!amount || amount <= 0) return res.status(400).json({ error: "Montant invalide" });
    const params = new URLSearchParams();
    params.append("mode", "payment");
    params.append("line_items[0][price_data][currency]", "eur");
    params.append("line_items[0][price_data][product_data][name]", description || "Paiement Freeley");
    params.append("line_items[0][price_data][unit_amount]", Math.round(amount * 100));
    params.append("line_items[0][quantity]", "1");
    params.append("success_url", successUrl || "https://freeley-ten.vercel.app/?paiement=succes");
    params.append("cancel_url", cancelUrl || "https://freeley-ten.vercel.app/?paiement=annule");
    if (customerEmail) params.append("customer_email", customerEmail);
    if (metadata && typeof metadata === "object") {
      Object.entries(metadata).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(`metadata[${key}]`, String(value));
        }
      });
    }
    const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${process.env.STRIPE_SECRET_KEY}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
    const data = await response.json();
    if (!response.ok) {
      console.error("[stripe] Erreur:", data);
      return res.status(response.status).json({ error: data.error?.message || "Erreur Stripe" });
    }
    return res.status(200).json({ url: data.url, id: data.id, _debug: metadata || null });
  } catch (err) {
    console.error("[create-payment] Erreur:", err);
    return res.status(500).json({ error: err.message });
  }
}
