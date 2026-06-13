export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Methode non autorisee" });
  }

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: "Configuration serveur manquante." });
  }

  try {
    const body = req.body;
    if (!body.model) body.model = "claude-sonnet-4-6";
    if (!body.max_tokens) body.max_tokens = 1000;

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });

    if (!anthropicRes.ok) {
      return res.status(502).json({ error: "Erreur Anthropic." });
    }

    const data = await anthropicRes.json();
    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ error: "Erreur serveur." });
  }
}
