
import { apiClient } from "@/services/api/axiosClient";

export interface Role {
  id: string;
  name: string;
}

export async function getRoles(): Promise<Role[]> {
  const { data } = await apiClient.get<Role[]>("/Roles");
  return data;
}
