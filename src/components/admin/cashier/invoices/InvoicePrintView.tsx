// Project path: src/components/cashier/invoices/InvoicePrintView.tsx
//
// ASSUMPTION — the brief says to reuse the existing invoice print
// implementation rather than build a new one. No existing print component
// was available to inspect in this session, so this is a self-contained
// fallback: it opens an isolated popup window with only the invoice
// markup and calls window.print() on it, so the app's sidebar/navbar/
// dialogs can never end up in the printed output regardless of the host
// page's print CSS. If the project already has a working print system
// (e.g. a print-only CSS class toggled on the main document, or a
// react-to-print setup), delete this file and wire `onPrint` in
// InvoiceTable / InvoiceCard / InvoiceDetailsDrawer to that instead —
// don't run both.

import type { CashierInvoiceResponse } from "@/types/cashier-invoice.types";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildInvoiceHtml(invoice: CashierInvoiceResponse): string {
  const customerLine = invoice.walkInCustomerName
    ? escapeHtml(invoice.walkInCustomerName) +
      (invoice.walkInCustomerPhone ? ` — ${escapeHtml(invoice.walkInCustomerPhone)}` : '')
    : invoice.customerId
      ? 'Registered customer'
      : 'Walk-in customer';

  const lineRows = (invoice.lines ?? [])
    .map(
      (line) => `
        <tr>
          <td>${escapeHtml(line.productName ?? '—')}</td>
          <td>${escapeHtml(line.sku ?? '—')}</td>
          <td class="num">${line.quantity}</td>
          <td class="num">${line.unitPrice.toFixed(2)}</td>
          <td class="num">${line.discountAmount.toFixed(2)}</td>
          <td class="num">${line.lineTotal.toFixed(2)}</td>
        </tr>`,
    )
    .join('');

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>${escapeHtml(invoice.invoiceNumber ?? 'Invoice')}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, Segoe UI, Roboto, sans-serif; color: #111; margin: 24px; }
  h1 { font-size: 18px; margin: 0 0 4px; }
  .meta { color: #555; font-size: 12px; margin-bottom: 16px; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 16px; }
  th, td { padding: 6px 8px; border-bottom: 1px solid #ddd; text-align: left; }
  td.num, th.num { text-align: right; }
  .summary { width: 280px; margin-left: auto; font-size: 13px; }
  .summary div { display: flex; justify-content: space-between; padding: 3px 0; }
  .summary .total { font-weight: 700; border-top: 1px solid #333; margin-top: 4px; padding-top: 6px; }
  @media print {
    body { margin: 0; padding: 16px; }
  }
</style>
</head>
<body>
  <h1>${escapeHtml(invoice.invoiceNumber ?? 'Invoice')}</h1>
  <div class="meta">
    ${escapeHtml(invoice.invoiceDate)} · ${customerLine}
  </div>

  <table>
    <thead>
      <tr>
        <th>Product</th><th>SKU</th><th class="num">Qty</th>
        <th class="num">Unit Price</th><th class="num">Discount</th><th class="num">Line Total</th>
      </tr>
    </thead>
    <tbody>${lineRows}</tbody>
  </table>

  <div class="summary">
    <div><span>Subtotal</span><span>${invoice.subTotal.toFixed(2)}</span></div>
    <div><span>Discount</span><span>${invoice.discountAmount.toFixed(2)}</span></div>
    <div><span>Tax</span><span>${invoice.taxAmount.toFixed(2)}</span></div>
    <div class="total"><span>Total</span><span>${invoice.totalAmount.toFixed(2)}</span></div>
    <div><span>Amount Paid</span><span>${invoice.amountPaid.toFixed(2)}</span></div>
    <div><span>Change Due</span><span>${invoice.changeDue.toFixed(2)}</span></div>
  </div>

  <script>
    window.onload = function () {
      window.print();
    };
  </script>
</body>
</html>`;
}

export function printInvoice(invoice: CashierInvoiceResponse): void {
  const printWindow = window.open('', '_blank', 'width=720,height=900');
  if (!printWindow) return;

  printWindow.document.open();
  printWindow.document.write(buildInvoiceHtml(invoice));
  printWindow.document.close();
}
