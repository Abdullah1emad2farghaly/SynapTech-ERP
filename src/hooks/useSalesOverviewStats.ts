// Intended path: src/hooks/useSalesOverviewStats.ts
// Derives all Sales Overview statistics client-side from the two already-
// fetched full lists (Sales Orders, Customers). No new API calls beyond the
// two list queries — pure derivation + memoization, no server aggregation.
// ASSUMPTION: imports useSalesOrders from './useSalesOrders' — matches this
// project's established use<Module>.ts naming convention for Sales Orders;
// verify the actual hook name/path before merging if it differs.

import { useMemo } from 'react';
import { useSalesOrders } from './useSalesOrders';
import { useCustomers } from './useCustomers';
import type { SalesOrderResponse } from '@/types/salesOrders.types';

export interface StatusCount {
  status: string;
  count: number;
}

export interface TopCustomer {
  customerId: string;
  customerName: string;
  orderCount: number;
  totalValue: number;
}

export interface SalesOverviewStats {
  totalOrders: number;
  totalOrderValue: number;
  totalCustomers: number;
  activeCustomers: number;
  ordersByStatus: StatusCount[];
  topCustomers: TopCustomer[];
  recentOrders: SalesOrderResponse[];
}

export function useSalesOverviewStats() {
  const ordersQuery = useSalesOrders();
  const customersQuery = useCustomers();

  const stats = useMemo<SalesOverviewStats | null>(() => {
    if (!ordersQuery.data || !customersQuery.data) return null;
    const orders = ordersQuery.data;
    const customers = customersQuery.data;

    const totalOrders = orders.length;
    const totalOrderValue = orders.reduce((sum, o) => sum + (o.totalAmount ?? 0), 0);
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.isActive).length;

    const statusMap = new Map<string, number>();
    for (const o of orders) {
      const key = o.status ?? 'Unknown';
      statusMap.set(key, (statusMap.get(key) ?? 0) + 1);
    }
    const ordersByStatus: StatusCount[] = Array.from(statusMap.entries()).map(
      ([status, count]) => ({ status, count }),
    );

    const customerMap = new Map<string, TopCustomer>();
    for (const o of orders) {
      if (!o.customerId) continue;
      const existing = customerMap.get(o.customerId);
      if (existing) {
        existing.orderCount += 1;
        existing.totalValue += o.totalAmount ?? 0;
      } else {
        customerMap.set(o.customerId, {
          customerId: o.customerId,
          customerName: o.customerName ?? '—',
          orderCount: 1,
          totalValue: o.totalAmount ?? 0,
        });
      }
    }
    const topCustomers = Array.from(customerMap.values())
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 5);

    const recentOrders = [...orders]
      .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
      .slice(0, 8);

    return {
      totalOrders,
      totalOrderValue,
      totalCustomers,
      activeCustomers,
      ordersByStatus,
      topCustomers,
      recentOrders,
    };
  }, [ordersQuery.data, customersQuery.data]);

  return {
    stats,
    isLoading: ordersQuery.isLoading || customersQuery.isLoading,
    isError: ordersQuery.isError || customersQuery.isError,
    ordersError: ordersQuery.error,
    customersError: customersQuery.error,
    refetch: () => {
      ordersQuery.refetch();
      customersQuery.refetch();
    },
  };
}
