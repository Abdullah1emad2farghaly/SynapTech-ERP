// Project path: src/services/api/warehouses.crud.api.ts
//
// ASSUMPTION: imports apiClient from "./client" — existence/shape unconfirmed,
// same standing caveat as every other module's service file.
//
// No separate activate/deactivate endpoint exists — both reuse updateWarehouse
// with isActive toggled, so there is no setWarehouseActive() here on purpose.

import { apiClient } from "./axiosClient";
import type {
  WarehouseResponse,
  CreateWarehousePayload,
  UpdateWarehousePayload,
} from "../../types/warehouses.types";
const BASE_URL = "/Warehouses"

export async function getWarehouses(): Promise<WarehouseResponse[]> {
  const { data } = await apiClient.get<WarehouseResponse[]>(BASE_URL);
  return data;
}

export async function getWarehouseById(id: string): Promise<WarehouseResponse> {
  const { data } = await apiClient.get<WarehouseResponse>(
    `${BASE_URL}/${id}`
  );
  return data;
}

export async function createWarehouse(
  payload: CreateWarehousePayload
): Promise<WarehouseResponse> {
  const { data } = await apiClient.post<WarehouseResponse>(
    BASE_URL,
    payload
  );
  return data;
}

export async function updateWarehouse(
  id: string,
  payload: UpdateWarehousePayload
): Promise<WarehouseResponse> {
  const { data } = await apiClient.put<WarehouseResponse>(
    `${BASE_URL}/${id}`,
    payload
  );
  return data;
}

export async function deleteWarehouse(id: string): Promise<void> {
  await apiClient.delete(`${BASE_URL}/${id}`);
}
