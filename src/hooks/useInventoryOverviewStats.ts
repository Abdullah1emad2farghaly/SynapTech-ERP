// Intended path: src/hooks/useInventoryOverviewStats.ts
// REPLACES the previous version of this file. Adds three new derived
// metrics on top of the original (totalProducts/activeProducts/
// totalCategories/warehouses/stockByWarehouse/topProductsByStock, all
// unchanged below) — each grounded in fields that are actually on the
// confirmed contract, not invented:
//
//   1. totalInventoryValueAtCost — quantityOnHand × costPrice, summed
//      across every stock level, cross-referenced against ProductResponse.
//      Uses cost (not sale price) since that's the standard basis for an
//      inventory valuation figure, not a projected-revenue one.
//   2. productsByCategory — real distribution: every ProductResponse has a
//      categoryId (nullable), grouped against CategoryResponse names, with
//      an explicit "Uncategorized" bucket for null.
//   3. outOfStockProducts — active products whose summed quantityOnHand
//      across all warehouses is zero (or has no stock record at all).
//      Deliberately NOT a "low stock" list — there is no reorder-point /
//      minimum-stock field anywhere on ProductResponse, so any non-zero
//      threshold would be invented. Zero is the one threshold that's
//      actually determinable from the data as-is.
//
// Still carries the same N+1-by-warehouse stock-fetch caveat as before —
// see the stockQuery block below, unchanged in shape.
// ASSUMPTION: useWarehouses from './useWarehouses' — Module 6's actual hook
// name/path is unverified, check before merging.

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useProducts } from './useProducts';
import { useCategories } from './useCategories';
import { useWarehouses } from './useWarehouses';
import { getWarehouseStock, StockLevel } from '@/services/api/stock.api';

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

export interface CategoryProductCount {
  categoryId: string | null;
  categoryName: string;
  productCount: number;
}

export interface OutOfStockProduct {
  productId: string;
  productSku: string;
  productName: string;
}

export interface InventoryOverviewStats {
  totalProducts: number;
  activeProducts: number;
  totalCategories: number;
  activeCategories: number;
  totalWarehouses: number;
  activeWarehouses: number;
  totalInventoryValueAtCost: number;
  stockByWarehouse: WarehouseStockTotal[];
  topProductsByStock: TopStockProduct[];
  productsByCategory: CategoryProductCount[];
  outOfStockProducts: OutOfStockProduct[];
  outOfStockCount: number;
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

    const products = productsQuery.data;
    const categories = categoriesQuery.data;
    // Stock is deliberately allowed to still be loading/empty without
    // blocking the rest of the page.
    const stockLevels: StockLevel[] = stockQuery.data ?? [];

    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.isActive).length;
    const totalCategories = categories.length;
    const activeCategories = categories.filter(c => c.isActive).length;
    const totalWarehouses = warehousesQuery.data.length;
    const activeWarehouses = warehousesQuery.data.filter(w => w.isActive).length;

    // --- per-product stock totals (used by both "top products" and
    // "out of stock") ---
    const productStockTotals = new Map<string, number>();
    for (const level of stockLevels) {
      productStockTotals.set(
        level.productId,
        (productStockTotals.get(level.productId) ?? 0) + level.quantityOnHand,
      );
    }

    // --- warehouse totals ---
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

    // --- top products by stock ---
    const productMeta = new Map(products.map(p => [p.id, p]));
    const topProductsByStock: TopStockProduct[] = Array.from(productStockTotals.entries())
      .map(([productId, totalUnits]) => {
        const meta = productMeta.get(productId);
        return {
          productId,
          productSku: meta?.sku ?? '—',
          productName: meta?.name ?? '—',
          totalUnits,
        };
      })
      .sort((a, b) => b.totalUnits - a.totalUnits)
      .slice(0, 5);

    // --- inventory value at cost ---
    let totalInventoryValueAtCost = 0;
    for (const level of stockLevels) {
      const product = productMeta.get(level.productId);
      // ASSUMPTION: a stock record referencing a product not found in the
      // current products list (edge case — e.g. race condition between
      // queries) is skipped rather than guessed at.
      if (!product) continue;
      totalInventoryValueAtCost += level.quantityOnHand * (product.costPrice ?? 0);
    }

    // --- products by category ---
    const categoryNameById = new Map(categories.map(c => [c.id, c.name ?? '—']));
    const categoryCounts = new Map<string, CategoryProductCount>();
    for (const product of products) {
      const key = product.categoryId ?? '__uncategorized__';
      const existing = categoryCounts.get(key);
      if (existing) {
        existing.productCount += 1;
      } else {
        categoryCounts.set(key, {
          categoryId: product.categoryId,
          categoryName: product.categoryId
            ? categoryNameById.get(product.categoryId) ?? '—'
            : '__uncategorized__', // resolved to a translated label by the component, not here
          productCount: 1,
        });
      }
    }
    const productsByCategory = Array.from(categoryCounts.values()).sort(
      (a, b) => b.productCount - a.productCount,
    );

    // --- out of stock (active products only, zero total across all warehouses) ---
    const outOfStockProducts: OutOfStockProduct[] = products
      .filter(p => p.isActive && (productStockTotals.get(p.id) ?? 0) <= 0)
      .map(p => ({ productId: p.id, productSku: p.sku ?? '—', productName: p.name ?? '—' }));

    return {
      totalProducts,
      activeProducts,
      totalCategories,
      activeCategories,
      totalWarehouses,
      activeWarehouses,
      totalInventoryValueAtCost,
      stockByWarehouse,
      topProductsByStock,
      productsByCategory,
      outOfStockProducts: outOfStockProducts.slice(0, 6),
      outOfStockCount: outOfStockProducts.length,
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
