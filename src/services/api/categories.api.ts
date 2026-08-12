// src/services/api/categories.api.ts
//
// ASSUMPTION: this entire file is unconfirmed. No GET /api/Categories (or similarly
// named) endpoint has been verified against the real backend — same status as the
// guessed GET /api/Roles in roles.api.ts. Endpoint path, response shape, and even
// whether Categories is its own resource (vs. a fixed enum, vs. derived from
// distinct values already on Product) all need confirmation. Swap/delete this file
// once that's known.
import {apiClient} from "./axiosClient";

export interface Category {
  id: string;
  name: string;
  isActive: boolean;
}

export async function getCategories(): Promise<Category[]> {
  const { data } = await apiClient.get<Category[]>("/Categories");
  return data;
}
