// Project path: src/hooks/useSuppliers.ts

import { useQuery } from "@tanstack/react-query";
import { getSuppliers, getSupplierById } from "../services/api/suppliers.crud.api";

export const suppliersQueryKeys = {
  all: ["suppliers"] as const,
  detail: (id: string) => ["suppliers", id] as const,
};

export function useSuppliers() {
  return useQuery({
    queryKey: suppliersQueryKeys.all,
    queryFn: getSuppliers,
  });
}

export function useSupplier(id: string | undefined) {
  return useQuery({
    queryKey: suppliersQueryKeys.detail(id ?? ""),
    queryFn: () => getSupplierById(id as string),
    enabled: Boolean(id),
  });
}
