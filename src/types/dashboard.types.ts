export interface DashboardKpi {
  id: string;
  label: string;
  value: string;
  deltaLabel?: string;
  deltaDirection?: "up" | "down" | "flat";
}

export interface OverviewSeriesPoint {
  label: string;
  value: number;
}

export interface OverviewChartData {
  title: string;
  summary: string;
  data: OverviewSeriesPoint[];
  viewAllHref: string;
}

export interface InventorySeriesPoint {
  label: string;
  stockLevel: number;
  reorderThreshold: number;
}

export interface InventoryChartData {
  title: string;
  summary: string;
  data: InventorySeriesPoint[];
  viewAllHref: string;
}

export interface FinanceSeriesPoint {
  label: string;
  cost: number;
  marginPct: number;
}

export interface FinanceChartData {
  title: string;
  summary: string;
  data: FinanceSeriesPoint[];
  viewAllHref: string;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  dateLabel: string;
}

export type SystemStatus = "operational" | "degraded" | "down";

export interface SystemHealthItem {
  id: string;
  name: string;
  status: SystemStatus;
}

export interface CalendarEventDay {
  date: number; // day of month
  events: string[];
}
