// Étape 2 de la facturation électronique — génère une vraie facture Freeley au format UBL
// (le format XML structuré exigé par la réforme), puis la fait VALIDER par Super PDP avant
// tout envoi réel. Rien n'est transmis à un vrai client ici — on vérifie juste que le document
// qu'on fabrique est correct, pour pouvoir corriger si besoin avant de passer à l'étape 3 (envoi réel).

// Échappe les caractères spéciaux XML (obligatoire pour tout texte libre injecté dans le XML,
// comme le nom d'un client ou une désignation de mission)
const esc = (s) =>
  String(s ?? "").replace(/[<>&'"]/g, (c) => ({
    "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;",
  }[c]));

const fmt2 = (n) => Number(n || 0).toFixed(2);

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

function buildPartyXml({ name, siret, address, email, tvaNumber, isSupplier }) {
  const { street, zone, city } = splitAddress(address);
  const legalId = siret && siret.replace(/\s/g, "").length === 14
    ? siret.replace(/\s/g, "")
    : (siret || "").replace(/\s/g, "");
  const taxScheme = tvaNumber
    ? `<cac:PartyTaxScheme><cbc:CompanyID>${esc(tvaNumber)}</cbc:CompanyID><cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme></cac:PartyTaxScheme>`
    : "";
  return `<cac:Party>
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
        ${legalId ? `<cbc:CompanyID schemeID="0009">${esc(legalId)}</cbc:CompanyID>` : ""}
      </cac:PartyLegalEntity>
      ${email ? `<cac:Contact><cbc:ElectronicMail>${esc(email)}</cbc:ElectronicMail></cac:Contact>` : ""}
    </cac:Party>`;
}

// Construit le XML UBL complet d'une facture, conforme au socle EN16931.
function buildUblInvoice(data) {
  const {
    invoiceNum, designation, missionTitle, montant,
    freelanceName, freelanceSiret, freelanceEmail, freelanceAddress, tvaNumber,
    clientName, clientCompany, clientAddress, clientEmail, clientSiret,
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
    email: freelanceEmail, tvaNumber, isSupplier: true,
  });
  const customer = buildPartyXml({
    name: clientCompany || clientName, siret: clientSiret, address: clientAddress,
    email: clientEmail, tvaNumber: null, isSupplier: false,
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:CustomizationID>urn:cen.eu:en16931:2017</cbc:CustomizationID>
  <cbc:ID>${esc(invoiceNum)}</cbc:ID>
  <cbc:IssueDate>${today}</cbc:IssueDate>
  <cbc:DueDate>${today}</cbc:DueDate>
  <cbc:InvoiceTypeCode>380</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>EUR</cbc:DocumentCurrencyCode>
  <cbc:Note>${esc(designation)} — ${esc(missionTitle || "Prestation de services")}</cbc:Note>
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
