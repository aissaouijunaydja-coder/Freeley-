// Étape 2 de la facturation électronique — génère une vraie facture Freeley au format UBL
// (le format XML structuré exigé par la réforme), puis la fait VALIDER par Super PDP avant
// tout envoi réel. Rien n'est transmis à un vrai client ici — on vérifie juste que le document
// qu'on fabrique est correct, pour pouvoir corriger si besoin avant de passer à l'étape 3 (envoi réel).
//
// Corrigé après un premier test réel de validation (voir historique) : ordre des balises XML,
// SIREN du vendeur obligatoire même sans TVA, mentions légales obligatoires (pénalités,
// recouvrement, escompte), et code de "cadre de facturation" français.

// Échappe les caractères spéciaux XML (obligatoire pour tout texte libre injecté dans le XML,
// comme le nom d'un client ou une désignation de mission)
const esc = (s) =>
  String(s ?? "").replace(/[<>&'"]/g, (c) => ({
    "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;",
  }[c]));

const fmt2 = (n) => Number(n || 0).toFixed(2);

// Extrait le SIREN (9 premiers chiffres) à partir d'un SIRET (14 chiffres)
const toSiren = (siret) => {
  const digits = String(siret || "").replace(/\D/g, "");
  return digits.length >= 9 ? digits.slice(0, 9) : digits;
};

// Sépare une adresse en une seule ligne (ex: "12 rue de la Paix, 75002 Paris") en
// rue / code postal / ville — le format UBL exige ces informations séparément.
// Best-effort : Freeley stocke l'adresse en texte libre, donc on repère le code postal
// français (5 chiffres) pour couper le reste en deux.
function splitAddress(raw) {
  const address = String(raw || "").trim();
  const match = address.match(/(\d{5})/);
  if (!match) return { street: address || "Non renseigné", zone: "00000", city: "Non renseigné" };
  const idx = match.index;
  const street = address.slice(0, idx).replace(/[,\s]+$/, "").trim() || "Non renseigné";
  const after = address.slice(idx + 5).replace(/^[,\s]+/, "").trim();
  return { street, zone: match[1], city: after || "Non renseigné" };
}

function buildPartyXml({ name, siret, address, email, tvaNumber }) {
  const { street, zone, city } = splitAddress(address);
  const siren = toSiren(siret);
  // Identifiant fiscal obligatoire dès que la facture mentionne une exonération de TVA (BR-E-02) —
  // on utilise le numéro de TVA s'il existe, sinon le SIREN sert d'identifiant fiscal de repli.
  const taxScheme = tvaNumber
    ? `<cac:PartyTaxScheme><cbc:CompanyID>${esc(tvaNumber)}</cbc:CompanyID><cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme></cac:PartyTaxScheme>`
    : (siren ? `<cac:PartyTaxScheme><cbc:CompanyID>${esc(siren)}</cbc:CompanyID><cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme></cac:PartyTaxScheme>` : "");
  return `<cac:Party>
      ${siren ? `<cbc:EndpointID schemeID="0009">${esc(siren)}</cbc:EndpointID>` : ""}
      <cac:PartyName><cbc:Name>${esc(name)}</cbc:Name></cac:PartyName>
      <cac:PostalAddress>
        <cbc:StreetName>${esc(street)}</cbc:StreetName>
        <cbc:CityName>${esc(city)}</cbc:CityName>
        <cbc:PostalZone>${esc(zone)}</cbc:PostalZone>
        <cac:Country><cbc:IdentificationCode>FR</cbc:IdentificationCode></cac:Country>
      </cac:PostalAddress>
      ${taxScheme}
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${esc(name)}</cbc:RegistrationName>
        ${siren ? `<cbc:CompanyID schemeID="0002">${esc(siren)}</cbc:CompanyID>` : ""}
      </cac:PartyLegalEntity>
      ${email ? `<cac:Contact><cbc:ElectronicMail>${esc(email)}</cbc:ElectronicMail></cac:Contact>` : ""}
    </cac:Party>`;
}

