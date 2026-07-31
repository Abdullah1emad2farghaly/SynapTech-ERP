// src/hooks/useStockOverview.ts
//
// There is no GET-all-stock endpoint. This hook composes the Overview
// dataset by fetching the warehouse list, then calling
// GET /api/Stock/warehouses/{id} once PER warehouse via TanStack Query's
// useQueries (not a single combined query) — deliberately, so:
//   1. Each warehouse's data can render as soon as ITS call resolves,
//      rather than blocking the whole table on the slowest one
//      (progressive loading, per the design spec's Loading State
//      section).
//   2. One warehouse's call failing doesn't discard everything else that
//      DID load — the design spec's Error State explicitly asks for
//      "show what loaded, inline-retry just the failed part."
//
// This is a real, acknowledged N+1 pattern — flagged in the design spec
// as the strongest candidate in this whole module for a backend fix
// (a real GET /api/Stock or /api/Stock/overview endpoint). This hook
// does the best it can with what exists; it doesn't pretend the
// composition is free.

import { useQueries, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useWarehouses } from "./useWarehouses";
import { getWarehouseStock, type StockLevel } from "../services/api/stock.api";
import { stockQueryKeys } from "./useStock";

export interface WarehouseLoadState {
  warehouseId: string;
  warehouseName: string;
  isLoading: boolean;
  isError: boolean;
}

export interface UseStockOverviewResult {
  /** Every StockLevel row successfully loaded so far, across all warehouses. */
  rows: StockLevel[];
  /** True only while the warehouse list itself is loading — individual warehouse rows may still be arriving after this flips false. */
  isLoadingWarehouseList: boolean;
  /** True if the warehouse list itself failed (nothing can be composed at all). */
  isWarehouseListError: boolean;
  /** Per-warehouse load state, so the page can show "loaded 6 of 9 warehouses" progress and per-warehouse retry. */
  warehouseStates: WarehouseLoadState[];
  /** True while at least one warehouse's stock call is still in flight. */
  isComposing: boolean;
  retryWarehouse: (warehouseId: string) => void;
  refetchAll: () => void;
}

export function useStockOverview(): UseStockOverviewResult {
  const queryClient = useQueryClient();
  const {
    data: warehouses = [],
    isLoading: isLoadingWarehouseList,
    isError: isWarehouseListError,
    refetch: refetchWarehouseList,
  } = useWarehouses();


  const stockQueries = useQueries({
    queries: warehouses.map((warehouse) => ({
      queryKey: stockQueryKeys.warehouse(warehouse.id),
      queryFn: () => getWarehouseStock(warehouse.id),
      enabled: warehouses.length > 0,
    })),
  });

  const rows = useMemo(() => {
    const all: StockLevel[] = [];
    stockQueries.forEach((q) => {
      if (q.data) all.push(...q.data);
    });
    return all;
  }, [stockQueries]);

  const warehouseStates: WarehouseLoadState[] = warehouses.map((warehouse, index) => ({
    warehouseId: warehouse.id,
    warehouseName: warehouse.name,
    isLoading: stockQueries[index]?.isLoading ?? false,
    isError: stockQueries[index]?.isError ?? false,
  }));

  const isComposing = stockQueries.some((q) => q.isLoading);

  function retryWarehouse(warehouseId: string) {
    queryClient.invalidateQueries({ queryKey: stockQueryKeys.warehouse(warehouseId) });
  }

  function refetchAll() {
    refetchWarehouseList();
    warehouses.forEach((w) =>
      queryClient.invalidateQueries({ queryKey: stockQueryKeys.warehouse(w.id) }),
    );
  }

  return {
    rows,
    isLoadingWarehouseList,
    isWarehouseListError,
    warehouseStates,
    isComposing,
    retryWarehouse,
    refetchAll,
  };
}
