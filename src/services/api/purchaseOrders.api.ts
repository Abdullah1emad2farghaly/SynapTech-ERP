// Project path: src/services/api/purchaseOrders.api.ts
//
// ASSUMPTION: imports apiClient from "./client" — existence/shape unconfirmed,
// same standing caveat as every other module's service file.
//
// No DELETE — this endpoint genuinely doesn't exist for Purchase Orders (see
// spec §1.1), unlike every other module built so far.

import { apiClient } from "./axiosClient";
import type {
  PurchaseOrderResponse,
  CreatePurchaseOrderPayload,
  ReceiveGoodsPayload,
} from "../../types/purchaseOrders.types";

export async function getPurchaseOrders(): Promise<PurchaseOrderResponse[]> {
  const { data } = await apiClient.get<PurchaseOrderResponse[]>("/PurchaseOrders");
  return data;
}

export async function getPurchaseOrderById(id: string): Promise<PurchaseOrderResponse> {
  const { data } = await apiClient.get<PurchaseOrderResponse>(
    `/PurchaseOrders/${id}`
  );
  return data;
}

export async function createPurchaseOrder(
  payload: CreatePurchaseOrderPayload
): Promise<PurchaseOrderResponse> {
  const { data } = await apiClient.post<PurchaseOrderResponse>(
    "/PurchaseOrders",
    payload
  );
  return data;
}

export async function updatePurchaseOrder(
  id: string,
  payload: CreatePurchaseOrderPayload
): Promise<PurchaseOrderResponse> {
  const { data } = await apiClient.put<PurchaseOrderResponse>(
    `/PurchaseOrders/${id}`,
    payload
  );
  return data;
}

export async function submitPurchaseOrder(id: string): Promise<PurchaseOrderResponse> {
  const { data } = await apiClient.post<PurchaseOrderResponse>(
    `/PurchaseOrders/${id}/submit`
  );
  return data;
}

export async function approvePurchaseOrder(id: string): Promise<PurchaseOrderResponse> {
  const { data } = await apiClient.post<PurchaseOrderResponse>(
    `/PurchaseOrders/${id}/approve`
  );
  return data;
}

export async function receivePurchaseOrderGoods(
  id: string,
  payload: ReceiveGoodsPayload
): Promise<PurchaseOrderResponse> {
  const { data } = await apiClient.post<PurchaseOrderResponse>(
    `/PurchaseOrders/${id}/receive`,
    payload
  );
  return data;
}

export async function cancelPurchaseOrder(id: string): Promise<PurchaseOrderResponse> {
  const { data } = await apiClient.post<PurchaseOrderResponse>(
    `/PurchaseOrders/${id}/cancel`
  );
  return data;
}
