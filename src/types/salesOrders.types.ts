// Project path: src/types/salesOrders.types.ts

export type SalesOrderStatus =
  | "Draft"
  | "Submitted"
  | "Approved"
  | "PartiallyShipped"
  | "Shipped"
  | "Cancelled";

/** Matches confirmed GET /api/SalesOrders and GET /api/SalesOrders/{id}.
 *  NOTE: no lineTotal field here — unlike PurchaseOrderLine, the Sales Order
 *  line response doesn't return one (see spec §1). Line total is frontend-
 *  calculated wherever it's shown. */
export interface SalesOrderLine {
  id: string;
  productId: string;
  productSku: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  shippedQuantity: number;
}

/** ASSUMPTION: stockWarnings[] element shape is never defined by the API —
 *  assumed plain strings, same as Purchase Orders' warnings[]. */
export type StockWarning = string;

export interface SalesOrderResponse {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  warehouseId: string;
  warehouseName: string;
  orderDate: string;
  status: SalesOrderStatus | string;
  notes: string;
  totalAmount: number;
  stockWarnings: StockWarning[];
  lines: SalesOrderLine[];
}

/** Body for POST/PUT /api/SalesOrders. NOTE: no expectedDate field — unlike
 *  CreatePurchaseOrderPayload, this API has no equivalent (see spec §1). */
export interface SalesOrderLineRequest {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateSalesOrderPayload {
  customerId: string;
  warehouseId: string;
  orderDate: string;
  notes: string;
  lines: SalesOrderLineRequest[];
}

/** Body for POST /api/SalesOrders/{id}/ship */
export interface ShipGoodsLineRequest {
  lineId: string;
  quantityShipped: number;
}

export interface ShipGoodsPayload {
  lines: ShipGoodsLineRequest[];
}

/** ASSUMPTION: no Customers lookup endpoint is confirmed anywhere in this
 *  project's API set — see sales-orders-ux-spec.md §1. */
export interface CustomerLookupResponse {
  id: string;
  name: string;
}