// Construit le XML UBL complet d'une facture, conforme au socle EN16931 + règles françaises (CIUS France).
function buildUblInvoice(data) {
  const {
    invoiceNum, designation, missionTitle, montant,
    freelanceName, freelanceSiret, freelanceEmail, freelanceAddress, tvaNumber,
    clientName, clientCompany, clientAddress, clientEmail, clientSiret,
    typeClient,
  } = data;

  const today = new Date().toISOString().slice(0, 10);
  const montantNum = Number(montant) || 0;
  const tvaApplicable = !!(tvaNumber && String(tvaNumber).trim());
  const tvaAmount = tvaApplicable ? montantNum * 0.2 : 0;
  const totalTtc = montantNum + tvaAmount;
  const taxCategoryId = tvaApplicable ? "S" : "E";
  const taxPercent = tvaApplicable ? "20.0" : "0";
  const exemptionReason = tvaApplicable
    ? ""
    : `<cbc:TaxExemptionReasonCode>VATEX-EU-79-C</cbc:TaxExemptionReasonCode><cbc:TaxExemptionReason>TVA non applicable, art. 293 B du CGI</cbc:TaxExemptionReason>`;

  const supplier = buildPartyXml({
    name: freelanceName, siret: freelanceSiret, address: freelanceAddress,
    email: freelanceEmail, tvaNumber,
  });
  const customer = buildPartyXml({
    name: clientCompany || clientName, siret: clientSiret, address: clientAddress,
    email: clientEmail, tvaNumber: null,
  });

  // Mentions obligatoires françaises (BR-FR-05), avec leur code entre # # exigé par le validateur,
  // en plus du texte lisible — mêmes mentions que celles déjà affichées sur le PDF de la facture.
  const penaltyNote = typeClient === "particulier"
    ? "#PMD# Pénalités de retard : en cas de paiement au-delà de la date d'échéance, des pénalités calculées au taux d'intérêt légal en vigueur applicable aux consommateurs seront appliquées de plein droit."
    : "#PMD# Pénalités de retard : taux BCE majoré de 10 points, applicable de plein droit dès le lendemain de l'échéance (art. L441-10 C. com.).";
  const recoveryNote = "#PMT# Indemnité forfaitaire de recouvrement : 40 € (art. D441-5 C. com.), due pour toute facture réglée en retard.";
  const discountNote = "#AAB# Pas d'escompte pour paiement anticipé.";
  const notes = [
    `${esc(designation)} — ${esc(missionTitle || "Prestation de services")}`,
    esc(penaltyNote),
    esc(recoveryNote),
    esc(discountNote),
  ].map((n) => `<cbc:Note>${n}</cbc:Note>`).join("\n  ");

  return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:CustomizationID>urn:cen.eu:en16931:2017</cbc:CustomizationID>
  <cbc:ProfileID>S1</cbc:ProfileID>
  <cbc:ID>${esc(invoiceNum)}</cbc:ID>
  <cbc:IssueDate>${today}</cbc:IssueDate>
  <cbc:DueDate>${today}</cbc:DueDate>
  <cbc:InvoiceTypeCode>380</cbc:InvoiceTypeCode>
  ${notes}
  <cbc:DocumentCurrencyCode>EUR</cbc:DocumentCurrencyCode>
  <cac:AccountingSupplierParty>${supplier}</cac:AccountingSupplierParty>
  <cac:AccountingCustomerParty>${customer}</cac:AccountingCustomerParty>
  <cac:PaymentTerms><cbc:Note>Paiement à réception de facture</cbc:Note></cac:PaymentTerms>
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="EUR">${fmt2(tvaAmount)}</cbc:TaxAmount>
    <cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="EUR">${fmt2(montantNum)}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="EUR">${fmt2(tvaAmount)}</cbc:TaxAmount>
      <cac:TaxCategory>
        <cbc:ID>${taxCategoryId}</cbc:ID>
        <cbc:Percent>${taxPercent}</cbc:Percent>
        ${exemptionReason}
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:TaxCategory>
    </cac:TaxSubtotal>
  </cac:TaxTotal>
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="EUR">${fmt2(montantNum)}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="EUR">${fmt2(montantNum)}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="EUR">${fmt2(totalTtc)}</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="EUR">${fmt2(totalTtc)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
  <cac:InvoiceLine>
    <cbc:ID>1</cbc:ID>
    <cbc:InvoicedQuantity unitCode="EA">1</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="EUR">${fmt2(montantNum)}</cbc:LineExtensionAmount>
    <cac:Item>
      <cbc:Name>${esc(designation)} — ${esc(missionTitle || "Prestation de services")}</cbc:Name>
      <cac:ClassifiedTaxCategory>
        <cbc:ID>${taxCategoryId}</cbc:ID>
        <cbc:Percent>${taxPercent}</cbc:Percent>
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:ClassifiedTaxCategory>
    </cac:Item>
    <cac:Price><cbc:PriceAmount currencyID="EUR">${fmt2(montantNum)}</cbc:PriceAmount></cac:Price>
  </cac:InvoiceLine>
</Invoice>`;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const xml = buildUblInvoice(req.body || {});

    // Validation automatique auprès de Super PDP — ne nécessite pas d'authentification,
    // c'est un service public de vérification.
    const form = new FormData();
    form.append("file", new Blob([xml], { type: "application/xml" }), "facture.xml");

    const validationResp = await fetch("https://api.superpdp.tech/v1.beta/validation_reports", {
      method: "POST",
      body: form,
    });

    let validation = null;
    if (validationResp.ok) {
      validation = await validationResp.json();
    } else {
      validation = { error: `HTTP ${validationResp.status}`, details: await validationResp.text() };
    }

    return res.status(200).json({ xml, validation });
  } catch (err) {
    console.error("[generate-ubl-invoice] Erreur:", err);
    return res.status(500).json({ error: err.message });
  }
}
