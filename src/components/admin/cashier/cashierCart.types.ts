// Intended project path: src/components/admin/cashier/cashierCart.types.ts
//
// Frontend-only shape for the in-progress sale, kept separate from
// CashierOrderLineRequest/Response so the POS can carry display fields
// (productName/productSku) before the order is submitted. Maps directly
// onto CashierOrderLineRequest at submit time — see POSPage.tsx.
export interface CashierCartLine {
  productId: string;
  productName: string;
  productSku: string | null;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
}

export const cartLineToRequest = (line: CashierCartLine) => ({
  productId: line.productId,
  quantity: line.quantity,
  unitPrice: line.unitPrice,
  discountAmount: line.discountAmount,
});
