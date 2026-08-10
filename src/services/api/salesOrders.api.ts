// Project path: src/services/api/salesOrders.api.ts
//
// ASSUMPTION: imports apiClient from "./client" — existence/shape unconfirmed,
// same standing caveat as every other module's service file.
//
// No DELETE — same gap as Purchase Orders, this endpoint doesn't exist here either.

import { apiClient } from "./axiosClient";
import type {
  SalesOrderResponse,
  CreateSalesOrderPayload,
  ShipGoodsPayload,
} from "../../types/salesOrders.types";

export async function getSalesOrders(): Promise<SalesOrderResponse[]> {
  const { data } = await apiClient.get<SalesOrderResponse[]>("/SalesOrders");
  return data;
}

export async function getSalesOrderById(id: string): Promise<SalesOrderResponse> {
  const { data } = await apiClient.get<SalesOrderResponse>(`/SalesOrders/${id}`);
  return data;
}

export async function createSalesOrder(
  payload: CreateSalesOrderPayload
): Promise<SalesOrderResponse> {
  const { data } = await apiClient.post<SalesOrderResponse>("/SalesOrders", payload);
  return data;
}

export async function updateSalesOrder(
  id: string,
  payload: CreateSalesOrderPayload
): Promise<SalesOrderResponse> {
  const { data } = await apiClient.put<SalesOrderResponse>(
    `/SalesOrders/${id}`,
    payload
  );
  return data;
}

export async function submitSalesOrder(id: string): Promise<SalesOrderResponse> {
  const { data } = await apiClient.post<SalesOrderResponse>(
    `/SalesOrders/${id}/submit`
  );
  return data;
}

export async function approveSalesOrder(id: string): Promise<SalesOrderResponse> {
  const { data } = await apiClient.post<SalesOrderResponse>(
    `/SalesOrders/${id}/approve`
  );
  return data;
}

export async function shipSalesOrderGoods(
  id: string,
  payload: ShipGoodsPayload
): Promise<SalesOrderResponse> {
  const { data } = await apiClient.post<SalesOrderResponse>(
    `/SalesOrders/${id}/ship`,
    payload
  );
  return data;
}

export async function cancelSalesOrder(id: string): Promise<SalesOrderResponse> {
  const { data } = await apiClient.post<SalesOrderResponse>(
    `/SalesOrders/${id}/cancel`
  );
  return data;
}
