// Intended project path: src/services/cashier.api.ts
//
// ASSUMPTION (per project convention): imports { apiClient } from "./axiosClient"
// (the real, confirmed client — see project memory correction, NOT the earlier
// assumed services/client.ts).
import { apiClient } from "./axiosClient";

// ─────────────────────────────────────────────────────────────────────────
// Types — mirror the exact backend contract. Do not add fields not listed
// in the Cashier OpenAPI contract.
// ─────────────────────────────────────────────────────────────────────────

export interface CreateCashierOrderRequest {
  customerId: string | null;
  walkInCustomerName: string | null;
  discountAmount: number;
  taxAmount: number;
  lines: CashierOrderLineRequest[] | null;
  payments: CashierPaymentRequest[] | null;
}

export interface CashierOrderLineRequest {
  productId: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
}

export interface CashierPaymentRequest {
  method: string | null;
  amount: number;
  referenceNumber: string | null;
}

export interface VoidCashierOrderRequest {
  reason: string | null;
}

export interface OpenShiftRequest {
  warehouseId: string;
  openingCashBalance: number;
  notes: string | null;
}

export interface CashMovementRequest {
  movementType: string | null;
  amount: number;
  reason: string | null;
}

export interface CloseShiftRequest {
  countedClosingCash: number;
  notes: string | null;
}

export interface CashierOrderLineResponse {
  id: string;
  productId: string;
  productSku: string | null;
  productName: string | null;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  lineTotal: number;
}

export interface CashierPaymentResponse {
  id: string;
  method: string | null;
  amount: number;
  referenceNumber: string | null;
}

export interface CashierOrderResponse {
  id: string;
  orderNumber: string | null;
  cashierShiftId: string;
  warehouseId: string;
  customerId: string | null;
  walkInCustomerName: string | null;
  orderDate: string;
  status: string | null;
  subTotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  changeDue: number;
  invoiceId: string | null;
  invoiceNumber: string | null;
  lines: CashierOrderLineResponse[] | null;
  payments: CashierPaymentResponse[] | null;
  warnings: string[] | null;
}

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

export interface CashierShiftResponse {
  id: string;
  shiftNumber: string | null;
  warehouseId: string;
  warehouseName: string | null;
  cashierUserId: string;
  openedAt: string;
  closedAt: string | null;
  openingCashBalance: number;
  expectedClosingCash: number | null;
  countedClosingCash: number | null;
  discrepancyAmount: number | null;
  status: string | null;
}

export interface ShiftClosingReportResponse {
  shiftId: string;
  shiftNumber: string | null;
  openedAt: string;
  closedAt: string | null;
  openingCashBalance: number;
  completedOrderCount: number;
  voidedOrderCount: number;
  totalCashSales: number;
  totalCardSales: number;
  totalOtherSales: number;
  totalCashIn: number;
  totalCashOut: number;
  expectedClosingCash: number;
  countedClosingCash: number | null;
  discrepancyAmount: number | null;
}

// ─────────────────────────────────────────────────────────────────────────
// Orders
// ─────────────────────────────────────────────────────────────────────────

export const getCashierOrders = async (): Promise<CashierOrderResponse[]> => {
  // NOTE: no documented pagination/filter/search params — full list only,
  // per Section 16/40 of the brief. Do not add query params here.
  const { data } = await apiClient.get<CashierOrderResponse[]>("/cashier/orders");
  return data;
};

export const getCashierOrder = async (id: string): Promise<CashierOrderResponse> => {
  const { data } = await apiClient.get<CashierOrderResponse>(`/cashier/orders/${id}`);
  return data;
};

export const createCashierOrder = async (
  payload: CreateCashierOrderRequest
): Promise<CashierOrderResponse> => {
  const { data } = await apiClient.post<CashierOrderResponse>("/cashier/orders", payload);
  return data;
};

export const voidCashierOrder = async (
  id: string,
  payload: VoidCashierOrderRequest
): Promise<CashierOrderResponse> => {
  const { data } = await apiClient.post<CashierOrderResponse>(
    `/cashier/orders/${id}/void`,
    payload
  );
  return data;
};

export const getCashierOrderInvoice = async (id: string): Promise<CashierInvoiceResponse> => {
  // GET /cashier/orders/{id}/invoice — kept distinct from
  // GET /cashier/invoices/{id} since both are documented separately.
  const { data } = await apiClient.get<CashierInvoiceResponse>(
    `/cashier/orders/${id}/invoice`
  );
  return data;
};

// ─────────────────────────────────────────────────────────────────────────
// Invoices
// ─────────────────────────────────────────────────────────────────────────

export const getCashierInvoice = async (id: string): Promise<CashierInvoiceResponse> => {
  const { data } = await apiClient.get<CashierInvoiceResponse>(`/cashier/invoices/${id}`);
  return data;
};

// ─────────────────────────────────────────────────────────────────────────
// Shifts
// ─────────────────────────────────────────────────────────────────────────

export const openShift = async (payload: OpenShiftRequest): Promise<CashierShiftResponse> => {
  const { data } = await apiClient.post<CashierShiftResponse>("/cashier/shifts/open", payload);
  return data;
};

export const addCashMovement = async (
  shiftId: string,
  payload: CashMovementRequest
): Promise<CashierShiftResponse> => {
  const { data } = await apiClient.post<CashierShiftResponse>(
    `/cashier/shifts/${shiftId}/cash-movements`,
    payload
  );
  return data;
};

export const closeShift = async (
  shiftId: string,
  payload: CloseShiftRequest
): Promise<CashierShiftResponse> => {
  const { data } = await apiClient.post<CashierShiftResponse>(
    `/cashier/shifts/${shiftId}/close`,
    payload
  );
  return data;
};

export const getShiftClosingReport = async (
  shiftId: string
): Promise<ShiftClosingReportResponse> => {
  const { data } = await apiClient.get<ShiftClosingReportResponse>(
    `/cashier/shifts/${shiftId}/closing-report`
  );
  return data;
};

export const getShift = async (shiftId: string): Promise<CashierShiftResponse> => {
  const { data } = await apiClient.get<CashierShiftResponse>(`/cashier/shifts/${shiftId}`);
  return data;
};

export const getMyCurrentShift = async (): Promise<CashierShiftResponse | null> => {
  // ASSUMPTION: when there is no open shift, this either 404s or returns null.
  // Handled defensively in useMyCurrentShift() — flagged, unconfirmed.
  const { data } = await apiClient.get<CashierShiftResponse | null>(
    "/cashier/shifts/my-current"
  );
  return data;
};

export const getMyShiftHistory = async (): Promise<CashierShiftResponse[]> => {
  const { data } = await apiClient.get<CashierShiftResponse[]>("/cashier/shifts/my-history");
  return data;
};
