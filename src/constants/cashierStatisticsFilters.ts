// Intended project path: src/constants/cashierStatisticsFilters.ts
//
// GET /api/cashier/orders has no documented date/filter params, so every
// preset below just computes a client-side Date range applied to the
// already-fetched full order list — nothing is sent to the API.
import type { DateRange } from "../utils/cashierStatistics.derive";

export type CashierStatsDatePreset =
  | "today"
  | "yesterday"
  | "thisWeek"
  | "lastWeek"
  | "thisMonth"
  | "lastMonth"
  | "thisYear"
  | "custom";

const startOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};
const endOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
};
const startOfWeek = (d: Date) => {
  const x = startOfDay(d);
  const day = x.getDay();
  x.setDate(x.getDate() - day);
  return x;
};

export const resolveDatePreset = (preset: CashierStatsDatePreset, custom?: DateRange): DateRange => {
  const now = new Date();

  switch (preset) {
    case "today":
      return { from: startOfDay(now), to: endOfDay(now) };
    case "yesterday": {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      return { from: startOfDay(y), to: endOfDay(y) };
    }
    case "thisWeek":
      return { from: startOfWeek(now), to: endOfDay(now) };
    case "lastWeek": {
      const start = startOfWeek(now);
      start.setDate(start.getDate() - 7);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      return { from: start, to: endOfDay(end) };
    }
    case "thisMonth":
      return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: endOfDay(now) };
    case "lastMonth": {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return { from: start, to: endOfDay(end) };
    }
    case "thisYear":
      return { from: new Date(now.getFullYear(), 0, 1), to: endOfDay(now) };
    case "custom":
      return custom ?? { from: startOfDay(now), to: endOfDay(now) };
    default:
      return { from: startOfDay(now), to: endOfDay(now) };
  }
};

export const CASHIER_STATS_DATE_PRESETS: { value: CashierStatsDatePreset; labelKey: string }[] = [
  { value: "today", labelKey: "cashierStats.filters.today" },
  { value: "yesterday", labelKey: "cashierStats.filters.yesterday" },
  { value: "thisWeek", labelKey: "cashierStats.filters.thisWeek" },
  { value: "lastWeek", labelKey: "cashierStats.filters.lastWeek" },
  { value: "thisMonth", labelKey: "cashierStats.filters.thisMonth" },
  { value: "lastMonth", labelKey: "cashierStats.filters.lastMonth" },
  { value: "thisYear", labelKey: "cashierStats.filters.thisYear" },
  { value: "custom", labelKey: "cashierStats.filters.customRange" },
];
