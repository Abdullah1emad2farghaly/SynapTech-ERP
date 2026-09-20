// Intended project path: src/types/cashierStatistics.types.ts
//
// Derived strictly from the confirmed CashierOrderResponse / CashierShiftResponse
// contracts in src/services/cashier.api.ts. No invented fields.

import type { CashierOrderResponse } from "../services/api/cashier.api";

export interface CashierDateRangeFilter {
  /** ISO date string, inclusive. null = no lower bound. */
  start: string | null;
  /** ISO date string, inclusive. null = no upper bound. */
  end: string | null;
}

export type CashierDateRangePreset =
  | "today"
  | "yesterday"
  | "last7Days"
  | "last30Days"
  | "thisMonth"
  | "custom";

export interface CashierStatisticsFilters {
  preset: CashierDateRangePreset;
  range: CashierDateRangeFilter;
}

export interface CashierKpis {
  totalSales: number;
  transactionCount: number;
  averageTransactionValue: number;
  itemsSold: number;
  totalDiscounts: number;
  discountedTransactionCount: number;
  voidedCount: number;
  voidedRate: number; // voidedCount / (completed + voided), 0 if no orders
}

export interface PaymentMethodStat {
  method: string; // taken verbatim from payments[].method — never hardcoded
  transactionCount: number;
  amount: number;
  percentageOfTotal: number;
}

export interface TopProductStat {
  productId: string;
  productName: string;
  quantitySold: number;
  salesAmount: number;
}

export interface HourlySalesStat {
  hour: number; // 0–23, derived from orderDate
  transactionCount: number;
  salesAmount: number;
}

export interface OrderStatusStat {
  status: string; // verbatim from CashierOrderResponse.status
  count: number;
  amount: number;
}

export interface CustomerStat {
  customerId: string | null; // null = aggregated walk-in bucket
  customerName: string; // resolved name, or "Walk-in" / the id if unresolved
  orderCount: number;
  salesAmount: number;
}

export interface CashierPerformanceStat {
  cashierUserId: string;
  cashierName: string; // resolved name, or the raw id if unresolved
  orderCount: number;
  salesAmount: number;
  averageOrderValue: number;
  itemsSold: number;
}

export interface DiscountSummary {
  totalDiscountAmount: number;
  discountedOrderCount: number;
  averageDiscountPerDiscountedOrder: number;
  discountAsPercentOfGrossSales: number; // discounts / (subTotal sum), 0 if no orders
}

export interface CashierStatisticsData {
  filteredOrders: CashierOrderResponse[];
  kpis: CashierKpis;
  paymentMethods: PaymentMethodStat[];
  topProducts: TopProductStat[];
  hourlySales: HourlySalesStat[];
  orderStatus: OrderStatusStat[];
  topCustomers: CustomerStat[];
  discountSummary: DiscountSummary;
}
