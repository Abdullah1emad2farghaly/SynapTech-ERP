// Intended path: src/hooks/useInventoryOverviewStats.ts
// Unlike useSalesOverviewStats/usePurchasingOverviewStats, this one issues
// MORE than the "two list queries" pattern, because Stock has no list-all
// endpoint (see stock.api.ts). Stock totals are computed by calling
// GET /api/Stock/warehouses/{id} once per warehouse (Promise.all) rather
// than once per product — warehouse count is expected to be far smaller
// than product count, so this is the cheaper of the two possible N+1
// shapes, but it's still a real extra-round-trips cost this page
// introduces on every load. Same category of scalability tradeoff already
// flagged elsewhere in this project (Departments/Branches full-list
// pattern) — written down explicitly here since it compounds per warehouse.
// ASSUMPTION: imports useWarehouses from './useWarehouses' — the actual
// Module 6 hook name/path is unverified, check before merging.

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useProducts } from './useProducts';
import { useCategories } from './useCategories';
import { useWarehouses } from './useWarehouses';
import { getWarehouseStock, type StockLevel } from '../services/api/stock.api';

export interface WarehouseStockTotal {
  warehouseId: string;
  warehouseName: string;
  totalUnits: number;
}

export interface TopStockProduct {
  productId: string;
  productSku: string;
  productName: string;
  totalUnits: number;
}

export interface InventoryOverviewStats {
  totalProducts: number;
  activeProducts: number;
  totalCategories: number;
  activeCategories: number;
  totalWarehouses: number;
  activeWarehouses: number;
  stockByWarehouse: WarehouseStockTotal[];
  topProductsByStock: TopStockProduct[];
}

export function useInventoryOverviewStats() {
  const productsQuery = useProducts();
  const categoriesQuery = useCategories();
  const warehousesQuery = useWarehouses();

  const warehouseIds = useMemo(
    () => (warehousesQuery.data ?? []).map(w => w.id),
    [warehousesQuery.data],
  );

  const stockQuery = useQuery({
    queryKey: ['stock', 'byWarehouses', warehouseIds],
    queryFn: async () => {
      const results = await Promise.all(warehouseIds.map(id => getWarehouseStock(id)));
      return results.flat();
    },
    enabled: warehouseIds.length > 0,
  });

  const stats = useMemo<InventoryOverviewStats | null>(() => {
    if (!productsQuery.data || !categoriesQuery.data || !warehousesQuery.data) return null;

    // Stock is deliberately allowed to still be loading/empty without
    // blocking the rest of the page — the chart/ranking below render their
    // own independent loading state rather than gating the whole page on
    // the slowest, most expensive query.
    const stockLevels: StockLevel[] = stockQuery.data ?? [];

    const totalProducts = productsQuery.data.length;
    const activeProducts = productsQuery.data.filter(p => p.isActive).length;
    const totalCategories = categoriesQuery.data.length;
    const activeCategories = categoriesQuery.data.filter(c => c.isActive).length;
    const totalWarehouses = warehousesQuery.data.length;
    const activeWarehouses = warehousesQuery.data.filter(w => w.isActive).length;

    const warehouseTotals = new Map<string, WarehouseStockTotal>();
    for (const level of stockLevels) {
      const existing = warehouseTotals.get(level.warehouseId);
      if (existing) {
        existing.totalUnits += level.quantityOnHand;
      } else {
        warehouseTotals.set(level.warehouseId, {
          warehouseId: level.warehouseId,
          warehouseName: level.warehouseName ?? '—',
          totalUnits: level.quantityOnHand,
        });
      }
    }
    const stockByWarehouse = Array.from(warehouseTotals.values()).sort(
      (a, b) => b.totalUnits - a.totalUnits,
    );

    const productTotals = new Map<string, TopStockProduct>();
    for (const level of stockLevels) {
      const existing = productTotals.get(level.productId);
      if (existing) {
        existing.totalUnits += level.quantityOnHand;
      } else {
        productTotals.set(level.productId, {
          productId: level.productId,
          productSku: level.productSku ?? '—',
          productName: level.productName ?? '—',
          totalUnits: level.quantityOnHand,
        });
      }
    }
    const topProductsByStock = Array.from(productTotals.values())
      .sort((a, b) => b.totalUnits - a.totalUnits)
      .slice(0, 5);

    return {
      totalProducts,
      activeProducts,
      totalCategories,
      activeCategories,
      totalWarehouses,
      activeWarehouses,
      stockByWarehouse,
      topProductsByStock,
    };
  }, [productsQuery.data, categoriesQuery.data, warehousesQuery.data, stockQuery.data]);

  return {
    stats,
    isLoading: productsQuery.isLoading || categoriesQuery.isLoading || warehousesQuery.isLoading,
    isStockLoading: stockQuery.isLoading,
    isError: productsQuery.isError || categoriesQuery.isError || warehousesQuery.isError,
    isStockError: stockQuery.isError,
    refetch: () => {
      productsQuery.refetch();
      categoriesQuery.refetch();
      warehousesQuery.refetch();
      stockQuery.refetch();
    },
  };
}
