// src/hooks/useStock.ts
//
// Wraps stock.api.ts in TanStack Query. useProductStock/useWarehouseStock
// are the two confirmed single-entity reads; useRecordMovement/
// useTransferStock are the two confirmed append-only mutations. Neither
// mutation has a natural "detail" query key to invalidate the way other
// modules' mutations do (there's no stock entity with an id) — instead,
// on success they invalidate the affected product's and/or warehouse's
// stock queries plus the overview, so quantities update in place
// wherever they're currently shown.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getProductStock,
  getWarehouseStock,
  recordMovement,
  transferStock,
  type RecordMovementPayload,
  type TransferStockPayload,
} from "../services/api/stock.api";

export const stockQueryKeys = {
  product: (productId: string) => ["stock", "product", productId] as const,
  warehouse: (warehouseId: string) => ["stock", "warehouse", warehouseId] as const,
  overview: ["stock", "overview"] as const,
};

export function useProductStock(productId: string | undefined) {
  return useQuery({
    queryKey: stockQueryKeys.product(productId ?? ""),
    queryFn: () => getProductStock(productId!),
    enabled: !!productId,
  });
}

export function useWarehouseStock(warehouseId: string | undefined) {
  return useQuery({
    queryKey: stockQueryKeys.warehouse(warehouseId ?? ""),
    queryFn: () => getWarehouseStock(warehouseId!),
    enabled: !!warehouseId,
  });
}

export function useRecordMovement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RecordMovementPayload) => recordMovement(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: stockQueryKeys.product(variables.productId) });
      queryClient.invalidateQueries({ queryKey: stockQueryKeys.warehouse(variables.warehouseId) });
      queryClient.invalidateQueries({ queryKey: stockQueryKeys.overview });
    },
  });
}

export function useTransferStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TransferStockPayload) => transferStock(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: stockQueryKeys.product(variables.productId) });
      queryClient.invalidateQueries({
        queryKey: stockQueryKeys.warehouse(variables.fromWarehouseId),
      });
      queryClient.invalidateQueries({
        queryKey: stockQueryKeys.warehouse(variables.toWarehouseId),
      });
      queryClient.invalidateQueries({ queryKey: stockQueryKeys.overview });
    },
  });
}
