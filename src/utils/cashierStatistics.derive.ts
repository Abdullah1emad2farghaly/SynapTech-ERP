// Intended project path: src/utils/cashierStatistics.derive.ts
//
// Every function here derives statistics from data the confirmed Cashier
// API already returns (CashierOrderResponse[], with embedded lines[] and
// payments[]) — nothing is fetched from an invented statistics endpoint.
// No such endpoint exists in the confirmed contract (see Module 12 build
// notes); this file is the honest substitute: real aggregation over the
// real full order list, same precedent as Journal Entries/Accounts KPIs.
import type { CashierOrderResponse } from "../services/api/cashier.api";
import type { Product } from "../services/api/products.api";
import type { Category } from "../services/api/categories.api"; // existing, confirmed Categories module

export interface DateRange {
  from: Date;
  to: Date;
}

export const isWithinRange = (isoDate: string, range: DateRange): boolean => {
  const date = new Date(isoDate);
  return date >= range.from && date <= range.to;
};

export const filterOrdersByRange = (
  orders: CashierOrderResponse[],
  range: DateRange
): CashierOrderResponse[] => orders.filter((o) => isWithinRange(o.orderDate, range));

// "Completed" is inferred as any order whose status isn't the literal
// "Voided" string — status has no confirmed enum (same flag as elsewhere
// in this project), so this stays a defensive string check, not a fixed set.
const isVoided = (order: CashierOrderResponse) => order.status === "Voided";
const isCompleted = (order: CashierOrderResponse) => !isVoided(order);

export interface CashierKpis {
  totalSales: number;
  totalTransactions: number;
  averageTransactionValue: number;
  itemsSold: number;
  voidedAmount: number;
  voidedCount: number;
  totalDiscountAmount: number;
  discountedTransactionCount: number;
  netSales: number;
}

export const computeKpis = (orders: CashierOrderResponse[]): CashierKpis => {
  const completed = orders.filter(isCompleted);
  const voided = orders.filter(isVoided);

  const totalSales = completed.reduce((sum, o) => sum + o.totalAmount, 0);
  const itemsSold = completed.reduce(
    (sum, o) => sum + (o.lines ?? []).reduce((lineSum, l) => lineSum + l.quantity, 0),
    0
  );
  const totalDiscountAmount = completed.reduce((sum, o) => sum + o.discountAmount, 0);
  const discountedTransactionCount = completed.filter((o) => o.discountAmount > 0).length;
  const voidedAmount = voided.reduce((sum, o) => sum + o.totalAmount, 0);

  return {
    totalSales,
    totalTransactions: completed.length,
    averageTransactionValue: completed.length > 0 ? totalSales / completed.length : 0,
    itemsSold,
    voidedAmount,
    voidedCount: voided.length,
    totalDiscountAmount,
    discountedTransactionCount,
    // Net Sales here = completed sales total. There is no separate refund
    // amount to subtract (void removes the order from sales entirely,
    // it isn't a post-sale deduction) — so Net Sales === totalSales.
    // Kept as its own field rather than reusing totalSales directly so the
    // KPI card's label/meaning stays self-documenting if that ever changes.
    netSales: totalSales,
  };
};

export interface PeriodComparison {
  current: number;
  previous: number | null;
  percentChange: number | null;
}

// Compares a metric across two equal-length adjacent periods, both computed
// from the same real order list — never a fabricated trend field.
export const comparePeriods = (
  orders: CashierOrderResponse[],
  currentRange: DateRange,
  metric: (kpis: CashierKpis) => number
): PeriodComparison => {
  const spanMs = currentRange.to.getTime() - currentRange.from.getTime();
  const previousRange: DateRange = {
    from: new Date(currentRange.from.getTime() - spanMs),
    to: new Date(currentRange.from.getTime()),
  };

  const current = metric(computeKpis(filterOrdersByRange(orders, currentRange)));
  const previousOrders = filterOrdersByRange(orders, previousRange);

  if (previousOrders.length === 0) {
    return { current, previous: null, percentChange: null };
  }

  const previous = metric(computeKpis(previousOrders));
  const percentChange = previous === 0 ? null : ((current - previous) / previous) * 100;

  return { current, previous, percentChange };
};

export interface SalesTrendPoint {
  label: string;
  netSales: number;
  transactions: number;
}

