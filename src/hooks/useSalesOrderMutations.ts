// Project path: src/hooks/useSalesOrderMutations.ts
//
// bulkCancel loops over the singular /cancel endpoint via Promise.allSettled —
// no bulk endpoint exists, same pattern as Purchase Orders' bulk cancel.

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createSalesOrder,
  updateSalesOrder,
  submitSalesOrder,
  approveSalesOrder,
  shipSalesOrderGoods,
  cancelSalesOrder,
} from "../services/api/salesOrders.api";
import { salesOrdersQueryKeys } from "./useSalesOrders";
import type { CreateSalesOrderPayload, ShipGoodsPayload } from "../types/salesOrders.types";

function useInvalidateAll() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: salesOrdersQueryKeys.all });
}

function useInvalidateOne(id: string) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: salesOrdersQueryKeys.all });
    queryClient.invalidateQueries({ queryKey: salesOrdersQueryKeys.detail(id) });
  };
}

export function useCreateSalesOrder() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: (payload: CreateSalesOrderPayload) => createSalesOrder(payload),
    onSuccess: invalidate,
  });
}

export function useUpdateSalesOrder(id: string) {
  const invalidate = useInvalidateOne(id);
  return useMutation({
    mutationFn: (payload: CreateSalesOrderPayload) => updateSalesOrder(id, payload),
    onSuccess: invalidate,
  });
}

export function useSubmitSalesOrder(id: string) {
  const invalidate = useInvalidateOne(id);
  return useMutation({
    mutationFn: () => submitSalesOrder(id),
    onSuccess: invalidate,
  });
}

export function useApproveSalesOrder(id: string) {
  const invalidate = useInvalidateOne(id);
  return useMutation({
    mutationFn: () => approveSalesOrder(id),
    onSuccess: invalidate,
  });
}

export function useShipSalesOrderGoods(id: string) {
  const invalidate = useInvalidateOne(id);
  return useMutation({
    mutationFn: (payload: ShipGoodsPayload) => shipSalesOrderGoods(id, payload),
    onSuccess: invalidate,
  });
}

export function useCancelSalesOrder(id: string) {
  const invalidate = useInvalidateOne(id);
  return useMutation({
    mutationFn: () => cancelSalesOrder(id),
    onSuccess: invalidate,
  });
}

interface BulkResult {
  succeededIds: string[];
  failedIds: string[];
}

export function useBulkCancelSalesOrders() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: async (ids: string[]): Promise<BulkResult> => {
      const results = await Promise.allSettled(ids.map((id) => cancelSalesOrder(id)));
      const succeededIds: string[] = [];
      const failedIds: string[] = [];
      results.forEach((result, index) => {
        if (result.status === "fulfilled") succeededIds.push(ids[index]);
        else failedIds.push(ids[index]);
      });
      return { succeededIds, failedIds };
    },
    onSuccess: invalidate,
  });
}
