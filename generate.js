// api/generate.js — Vercel Serverless Function
// La clé API Anthropic reste côté serveur, jamais exposée au navigateur.

export default async function handler(req, res) {
  // 1. Méthode autorisée : POST uniquement
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  // 2. Récupérer le prompt envoyé par le front
  const { prompt } = req.body;
  if (!prompt || typeof prompt !== "string" || prompt.trim().length < 10) {
    return res.status(400).json({ error: "Prompt invalide ou manquant." });
  }

  // 3. Clé API lue depuis les variables d'environnement Vercel (jamais dans le code)
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_API_KEY) {
    console.error("[ContratPro] ANTHROPIC_API_KEY manquante dans les variables d'environnement.");
    return res.status(500).json({ error: "Configuration serveur manquante. Contacte le support." });
  }

  // 4. Appel à l'API Anthropic — côté serveur uniquement
  try {
    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type":         "application/json",
        "x-api-key":            ANTHROPIC_API_KEY,
        "anthropic-version":    "2023-06-01",
      },
      body: JSON.stringify({
        model:      "claude-sonnet-4-6",
        max_tokens: 5000,
        messages:   [{ role: "user", content: prompt }],
      }),
    });

    // 5. Gestion des erreurs API Anthropic
    if (!anthropicRes.ok) {
      const errBody = await anthropicRes.text().catch(() => "");
      console.error("[ContratPro] Erreur Anthropic:", anthropicRes.status, errBody);
      return res.status(502).json({
        error: `Erreur lors de la génération (${anthropicRes.status}). Réessaie dans quelques instants.`,
      });
    }

    const data = await anthropicRes.json();

    // 6. Extraire le texte généré
    const text = (data.content || [])
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("\n")
      .trim();

    if (!text) {
      return res.status(502).json({ error: "Réponse vide reçue du modèle. Réessaie." });
    }

    // 7. Renvoyer uniquement le texte au front (pas les métadonnées Anthropic)
    return res.status(200).json({ content: text });

  } catch (err) {
    console.error("[ContratPro] Erreur serveur:", err);
    return res.status(500).json({
      error: "Erreur serveur inattendue. Vérifie ta connexion et réessaie.",
    });
  }
}
