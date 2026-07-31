// src/services/api/stock.api.ts
//
// Scoped strictly to the confirmed backend surface:
//   GET  /api/Stock/products/{productId}
//   GET  /api/Stock/warehouses/{warehouseId}
//   POST /api/Stock/movements  { productId, warehouseId, movementType, quantity, reference }
//   POST /api/Stock/transfer   { productId, fromWarehouseId, toWarehouseId, quantity, reference }
//
// IMPORTANT, UNRESOLVED: movementType's valid values are not specified
// anywhere in the confirming brief — no enum, no example list. Typed as
// `string` here deliberately rather than a union of guessed values (e.g.
// "IN"/"OUT"), since inventing labels would misrepresent a real backend
// contract. Confirm the real value set before shipping the Record
// Movement form's Movement Type field as anything other than free text.
//
// Also unresolved: whether `quantity` can be negative (to represent a
// decrease) or is always positive with direction implied by
// movementType. Treated as a plain positive number for now — this is a
// guess, not a confirmed constraint.

import { apiClient } from "./axiosClient";

export interface StockLevel {
  productId: string;
  productSku: string;
  productName: string;
  warehouseId: string;
  warehouseName: string;
  quantityOnHand: number;
}

export interface MovementResponse {
  id: string;
  productId: string;
  productName: string;
  warehouseId: string;
  warehouseName: string;
  movementType: string;
  quantity: number;
  reference: string | null;
  movementDate: string;
}

export interface RecordMovementPayload {
  productId: string;
  warehouseId: string;
  movementType: string;
  quantity: number;
  reference?: string | null;
}

export interface TransferStockPayload {
  productId: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  quantity: number;
  reference?: string | null;
}

export async function getProductStock(productId: string): Promise<StockLevel[]> {
  const { data } = await apiClient.get<StockLevel[]>(`/Stock/products/${productId}`);
  return data;
}

export async function getWarehouseStock(warehouseId: string): Promise<StockLevel[]> {
  const { data } = await apiClient.get<StockLevel[]>(`/Stock/warehouses/${warehouseId}`);
  return data;
}

export async function recordMovement(payload: RecordMovementPayload): Promise<MovementResponse> {
  const { data } = await apiClient.post<MovementResponse>("/Stock/movements", payload);
  return data;
}

export async function transferStock(payload: TransferStockPayload): Promise<MovementResponse []> {
  const { data } = await apiClient.post<MovementResponse[]>("/Stock/transfer", payload);
  return data;
}
