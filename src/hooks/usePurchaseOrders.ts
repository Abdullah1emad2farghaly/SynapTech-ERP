// Project path: src/hooks/usePurchaseOrders.ts

import { useQuery } from "@tanstack/react-query";
import {
  getPurchaseOrders,
  getPurchaseOrderById,
} from "../services/api/purchaseOrders.api";
import { getProductsLookup } from "../services/api/products.lookup.api";

export const purchaseOrdersQueryKeys = {
  all: ["purchaseOrders"] as const,
  detail: (id: string) => ["purchaseOrders", id] as const,
  productsLookup: ["products", "lookup"] as const,
};

export function usePurchaseOrders() {
  return useQuery({
    queryKey: purchaseOrdersQueryKeys.all,
    queryFn: getPurchaseOrders,
  });
}

export function usePurchaseOrder(id: string | undefined) {
  return useQuery({
    queryKey: purchaseOrdersQueryKeys.detail(id ?? ""),
    queryFn: () => getPurchaseOrderById(id as string),
    enabled: Boolean(id),
  });
}

export function useProductsLookup() {
  return useQuery({
    queryKey: purchaseOrdersQueryKeys.productsLookup,
    queryFn: getProductsLookup,
    staleTime: 5 * 60 * 1000,
  });
}
