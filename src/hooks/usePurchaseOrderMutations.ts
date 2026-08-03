// Project path: src/hooks/usePurchaseOrderMutations.ts
//
// bulkCancel loops over the singular /cancel endpoint via Promise.allSettled —
// no bulk endpoint exists, same pattern as this project's other bulk actions.

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createPurchaseOrder,
  updatePurchaseOrder,
  submitPurchaseOrder,
  approvePurchaseOrder,
  receivePurchaseOrderGoods,
  cancelPurchaseOrder,
} from "../services/api/purchaseOrders.api";
import { purchaseOrdersQueryKeys } from "./usePurchaseOrders";
import type {
  CreatePurchaseOrderPayload,
  ReceiveGoodsPayload,
} from "../types/purchaseOrders.types";

function useInvalidateAll() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: purchaseOrdersQueryKeys.all });
}

function useInvalidateOne(id: string) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: purchaseOrdersQueryKeys.all });
    queryClient.invalidateQueries({ queryKey: purchaseOrdersQueryKeys.detail(id) });
  };
}

export function useCreatePurchaseOrder() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: (payload: CreatePurchaseOrderPayload) => createPurchaseOrder(payload),
    onSuccess: invalidate,
  });
}

export function useUpdatePurchaseOrder(id: string) {
  const invalidate = useInvalidateOne(id);
  return useMutation({
    mutationFn: (payload: CreatePurchaseOrderPayload) => updatePurchaseOrder(id, payload),
    onSuccess: invalidate,
  });
}

export function useSubmitPurchaseOrder(id: string) {
  const invalidate = useInvalidateOne(id);
  return useMutation({
    mutationFn: () => submitPurchaseOrder(id),
    onSuccess: invalidate,
  });
}

export function useApprovePurchaseOrder(id: string) {
  const invalidate = useInvalidateOne(id);
  return useMutation({
    mutationFn: () => approvePurchaseOrder(id),
    onSuccess: invalidate,
  });
}

export function useReceivePurchaseOrderGoods(id: string) {
  const invalidate = useInvalidateOne(id);
  return useMutation({
    mutationFn: (payload: ReceiveGoodsPayload) => receivePurchaseOrderGoods(id, payload),
    onSuccess: invalidate,
  });
}

export function useCancelPurchaseOrder(id: string) {
  const invalidate = useInvalidateOne(id);
  return useMutation({
    mutationFn: () => cancelPurchaseOrder(id),
    onSuccess: invalidate,
  });
}

interface BulkResult {
  succeededIds: string[];
  failedIds: string[];
}

export function useBulkCancelPurchaseOrders() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: async (ids: string[]): Promise<BulkResult> => {
      const results = await Promise.allSettled(ids.map((id) => cancelPurchaseOrder(id)));
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
