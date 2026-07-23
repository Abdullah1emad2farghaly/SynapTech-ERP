// src/services/api/roles.api.ts
//
// IMPORTANT GAP: the confirmed backend surface only includes
// PUT /api/Users/{id}/roles (assigns roles TO a user) — there is no
// confirmed endpoint for fetching the full catalog of available roles to
// populate CreateUserDrawer's and RoleAssignmentDrawer's multi-select
// lists. GET /api/Roles below is a guess, not a confirmed capability —
// unlike users/branches/departments, this one needs to be checked with
// the backend before relying on it. If no such endpoint exists yet, the
// role catalog will need to come from somewhere else (a static/config
// list, or an endpoint that needs to be added).

import { apiClient } from "@/services/api/axiosClient";

export interface Role {
  id: string;
  name: string;
}

export async function getRoles(): Promise<Role[]> {
  const { data } = await apiClient.get<Role[]>("/Roles");
  return data;
}
