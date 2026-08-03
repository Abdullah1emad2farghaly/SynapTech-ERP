// Project path: src/hooks/useSupplierMutations.ts
//
// bulkDelete loops over the singular DELETE endpoint via Promise.allSettled —
// no bulk endpoint exists. Partial failure is possible; the caller gets back
// which ids succeeded/failed rather than one pass/fail flag.

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "../services/api/suppliers.crud.api";
import { suppliersQueryKeys } from "./useSuppliers";
import type {
  CreateSupplierPayload,
  UpdateSupplierPayload,
} from "../types/suppliers.types";

export function useCreateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSupplierPayload) => createSupplier(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: suppliersQueryKeys.all });
    },
  });
}

export function useUpdateSupplier(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateSupplierPayload) => updateSupplier(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: suppliersQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: suppliersQueryKeys.detail(id) });
    },
  });
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSupplier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: suppliersQueryKeys.all });
    },
  });
}

interface BulkDeleteResult {
  succeededIds: string[];
  failedIds: string[];
}

export function useBulkDeleteSuppliers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]): Promise<BulkDeleteResult> => {
      const results = await Promise.allSettled(ids.map((id) => deleteSupplier(id)));
      const succeededIds: string[] = [];
      const failedIds: string[] = [];
      results.forEach((result, index) => {
        if (result.status === "fulfilled") succeededIds.push(ids[index]);
        else failedIds.push(ids[index]);
      });
      return { succeededIds, failedIds };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: suppliersQueryKeys.all });
    },
  });
}
