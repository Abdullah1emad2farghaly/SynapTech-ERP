// Project path: src/hooks/useWarehouses.ts

import { useQuery } from "@tanstack/react-query";
import { getWarehouses, getWarehouseById } from "../services/api/warehouses.crud.api";

export const warehousesQueryKeys = {
  all: ["warehouses"] as const,
  detail: (id: string) => ["warehouses", id] as const,
};

export function useWarehouses() {
  return useQuery({
    queryKey: warehousesQueryKeys.all,
    queryFn: getWarehouses,
  });
}

export function useWarehouse(id: string | undefined) {
  return useQuery({
    queryKey: warehousesQueryKeys.detail(id ?? ""),
    queryFn: () => getWarehouseById(id as string),
    enabled: Boolean(id),
  });
}
