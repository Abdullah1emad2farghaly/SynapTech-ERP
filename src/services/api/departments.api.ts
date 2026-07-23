// src/services/api/departments.api.ts
//
// Same assumption as branches.api.ts: check for an existing departments
// lookup elsewhere in the project first. Assumed endpoint:
// GET /api/Departments returning { id, name }[].

import { apiClient } from "@/services/api/axiosClient";

export interface Department {
  id: string;
  name: string;
}

export async function getDepartments(): Promise<Department[]> {
  const { data } = await apiClient.get<Department[]>("/Departments");
  return data;
}
