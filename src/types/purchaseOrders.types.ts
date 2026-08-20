// Project path: src/types/purchaseOrders.types.ts

export type PurchaseOrderStatus =
  | "Draft"
  | "Submitted"
  | "Approved"
  | "PartiallyReceived"
  | "Received"
  | "Cancelled";

/** Matches confirmed GET /api/PurchaseOrders and GET /api/PurchaseOrders/{id} */
export interface PurchaseOrderLine {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  receivedQuantity: number;
  lineTotal: number;
}

/** ASSUMPTION: warnings[] element shape is never defined by the API — assumed
 *  to be plain strings, not { severity, code, message } objects. See spec §15. */
export type PurchaseOrderWarning = string;

export interface PurchaseOrderResponse {
  id: string;
  orderNumber: string;
  supplierId: string;
  supplierName: string;
  warehouseId: string;
  warehouseName: string;
  orderDate: string;
  expectedDate: string;
  status: PurchaseOrderStatus | string;
  notes: string;
  totalAmount: number;
  warnings: PurchaseOrderWarning[];
  lines: PurchaseOrderLine[];
}

/** Body for POST/PUT /api/PurchaseOrders */
export interface PurchaseOrderLineRequest {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface CreatePurchaseOrderPayload {
  supplierId: string;
  warehouseId: string;
  orderDate: string;
  notes: string;
  lines: PurchaseOrderLineRequest[];
}

/** Body for POST /api/PurchaseOrders/{id}/receive */
export interface ReceivedLineRequest {
  lineId: string;
  quantityReceived: number;
}

export interface ReceiveGoodsPayload {
  lines: ReceivedLineRequest[];
}

/** ASSUMPTION: no Products lookup endpoint is confirmed for this module —
 *  see purchaseOrders-ux-spec.md §1.3. */
export interface ProductLookupResponse {
  id: string;
  name: string;
}
