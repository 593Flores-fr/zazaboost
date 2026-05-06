import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { NextRequest } from "next/server";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(amount);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR").format(new Date(date));
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const quote = await prisma.quote.findUnique({
    where: { id },
    include: { client: true, project: true, items: true },
  });

  if (!quote) notFound();

  const itemsRows = quote.items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;">${item.description}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:right;">${item.quantity}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:right;">${formatCurrency(item.unitPrice)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:500;">${formatCurrency(item.total)}</td>
      </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Devis ${quote.number}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; font-size: 14px; color: #333; padding: 40px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
  .brand { font-size: 22px; font-weight: bold; color: #4f46e5; }
  .brand-sub { font-size: 12px; color: #888; margin-top: 2px; }
  .quote-title { text-align: right; }
  .quote-title h1 { font-size: 28px; font-weight: 700; color: #111; }
  .quote-title p { color: #888; margin-top: 4px; }
  .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px; }
  .meta-block label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #888; font-weight: 600; display: block; margin-bottom: 4px; }
  .meta-block p { font-size: 14px; color: #111; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  thead th { background: #f9fafb; text-align: left; padding: 10px 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #888; border-bottom: 2px solid #e5e7eb; }
  thead th:last-child, thead th:nth-child(2), thead th:nth-child(3) { text-align: right; }
  .totals { margin-left: auto; width: 280px; }
  .totals tr td { padding: 6px 12px; font-size: 13px; }
  .totals tr td:first-child { color: #666; }
  .totals tr td:last-child { text-align: right; font-weight: 500; }
  .totals .total-ttc td { font-size: 16px; font-weight: 700; border-top: 2px solid #e5e7eb; padding-top: 12px; color: #4f46e5; }
  .notes { background: #f9fafb; border-radius: 8px; padding: 16px; margin-top: 32px; }
  .notes label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #888; font-weight: 600; display: block; margin-bottom: 8px; }
  .footer { text-align: center; margin-top: 48px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #aaa; }
</style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">FreelanceOS</div>
      <div class="brand-sub">Allan — Graphiste & Développeur</div>
    </div>
    <div class="quote-title">
      <h1>DEVIS</h1>
      <p>${quote.number}</p>
    </div>
  </div>

  <div class="meta">
    <div class="meta-block">
      <label>Client</label>
      <p>${quote.client?.name ?? "—"}</p>
      ${quote.client?.company ? `<p style="color:#666;">${quote.client.company}</p>` : ""}
      ${quote.client?.email ? `<p style="color:#666;">${quote.client.email}</p>` : ""}
    </div>
    <div class="meta-block" style="text-align:right;">
      <label>Date d'émission</label>
      <p>${formatDate(quote.issueDate)}</p>
      ${quote.validUntil ? `<label style="margin-top:12px;">Valable jusqu'au</label><p>${formatDate(quote.validUntil)}</p>` : ""}
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th style="text-align:right;">Qté</th>
        <th style="text-align:right;">Prix unit. HT</th>
        <th style="text-align:right;">Total HT</th>
      </tr>
    </thead>
    <tbody>
      ${itemsRows}
    </tbody>
  </table>

  <table class="totals">
    <tr>
      <td>Total HT</td>
      <td>${formatCurrency(quote.totalHT)}</td>
    </tr>
    <tr>
      <td>TVA (${quote.tva}%)</td>
      <td>${formatCurrency(quote.totalTTC - quote.totalHT)}</td>
    </tr>
    <tr class="total-ttc">
      <td>Total TTC</td>
      <td>${formatCurrency(quote.totalTTC)}</td>
    </tr>
  </table>

  ${quote.notes ? `<div class="notes"><label>Notes et conditions</label><p>${quote.notes}</p></div>` : ""}

  <div class="footer">Devis généré le ${formatDate(new Date())} — FreelanceOS</div>
</body>
</html>`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
