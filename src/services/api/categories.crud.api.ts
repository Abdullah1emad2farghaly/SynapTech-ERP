// src/services/api/categories.crud.api.ts
//
// Scoped strictly to the confirmed backend surface:
//   GET    /api/Categories
//   GET    /api/Categories/{id}
//   POST   /api/Categories        { name, parentCategoryId }
//   PUT    /api/Categories/{id}   { name, parentCategoryId, isActive }
//   DELETE /api/Categories/{id}
//
// Unlike Accounts, id is a path param on PUT here (not a query param) —
// straightforward, matching the Departments/Branches/Users pattern.

import { apiClient } from "./axiosClient";

export interface Category {
  id: string;
  name: string;
  parentCategoryId: string | null;
  isActive: boolean;
}

export interface CreateCategoryPayload {
  name: string;
  parentCategoryId: string | null;
}

export interface UpdateCategoryPayload {
  id: string;
  name: string;
  parentCategoryId: string | null;
  isActive: boolean;
}

// No documented pagination params — org/catalog-structure-scale data,
// same assumption as Departments: load the full set once.
export async function getAllCategories(): Promise<Category[]> {
  const { data } = await apiClient.get<Category[]>("/Categories");
  return data;
}

export async function getCategoryById(id: string): Promise<Category> {
  const { data } = await apiClient.get<Category>(`/Categories/${id}`);
  return data;
}

export async function createCategory(payload: CreateCategoryPayload): Promise<Category> {
  const { data } = await apiClient.post<Category>("/Categories", payload);
  return data;
}

export async function updateCategory(payload: UpdateCategoryPayload): Promise<Category> {
  const { id, ...body } = payload;
  const { data } = await apiClient.put<Category>(`/Categories/${id}`, body);
  return data;
}

export async function deleteCategory(id: string): Promise<void> {
  await apiClient.delete(`/Categories/${id}`);
}