// Buckets by hour when the range is a single day, otherwise by calendar day.
// This is a frontend bucketing choice (no backend trend endpoint exists),
// flagged so it isn't mistaken for a confirmed API shape.
export const computeSalesTrend = (
  orders: CashierOrderResponse[],
  range: DateRange
): SalesTrendPoint[] => {
  const completed = orders.filter(isCompleted);
  const isSingleDay = range.to.getTime() - range.from.getTime() <= 24 * 60 * 60 * 1000;

  const buckets = new Map<string, SalesTrendPoint>();

  for (const order of completed) {
    const date = new Date(order.orderDate);
    const key = isSingleDay
      ? `${String(date.getHours()).padStart(2, "0")}:00`
      : date.toISOString().slice(0, 10);

    const existing = buckets.get(key) ?? { label: key, netSales: 0, transactions: 0 };
    existing.netSales += order.totalAmount;
    existing.transactions += 1;
    buckets.set(key, existing);
  }

  return Array.from(buckets.values()).sort((a, b) => (a.label > b.label ? 1 : -1));
};

export interface HourlyPoint {
  hour: string;
  transactions: number;
  amount: number;
}

export const computeSalesByHour = (orders: CashierOrderResponse[]): HourlyPoint[] => {
  const completed = orders.filter(isCompleted);
  const hours: HourlyPoint[] = Array.from({ length: 24 }, (_, h) => ({
    hour: `${String(h).padStart(2, "0")}:00`,
    transactions: 0,
    amount: 0,
  }));

  for (const order of completed) {
    const h = new Date(order.orderDate).getHours();
    hours[h].transactions += 1;
    hours[h].amount += order.totalAmount;
  }

  return hours;
};

export interface PaymentMethodBreakdown {
  method: string;
  amount: number;
  transactionCount: number;
  percentage: number;
}

