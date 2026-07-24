// src/services/api/departments.crud.api.ts
//
// Full CRUD service for the Departments module page — distinct from
// services/api/departments.api.ts (the lookup-only version built for
// Users' Branch/Department dropdowns, which just returns { id, name }[]
// shaped data). If you already merged that lookup file into your
// project, rename one of the two to avoid a collision — they serve
// different callers (a simple dropdown vs. the full Departments page)
// but share a very similar name.
//
// Scoped strictly to the confirmed backend surface:
//   GET    /api/Departments
//   GET    /api/Departments/{id}
//   POST   /api/Departments
//   PUT    /api/Departments/{id}
//   DELETE /api/Departments/{id}

import { apiClient } from "./axiosClient";

export interface Department {
  id: string;
  name: string;
  branchId: string;
  parentDepartmentId: string | null;
  isActive: boolean;
}

export interface CreateDepartmentPayload {
  name: string;
  branchId: string;
  parentDepartmentId?: string | null;
}

export interface UpdateDepartmentPayload {
  id: string;
  name: string;
  branchId: string;
  parentDepartmentId?: string | null;
  isActive: boolean;
}

// GET /api/Departments returns the full set with no documented pagination
// params — org-structure data, not user-record scale — so this fetches
// everything in one call rather than accepting page/pageSize like Users.
const BASE_URL = '/departments';
export async function getAllDepartments(): Promise<Department[]> {
  const { data } = await apiClient.get<Department[]>(BASE_URL);
  return data;
}

export async function getDepartmentById(id: string): Promise<Department> {
  const { data } = await apiClient.get<Department>(`${BASE_URL}/${id}`);
  return data;
}

export async function createDepartment(payload: CreateDepartmentPayload): Promise<Department> {
  const { data } = await apiClient.post<Department>(BASE_URL, payload);
  return data;
}

export async function updateDepartment(payload: UpdateDepartmentPayload): Promise<Department> {
  const { id, ...body } = payload;
  const { data } = await apiClient.put<Department>(`${BASE_URL}/${id}`, body);
  return data;
}

export async function deleteDepartment(id: string): Promise<void> {
  await apiClient.delete(`${BASE_URL}/${id}`);
}
