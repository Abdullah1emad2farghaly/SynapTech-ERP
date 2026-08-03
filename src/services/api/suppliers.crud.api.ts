// Project path: src/services/api/suppliers.crud.api.ts
//
// ASSUMPTION: imports apiClient from "./client" — existence/shape unconfirmed,
// same standing caveat as every other module's service file.

import { apiClient } from "./axiosClient";
import type {
  SupplierResponse,
  CreateSupplierPayload,
  UpdateSupplierPayload,
} from "../../types/suppliers.types";

export async function getSuppliers(): Promise<SupplierResponse[]> {
  const { data } = await apiClient.get<SupplierResponse[]>("/Suppliers");
  return data;
}

export async function getSupplierById(id: string): Promise<SupplierResponse> {
  const { data } = await apiClient.get<SupplierResponse>(`/Suppliers/${id}`);
  return data;
}

export async function createSupplier(
  payload: CreateSupplierPayload
): Promise<SupplierResponse> {
  const { data } = await apiClient.post<SupplierResponse>("/Suppliers", payload);
  return data;
}

export async function updateSupplier(
  id: string,
  payload: UpdateSupplierPayload
): Promise<SupplierResponse> {
  const { data } = await apiClient.put<SupplierResponse>(
    `/Suppliers/${id}`,
    payload
  );
  return data;
}

export async function deleteSupplier(id: string): Promise<void> {
  await apiClient.delete(`/Suppliers/${id}`);
}
