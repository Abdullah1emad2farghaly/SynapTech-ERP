// src/services/api/products.api.ts
//
// ASSUMPTION: imports `apiClient` from './client' following the same pattern as
// users.api.ts / departments.crud.api.ts / branches.crud.api.ts. `client.ts` has
// never been seen or confirmed in this project (see handoff Section 8/14) — verify
// its export shape (default vs. named `apiClient`, baseURL, interceptors) before
// wiring this file into the real project.
//
// ASSUMPTION: endpoint paths, request/response field names, and query params below
// are NOT confirmed against a real backend contract. They follow the same shape as
// the three built modules (Users/Departments/Branches) for consistency, but must be
// verified — same status as users.api.ts's search/filter/sort params (flagged there
// as assumed, never confirmed).
import {apiClient} from "./axiosClient";

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  // NOTE: Product.category is still stored/sent as a plain string (the category
  // *name*, not an id/FK) even though the Create/Edit drawer now sources its options
  // from a select box (see services/api/categories.api.ts + hooks/useCategories.ts).
  // ASSUMPTION: unconfirmed whether the real Product API expects categoryId instead
  // of category name — verify against the backend contract once confirmed.
  categoryId: string;
  // ASSUMPTION: same treatment as category — plain string, no confirmed UoM catalog.
  unitOfMeasure: string;
  costPrice: number;
  salePrice: number;
  isActive: boolean;
  // ASSUMPTION: Departments/Branches confirmed no created/updated fields exist on
  // those entities. Not assumed present here either — omitted until confirmed.
}

// export interface ProductListParams {
//   search?: string;
//   category?: string;
//   status?: "active" | "inactive";
//   page?: number;
//   pageSize?: number;
//   sortBy?: string;
//   sortDir?: "asc" | "desc";
// }

// export interface ProductListResponse {
//   items: Product[];
//   total: number;
//   page: number;
//   pageSize: number;
// }

export interface CreateProductPayload {
  sku: string;
  name: string;
  description?: string;
  categoryId: string | null;
  unitOfMeasure: string;
  costPrice: number;
  salePrice: number;
}

export interface UpdateProductPayload {
  // ASSUMPTION: mirrors Users' "email is never editable" pattern — SKU is treated as
  // immutable after creation (a business-identity field), so it is excluded from the
  // update payload. Verify this assumption against the real backend.
  name: string;
  sku: string;
  description?: string;
  categoryId: string | null;
  unitOfMeasure: string;
  costPrice: number;
  salePrice: number;
  isActive: boolean;
}

export async function getProducts(): Promise<Product[]> {
  const { data } = await apiClient.get<Product[]>("/Products");
  return data;
}

export async function getProductById(id: string): Promise<Product> {
  const { data } = await apiClient.get<Product>(`/Products/${id}`);
  return data;
}

export async function createProduct(
  payload: CreateProductPayload
): Promise<Product> {
  const { data } = await apiClient.post<Product>("/Products", payload);
  return data;
}

export async function updateProduct(
  id: string,
  payload: UpdateProductPayload
): Promise<Product> {
  const { data } = await apiClient.put<Product>(`/Products/${id}`, payload);
  return data;
}

export async function deleteProduct(id: string): Promise<void> {
  await apiClient.delete(`/Products/${id}`);
}
