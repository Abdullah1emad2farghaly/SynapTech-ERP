// Project path: src/services/api/roles.crud.api.ts
//
// ASSUMPTION: imports apiClient from "./client" — this file has never been seen in
// this project's context; verify its existence/baseURL/interceptor setup first.
//
// Named `.crud` to follow the same collision-avoidance pattern as
// departments.crud.api.ts / branches.crud.api.ts, since a lookup-only
// `roles.api.ts` (GET /api/Roles, used by CreateUserDrawer's role picker)
// already exists in the project.

import { apiClient } from "./axiosClient";
import type {
  RoleResponse,
  PermissionResponse,
  CreateRolePayload,
  UpdateRolePayload,
  AssignPermissionsPayload,
} from "../../types/roles.types";
const BASE_URL = '/Roles'

export async function getRoles(): Promise<RoleResponse[]> {
  const { data } = await apiClient.get<RoleResponse[]>(BASE_URL);
  return data;
}

export async function getRoleById(id: string): Promise<RoleResponse> {
  const { data } = await apiClient.get<RoleResponse>(`${BASE_URL}/${id}`);
  return data;
}

export async function createRole(
  payload: CreateRolePayload
): Promise<RoleResponse> {
  const { data } = await apiClient.post<RoleResponse>(BASE_URL, payload);
  return data;
}

export async function updateRole(
  id: string,
  payload: UpdateRolePayload
): Promise<RoleResponse> {
  const { data } = await apiClient.put<RoleResponse>(
    `${BASE_URL}/${id}`,
    payload
  );
  return data;
}

export async function deleteRole(id: string): Promise<void> {
  await apiClient.delete(`${BASE_URL}/${id}`);
}

export async function getPermissionsCatalog(): Promise<PermissionResponse[]> {
  const { data } = await apiClient.get<PermissionResponse[]>(
    `${BASE_URL}/permissions-catalog`
  );
  return data;
}

export async function assignPermissions(
  id: string,
  payload: AssignPermissionsPayload
): Promise<RoleResponse> {
  const { data } = await apiClient.put<RoleResponse>(
    `${BASE_URL}/${id}/permissions`,
    payload
  );
  return data;
}
