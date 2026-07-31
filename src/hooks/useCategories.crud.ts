// src/hooks/useCategories.crud.ts
//
// No naming-collision risk here — no earlier module built a lookup-only
// useCategories() the way Departments/Branches had for Users' dropdowns,
// so this is the only Categories hook file needed.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type CreateCategoryPayload,
  type UpdateCategoryPayload,
} from "../services/api/categories.crud.api";

export const categoriesQueryKeys = {
  all: ["categories-crud"] as const,
};

export function useCategoriesList() {
  return useQuery({
    queryKey: categoriesQueryKeys.all,
    queryFn: getAllCategories,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCategoryPayload) => createCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoriesQueryKeys.all });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateCategoryPayload) => updateCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoriesQueryKeys.all });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoriesQueryKeys.all });
    },
  });
}
