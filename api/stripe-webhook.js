// api/stripe-webhook.js
// Écoute les paiements Stripe réussis et met à jour automatiquement Freeley.
// Volontairement SANS dépendance externe (ni "stripe", ni "@supabase/supabase-js")
// — uniquement des outils déjà intégrés à Node — pour éviter tout souci d'installation
// de paquet, comme create-payment.js le fait déjà pour Stripe.

import crypto from "crypto";

export const config = {
  api: {
    bodyParser: false, // Stripe a besoin du corps BRUT de la requête pour vérifier la signature
  },
};

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

// Vérifie manuellement la signature Stripe (même algorithme que le SDK officiel, sans le paquet)
function verifyStripeSignature(rawBody, signatureHeader, secret) {
  if (!signatureHeader) return false;
  const parts = signatureHeader.split(",").reduce((acc, part) => {
    const [k, v] = part.split("=");
    acc[k] = v;
    return acc;
  }, {});
  const timestamp = parts.t;
  const signature = parts.v1;
  if (!timestamp || !signature) return false;

  const signedPayload = `${timestamp}.${rawBody.toString("utf8")}`;
  const expected = crypto.createHmac("sha256", secret).update(signedPayload, "utf8").digest("hex");

  try {
    const sigBuf = Buffer.from(signature, "hex");
    const expBuf = Buffer.from(expected, "hex");
    if (sigBuf.length !== expBuf.length) return false;
    return crypto.timingSafeEqual(sigBuf, expBuf);
  } catch (e) {
    return false;
  }
}

// Met à jour un contrat via l'API REST de Supabase directement (pas de paquet nécessaire)
async function supabaseRequest(path, options) {
  const url = `${process.env.VITE_SUPABASE_URL}/rest/v1/${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "apikey": process.env.SUPABASE_SERVICE_ROLE_KEY,
      "Authorization": `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });
  return res;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  const rawBody = await readRawBody(req);
  const sig = req.headers["stripe-signature"];

  const valid = verifyStripeSignature(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  if (!valid) {
    console.error("Signature webhook Stripe invalide.");
    return res.status(400).send("Signature invalide");
  }

  let event;
  try {
    event = JSON.parse(rawBody.toString("utf8"));
  } catch (e) {
    return res.status(400).send("Corps de requête invalide");
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const metadata = session.metadata || {};
    const { contractId, paymentType, avenantNum } = metadata;

    if (contractId) {
      try {
        if (paymentType === "avenant" && avenantNum) {
          // Paiement d'un avenant précis : on met à jour SEULEMENT cet avenant, sans toucher au reste
          const getRes = await supabaseRequest(`contracts?id=eq.${contractId}&select=content`, { method: "GET" });
          const rows = await getRes.json();
          const existing = rows && rows[0];
          if (existing) {
            let content = {};
            try { content = typeof existing.content === "string" ? JSON.parse(existing.content) : (existing.content || {}); } catch(e) {}
            const avenants = Array.isArray(content.avenants) ? content.avenants : [];
            const idx = avenants.findIndex(a => String(a.num) === String(avenantNum));
            if (idx !== -1) {
              avenants[idx] = { ...avenants[idx], paymentReceived: true };
              const newContent = JSON.stringify({ ...content, avenants });
              await supabaseRequest(`contracts?id=eq.${contractId}`, {
                method: "PATCH",
                headers: { "Prefer": "return=minimal" },
                body: JSON.stringify({ content: newContent }),
              });
            }
          }
        } else {
          // Paiement du contrat principal (acompte ou paiement comptant)
          await supabaseRequest(`contracts?id=eq.${contractId}`, {
            method: "PATCH",
            headers: { "Prefer": "return=minimal" },
            body: JSON.stringify({ payment_status: "paid" }),
          });
        }
      } catch (e) {
        console.error("Erreur mise à jour paiement (webhook Stripe):", e);
      }
    } else {
      console.warn("checkout.session.completed reçu sans contractId dans les metadata — rien à mettre à jour.");
    }
  }

  res.status(200).json({ received: true });
}
