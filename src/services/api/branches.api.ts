// src/services/api/branches.api.ts
//
// ASSUMPTION: Branch is master/org data likely already used elsewhere in
// the ERP (HR's Org Chart, for instance) — check the project for an
// existing branches.api.ts / useBranches.ts before adding this, since
// duplicating a lookup that already exists would violate the "reuse
// before creating new" rule. This is provided only in case no such file
// exists yet. Assumed endpoint: GET /api/Branches returning { id, name }[].

import { apiClient } from "@/services/api/axiosClient";

export interface Branch {
  id: string;
  name: string;
}

export async function getBranches(): Promise<Branch[]> {
  const { data } = await apiClient.get<Branch[]>("/Branches");
  return data;
}
