// Intended project path: src/hooks/useCashierStatistics.ts
import { useMemo, useState } from "react";
import { useCashierOrders } from "./useCashier";
import { useProducts } from "./useProducts";
import { useCategories } from "./useCategories"; // existing, confirmed Categories module hook
import {
  resolveDatePreset,
  type CashierStatsDatePreset,
} from "../constants/cashierStatisticsFilters";
import {
  comparePeriods,
  computeCategorySales,
  computeCustomerBreakdown,
  computeDiscountsOverTime,
  computeKpis,
  computePaymentMethodBreakdown,
  computeSalesByHour,
  computeSalesTrend,
  computeTopCustomers,
  computeTopProducts,
  computeVoidedOrdersStats,
  filterOrdersByRange,
  type DateRange,
} from "../utils/cashierStatistics.derive";
import type { CashierOrderResponse } from "../services/api/cashier.api";

interface UseCashierStatisticsOptions {
  paymentMethodFilter?: string | null; // "All" when null
}

// Everything below is computed client-side from the full order list
// returned by GET /api/cashier/orders (already fetched, cached, and
// invalidated by useCashierOrders) — there is no separate statistics
// query/endpoint to call. This does mean the whole order list is pulled
// once and re-filtered in memory on every filter change; flagged as the
// same full-list-load tradeoff already accepted elsewhere in this project
// (Departments/Journal Entries/Suppliers), not a new pattern.
export const useCashierStatistics = (options: UseCashierStatisticsOptions = {}) => {
  const [datePreset, setDatePreset] = useState<CashierStatsDatePreset>("thisMonth");
  const [customRange, setCustomRange] = useState<DateRange | undefined>(undefined);

  const { data: allOrders = [], isLoading: ordersLoading, isError: ordersError, refetch } =
    useCashierOrders();
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();

  const range = useMemo(() => resolveDatePreset(datePreset, customRange), [datePreset, customRange]);

  const filteredOrders = useMemo(() => {
    const inRange = filterOrdersByRange(allOrders, range);
    if (!options.paymentMethodFilter) return inRange;
    return inRange.filter((o) =>
      (o.payments ?? []).some((p) => p.method === options.paymentMethodFilter)
    );
  }, [allOrders, range, options.paymentMethodFilter]);

  const kpis = useMemo(() => computeKpis(filteredOrders), [filteredOrders]);

  const salesComparison = useMemo(
    () => comparePeriods(allOrders, range, (k) => k.totalSales),
    [allOrders, range]
  );
  const transactionsComparison = useMemo(
    () => comparePeriods(allOrders, range, (k) => k.totalTransactions),
    [allOrders, range]
  );

  const salesTrend = useMemo(() => computeSalesTrend(filteredOrders, range), [filteredOrders, range]);
  const salesByHour = useMemo(() => computeSalesByHour(filteredOrders), [filteredOrders]);
  const paymentMethods = useMemo(
    () => computePaymentMethodBreakdown(filteredOrders),
    [filteredOrders]
  );
  const topProducts = useMemo(() => computeTopProducts(filteredOrders), [filteredOrders]);
  const categorySales = useMemo(
    () => computeCategorySales(filteredOrders, products, categories),
    [filteredOrders, products, categories]
  );
  const discountsOverTime = useMemo(
    () => computeDiscountsOverTime(filteredOrders, range),
    [filteredOrders, range]
  );
  const voidedStats = useMemo(() => computeVoidedOrdersStats(filteredOrders), [filteredOrders]);
  const customerBreakdown = useMemo(() => computeCustomerBreakdown(filteredOrders), [filteredOrders]);
  const topCustomers = useMemo(() => computeTopCustomers(filteredOrders), [filteredOrders]);

  const availablePaymentMethods = useMemo(() => {
    const methods = new Set<string>();
    for (const order of allOrders) {
      for (const payment of order.payments ?? []) {
        if (payment.method) methods.add(payment.method);
      }
    }
    return Array.from(methods);
  }, [allOrders]);

  return {
    isLoading: ordersLoading,
    isError: ordersError,
    refetch,
    productsLoading,
    categoriesLoading,
    datePreset,
    setDatePreset,
    customRange,
    setCustomRange,
    range,
    filteredOrders: filteredOrders as CashierOrderResponse[],
    kpis,
    salesComparison,
    transactionsComparison,
    salesTrend,
    salesByHour,
    paymentMethods,
    topProducts,
    categorySales,
    discountsOverTime,
    voidedStats,
    customerBreakdown,
    topCustomers,
    availablePaymentMethods,
  };
};
