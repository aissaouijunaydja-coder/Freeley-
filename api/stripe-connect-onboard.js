export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { userId, email, existingAccountId, returnUrl, refreshUrl } = req.body;
    if (!userId) return res.status(400).json({ error: "userId manquant" });
    let accountId = existingAccountId;
    if (!accountId) {
      const params = new URLSearchParams();
      params.append("type", "express");
      params.append("country", "FR");
      if (email) params.append("email", email);
      params.append("capabilities[card_payments][requested]", "true");
      params.append("capabilities[transfers][requested]", "true");
      params.append("business_type", "individual");
      const acctRes = await fetch("https://api.stripe.com/v1/accounts", {
        method: "POST",
        headers: { "Authorization": `Bearer ${process.env.STRIPE_SECRET_KEY}`, "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      });
      const acctData = await acctRes.json();
      if (!acctRes.ok) {
        console.error("[stripe-connect] Erreur création compte:", acctData);
        return res.status(acctRes.status).json({ error: acctData.error?.message || "Erreur Stripe" });
      }
      accountId = acctData.id;
    }
    const linkParams = new URLSearchParams();
    linkParams.append("account", accountId);
    linkParams.append("type", "account_onboarding");
    linkParams.append("refresh_url", refreshUrl || "https://freeley-ten.vercel.app/?stripe_connect=refresh");
    linkParams.append("return_url", returnUrl || "https://freeley-ten.vercel.app/?stripe_connect=done");
    const linkRes = await fetch("https://api.stripe.com/v1/account_links", {
      method: "POST",
      headers: { "Authorization": `Bearer ${process.env.STRIPE_SECRET_KEY}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: linkParams.toString(),
    });
    const linkData = await linkRes.json();
    if (!linkRes.ok) {
      console.error("[stripe-connect] Erreur création lien:", linkData);
      return res.status(linkRes.status).json({ error: linkData.error?.message || "Erreur Stripe" });
    }
    return res.status(200).json({ accountId, url: linkData.url });
  } catch (err) {
    console.error("[stripe-connect-onboard] Erreur:", err);
    return res.status(500).json({ error: err.message });
  }
}
