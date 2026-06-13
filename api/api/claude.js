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
    let messages, max_tokens, model;

    if (body.prompt) {
      messages = [{ role: "user", content: body.prompt }];
      max_tokens = 5000;
      model = "claude-sonnet-4-6";
    } else {
      messages = body.messages;
      max_tokens = body.max_tokens || 1000;
      model = body.model || "claude-sonnet-4-6";
    }

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({ model, max_tokens, messages }),
    });

    if (!anthropicRes.ok) {
      return res.status(502).json({ error: "Erreur Anthropic." });
    }

    const data = await anthropicRes.json();
    const text = (data.content || [])
      .map(b => b.type === "text" ? b.text : "")
      .join("\n").trim();

    return res.status(200).json({ content: text, raw: data });

  } catch (err) {
    return res.status(500).json({ error: "Erreur serveur." });
  }
}
