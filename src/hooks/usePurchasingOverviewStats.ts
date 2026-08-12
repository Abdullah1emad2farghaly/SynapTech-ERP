// Intended path: src/hooks/usePurchasingOverviewStats.ts
// Mirrors useSalesOverviewStats.ts's pattern: derives all Purchasing
// Overview statistics client-side from two already-fetched full lists
// (Purchase Orders, Suppliers). No new API calls — pure derivation + memo.
// ASSUMPTION: imports useSuppliers from './useSuppliers' and
// usePurchaseOrders from './usePurchaseOrders' — these modules (Suppliers
// Module 7, Purchase Orders Module 8) are already fully built in this
// project; verify the actual hook names/paths before merging if they differ.

import { useMemo } from 'react';
import { useSuppliers } from './useSuppliers';
import { usePurchaseOrders } from './usePurchaseOrders';
import type { PurchaseOrderResponse } from '@/types/purchaseOrders.types';

export interface StatusCount {
  status: string;
  count: number;
}

export interface TopSupplier {
  supplierId: string;
  supplierName: string;
  orderCount: number;
  totalValue: number;
}

// Purchase Orders have a real expectedDate field (Sales Orders don't) — this
// is the one genuinely Purchasing-specific metric that isn't just a mirror
// of the Sales Overview pattern.
export interface OverdueOrder {
  order: PurchaseOrderResponse;
  daysOverdue: number;
}

export interface PurchasingOverviewStats {
  totalOrders: number;
  totalOrderValue: number;
  totalSuppliers: number;
  activeSuppliers: number;
  ordersByStatus: StatusCount[];
  topSuppliers: TopSupplier[];
  recentOrders: PurchaseOrderResponse[];
  overdueOrders: OverdueOrder[];
}

// Orders in these statuses are already resolved and can never be "overdue"
// regardless of expectedDate.
const TERMINAL_STATUSES = new Set(['Received', 'Cancelled']);

export function usePurchasingOverviewStats() {
  const ordersQuery = usePurchaseOrders();
  const suppliersQuery = useSuppliers();

  const stats = useMemo<PurchasingOverviewStats | null>(() => {
    if (!ordersQuery.data || !suppliersQuery.data) return null;
    const orders = ordersQuery.data;
    const suppliers = suppliersQuery.data;

    const totalOrders = orders.length;
    const totalOrderValue = orders.reduce((sum, o) => sum + (o.totalAmount ?? 0), 0);
    const totalSuppliers = suppliers.length;
    const activeSuppliers = suppliers.filter(s => s.isActive).length;

    const statusMap = new Map<string, number>();
    for (const o of orders) {
      const key = o.status ?? 'Unknown';
      statusMap.set(key, (statusMap.get(key) ?? 0) + 1);
    }
    const ordersByStatus: StatusCount[] = Array.from(statusMap.entries()).map(
      ([status, count]) => ({ status, count }),
    );

    const supplierMap = new Map<string, TopSupplier>();
    for (const o of orders) {
      if (!o.supplierId) continue;
      const existing = supplierMap.get(o.supplierId);
      if (existing) {
        existing.orderCount += 1;
        existing.totalValue += o.totalAmount ?? 0;
      } else {
        supplierMap.set(o.supplierId, {
          supplierId: o.supplierId,
          supplierName: o.supplierName ?? '—',
          orderCount: 1,
          totalValue: o.totalAmount ?? 0,
        });
      }
    }
    const topSuppliers = Array.from(supplierMap.values())
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 5);

    const recentOrders = [...orders]
      .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
      .slice(0, 8);

    const now = Date.now();
    const overdueOrders: OverdueOrder[] = orders
      .filter(o => !TERMINAL_STATUSES.has(o.status ?? '') && o.expectedDate)
      .map(o => ({
        order: o,
        daysOverdue: Math.floor((now - new Date(o.expectedDate as string).getTime()) / 86_400_000),
      }))
      .filter(o => o.daysOverdue > 0)
      .sort((a, b) => b.daysOverdue - a.daysOverdue)
      .slice(0, 5);

    return {
      totalOrders,
      totalOrderValue,
      totalSuppliers,
      activeSuppliers,
      ordersByStatus,
      topSuppliers,
      recentOrders,
      overdueOrders,
    };
  }, [ordersQuery.data, suppliersQuery.data]);

  return {
    stats,
    isLoading: ordersQuery.isLoading || suppliersQuery.isLoading,
    isError: ordersQuery.isError || suppliersQuery.isError,
    ordersError: ordersQuery.error,
    suppliersError: suppliersQuery.error,
    refetch: () => {
      ordersQuery.refetch();
      suppliersQuery.refetch();
    },
  };
}
