// src/hooks/useCategories.ts
//
// Thin lookup hook, same shape as a future "Products list for a dropdown" hook
// would take (see naming precedent note in useProducts.ts). Only fetches once per
// cache window since a categories list changes rarely — staleTime follows the same
// reasoning as other lookup-style queries in this project (e.g. Roles in Create
// User), not a number derived from anything technical.
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getCategories, type Category } from "../services/api/categories.api";

export const categoriesQueryKeys = {
  all: ["categories"] as const,
};

export function useCategories(): UseQueryResult<Category[]> {
  return useQuery({
    queryKey: categoriesQueryKeys.all,
    queryFn: getCategories,
    staleTime: 5 * 60 * 1000,
  });
}
