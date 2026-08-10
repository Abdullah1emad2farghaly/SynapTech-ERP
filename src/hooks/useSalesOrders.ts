// Project path: src/hooks/useSalesOrders.ts
//
// Products lookup reuses the existing services/api/products.lookup.api.ts
// built for Purchase Orders — same unconfirmed endpoint, no reason to assume
// a second one for this module.

import { useQuery } from "@tanstack/react-query";
import { getSalesOrders, getSalesOrderById } from "../services/api/salesOrders.api";
import { getCustomersLookup } from "../services/api/customers.lookup.api";
import { getProductsLookup } from "../services/api/products.lookup.api";

export const salesOrdersQueryKeys = {
  all: ["salesOrders"] as const,
  detail: (id: string) => ["salesOrders", id] as const,
  customersLookup: ["customers", "lookup"] as const,
};

export function useSalesOrders() {
  return useQuery({
    queryKey: salesOrdersQueryKeys.all,
    queryFn: getSalesOrders,
  });
}

export function useSalesOrder(id: string | undefined) {
  return useQuery({
    queryKey: salesOrdersQueryKeys.detail(id ?? ""),
    queryFn: () => getSalesOrderById(id as string),
    enabled: Boolean(id),
  });
}

export function useCustomersLookup() {
  return useQuery({
    queryKey: salesOrdersQueryKeys.customersLookup,
    queryFn: getCustomersLookup,
    staleTime: 5 * 60 * 1000,
  });
}

/** Re-exported under this module's own hook name for import-path clarity in
 *  Sales Orders' components — same underlying query key/fetcher as
 *  Purchase Orders' useProductsLookup, so the cache is shared, not duplicated. */
export function useSalesOrderProductsLookup() {
  return useQuery({
    queryKey: ["products", "lookup"] as const,
    queryFn: getProductsLookup,
    staleTime: 5 * 60 * 1000,
  });
}