// Only shows methods actually present in real payments[] data — never the
// provisional CASHIER_PAYMENT_METHODS config list, so a method that was
// never actually used never appears here.
export const computePaymentMethodBreakdown = (
  orders: CashierOrderResponse[]
): PaymentMethodBreakdown[] => {
  const completed = orders.filter(isCompleted);
  const totals = new Map<string, { amount: number; count: number }>();

  for (const order of completed) {
    for (const payment of order.payments ?? []) {
      const method = payment.method ?? "Unspecified";
      const existing = totals.get(method) ?? { amount: 0, count: 0 };
      existing.amount += payment.amount;
      existing.count += 1;
      totals.set(method, existing);
    }
  }

  const grandTotal = Array.from(totals.values()).reduce((sum, v) => sum + v.amount, 0);

  return Array.from(totals.entries())
    .map(([method, v]) => ({
      method,
      amount: v.amount,
      transactionCount: v.count,
      percentage: grandTotal > 0 ? (v.amount / grandTotal) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
};

export interface TopProductRow {
  productId: string;
  productName: string;
  productSku: string | null;
  quantitySold: number;
  salesAmount: number;
  percentage: number;
}

export const computeTopProducts = (
  orders: CashierOrderResponse[],
  limit = 10
): TopProductRow[] => {
  const completed = orders.filter(isCompleted);
  const totals = new Map<
    string,
    { name: string; sku: string | null; quantity: number; amount: number }
  >();

  for (const order of completed) {
    for (const line of order.lines ?? []) {
      const existing = totals.get(line.productId) ?? {
        name: line.productName ?? "—",
        sku: line.productSku,
        quantity: 0,
        amount: 0,
      };
      existing.quantity += line.quantity;
      existing.amount += line.lineTotal;
      totals.set(line.productId, existing);
    }
  }

  const grandTotal = Array.from(totals.values()).reduce((sum, v) => sum + v.amount, 0);

  return Array.from(totals.entries())
    .map(([productId, v]) => ({
      productId,
      productName: v.name,
      productSku: v.sku,
      quantitySold: v.quantity,
      salesAmount: v.amount,
      percentage: grandTotal > 0 ? (v.amount / grandTotal) * 100 : 0,
    }))
    .sort((a, b) => b.salesAmount - a.salesAmount)
    .slice(0, limit);
};

export interface CategorySalesRow {
  categoryId: string;
  categoryName: string;
  quantitySold: number;
  revenue: number;
}

// Requires cross-referencing order lines (productId) → Products (categoryId)
// → Categories (name). All three modules are real/confirmed; nothing here
// is invented, but it does mean this section silently returns [] if the
// products/categories lists haven't loaded yet — callers should gate on
// their own loading state too.
export const computeCategorySales = (
  orders: CashierOrderResponse[],
  products: Product[],
  categories: Category[]
): CategorySalesRow[] => {
  const completed = orders.filter(isCompleted);
  const productToCategory = new Map(products.map((p) => [p.id, p.categoryId]));
  const categoryNames = new Map(categories.map((c) => [c.id, c.name]));

  const totals = new Map<string, { quantity: number; revenue: number }>();

  for (const order of completed) {
    for (const line of order.lines ?? []) {
      const categoryId = productToCategory.get(line.productId);
      if (!categoryId) continue; // product not found/uncategorized — excluded, not guessed
      const existing = totals.get(categoryId) ?? { quantity: 0, revenue: 0 };
      existing.quantity += line.quantity;
      existing.revenue += line.lineTotal;
      totals.set(categoryId, existing);
    }
  }

  return Array.from(totals.entries())
    .map(([categoryId, v]) => ({
      categoryId,
      categoryName: categoryNames.get(categoryId) ?? "—",
      quantitySold: v.quantity,
      revenue: v.revenue,
    }))
    .sort((a, b) => b.revenue - a.revenue);
};

export interface DiscountTrendPoint {
  label: string;
  discountAmount: number;
}

export const computeDiscountsOverTime = (
  orders: CashierOrderResponse[],
  range: DateRange
): DiscountTrendPoint[] => {
  const completed = orders.filter(isCompleted).filter((o) => o.discountAmount > 0);
  const isSingleDay = range.to.getTime() - range.from.getTime() <= 24 * 60 * 60 * 1000;
  const buckets = new Map<string, number>();

  for (const order of completed) {
    const date = new Date(order.orderDate);
    const key = isSingleDay
      ? `${String(date.getHours()).padStart(2, "0")}:00`
      : date.toISOString().slice(0, 10);
    buckets.set(key, (buckets.get(key) ?? 0) + order.discountAmount);
  }

  return Array.from(buckets.entries())
    .map(([label, discountAmount]) => ({ label, discountAmount }))
    .sort((a, b) => (a.label > b.label ? 1 : -1));
};

export interface VoidedOrdersStats {
  voidedAmount: number;
  voidedCount: number;
  voidRate: number | null; // % of all orders (completed + voided) that were voided
  mostVoidedProducts: TopProductRow[];
}

export const computeVoidedOrdersStats = (orders: CashierOrderResponse[]): VoidedOrdersStats => {
  const voided = orders.filter(isVoided);
  const total = orders.length;

  return {
    voidedAmount: voided.reduce((sum, o) => sum + o.totalAmount, 0),
    voidedCount: voided.length,
    voidRate: total > 0 ? (voided.length / total) * 100 : null,
    mostVoidedProducts: computeTopProducts(
      // reuse computeTopProducts' shape by temporarily treating voided
      // orders as the "completed" set — a light abuse of the helper, kept
      // local and explicit rather than duplicating the aggregation logic.
      voided.map((o) => ({ ...o, status: null })),
      5
    ),
  };
};

export interface CustomerBreakdown {
  totalServed: number;
  registeredCount: number;
  walkInCount: number;
}

export const computeCustomerBreakdown = (orders: CashierOrderResponse[]): CustomerBreakdown => {
  const completed = orders.filter(isCompleted);
  const registeredCount = completed.filter((o) => o.customerId).length;
  const walkInCount = completed.filter((o) => !o.customerId).length;
  return { totalServed: completed.length, registeredCount, walkInCount };
};

export interface TopCustomerRow {
  customerId: string;
  transactionCount: number;
  totalSpent: number;
  averageTransactionValue: number;
}

// Only customerId is available on the order response (no customerName) —
// callers resolve display names against the existing Customers lookup.
export const computeTopCustomers = (orders: CashierOrderResponse[], limit = 10): TopCustomerRow[] => {
  const completed = orders.filter(isCompleted).filter((o) => o.customerId);
  const totals = new Map<string, { count: number; total: number }>();

  for (const order of completed) {
    const id = order.customerId as string;
    const existing = totals.get(id) ?? { count: 0, total: 0 };
    existing.count += 1;
    existing.total += order.totalAmount;
    totals.set(id, existing);
  }

  return Array.from(totals.entries())
    .map(([customerId, v]) => ({
      customerId,
      transactionCount: v.count,
      totalSpent: v.total,
      averageTransactionValue: v.total / v.count,
    }))
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, limit);
};
