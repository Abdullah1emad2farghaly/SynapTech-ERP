// Project path: src/types/cashier-invoice.types.ts
//
// Mirrors the confirmed API contract exactly. If a CashierInvoiceResponse
// type already exists elsewhere in the project (e.g. from the existing
// GET /api/cashier/invoices/{id} integration), reuse that one instead of
// this file and delete this one — do not keep two definitions.

export interface CashierInvoiceLineResponse {
  productId: string;
  productName: string | null;
  sku: string | null;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  lineTotal: number;
}

export interface CashierInvoiceResponse {
  id: string;
  invoiceNumber: string | null;
  cashierOrderId: string;
  customerId: string | null;
  walkInCustomerName: string | null;
  walkInCustomerPhone: string | null;
  invoiceDate: string;
  status: string | null;

  subTotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  amountPaid: number;
  changeDue: number;

  lines: CashierInvoiceLineResponse[] | null;
}
