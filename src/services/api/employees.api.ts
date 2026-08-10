// Project path: src/services/api/employees.api.ts
//
// ASSUMPTION (unverified, flag per project convention): imports apiClient from
// "./client" — this file has never been confirmed to exist in the real
// project. Verify before wiring this in.

import { apiClient } from "./axiosClient";
import type {
  EmployeeResponse,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  GrantEmployeeAccessRequest,
  UserResponse,
} from "../../types/employee.types";

const BASE = "/Employees";

export async function getEmployees(): Promise<EmployeeResponse[]> {
  // ASSUMPTION: no confirmed query-param contract, so no params are sent.
  // Filtering/search/sort happen client-side (see hooks/useEmployees.ts),
  // same precedent as Departments/Roles/full-list-load modules.
  const { data } = await apiClient.get<EmployeeResponse[]>(BASE);
  return data;
}

export async function getEmployeeById(id: string): Promise<EmployeeResponse> {
  const { data } = await apiClient.get<EmployeeResponse>(`${BASE}/${id}`);
  return data;
}

export async function createEmployee(
  payload: CreateEmployeeRequest
): Promise<EmployeeResponse> {
  const { data } = await apiClient.post<EmployeeResponse>(BASE, payload);
  return data;
}

export async function updateEmployee(
  id: string,
  payload: UpdateEmployeeRequest
): Promise<EmployeeResponse> {
  const { data } = await apiClient.put<EmployeeResponse>(`${BASE}/${id}`, payload);
  return data;
}

export async function deleteEmployee(id: string): Promise<void> {
  await apiClient.delete(`${BASE}/${id}`);
}

export async function grantEmployeeAccess(
  id: string,
  payload: GrantEmployeeAccessRequest
): Promise<UserResponse> {
  const { data } = await apiClient.post<UserResponse>(
    `${BASE}/${id}/grant-access`,
    payload
  );
  return data;
}
