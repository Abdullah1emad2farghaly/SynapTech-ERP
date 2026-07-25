// src/services/api/branches.crud.api.ts
//
// Full CRUD service for BranchesPage — distinct from the lookup-only
// branches.api.ts built for Users/Departments' dropdowns (which returns
// { id, name }[] only). Rename either file if both land in the same
// project, same collision note as departments.crud.api.ts.

import { apiClient } from "./axiosClient";

export interface Branch {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  isMain: boolean;
  isActive: boolean;
}

export interface CreateBranchPayload {
  name: string;
  code: string;
  address: string;
  phone: string;
  isMain: boolean;
}

export interface UpdateBranchPayload {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  isMain: boolean;
  isActive: boolean;
}
const BASE_URL = '/branches';

export async function getAllBranches(): Promise<Branch[]> {
  const { data } = await apiClient.get<Branch[]>(BASE_URL);
  return data;
}

export async function getBranchById(id: string): Promise<Branch> {
  const { data } = await apiClient.get<Branch>(`${BASE_URL}/${id}`);
  return data;
}

export async function createBranch(payload: CreateBranchPayload): Promise<Branch> {
  const { data } = await apiClient.post<Branch>(BASE_URL, payload);
  return data;
}

export async function updateBranch(payload: UpdateBranchPayload): Promise<Branch> {
  const { id, ...body } = payload;
  const { data } = await apiClient.put<Branch>(`${BASE_URL}/${id}`, body);
  return data;
}

export async function deleteBranch(id: string): Promise<void> {
  await apiClient.delete(`${BASE_URL}/${id}`);
}
