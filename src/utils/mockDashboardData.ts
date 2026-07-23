import type {
  AnnouncementItem,
  CalendarEventDay,
  DashboardKpi,
  OverviewChartData,
  InventoryChartData,
  FinanceChartData,
  SystemHealthItem,
} from "@/types/dashboard.types";

// Static demo data — swap for real fetches in services/api/dashboardApi.ts
// once the backend exists; widgets consume this shape either way.
export const mockDashboardKpis: DashboardKpi[] = [
  { id: "revenue", label: "Revenue (MTD)", value: "$1.24M", deltaLabel: "+8.2%", deltaDirection: "up" },
  { id: "employees", label: "Active Employees", value: "91", deltaLabel: "+4", deltaDirection: "up" },
  { id: "orders", label: "Open Orders", value: "36", deltaLabel: "-3", deltaDirection: "down" },
  { id: "health", label: "System Health", value: "Operational", deltaDirection: "flat" },
];

export const mockRevenueOverview: OverviewChartData = {
  title: "Revenue Overview",
  summary: "Up 8.2% vs. last month",
  viewAllHref: "/finance/analytics/revenue",
  data: [
    { label: "Feb", value: 980 },
    { label: "Mar", value: 1020 },
    { label: "Apr", value: 1105 },
    { label: "May", value: 1080 },
    { label: "Jun", value: 1150 },
    { label: "Jul", value: 1240 },
  ],
};

export const mockSalesOverview: OverviewChartData = {
  title: "Sales Overview",
  summary: "312 deals closed this month",
  viewAllHref: "/sales/analytics",
  data: [
    { label: "Feb", value: 240 },
    { label: "Mar", value: 260 },
    { label: "Apr", value: 255 },
    { label: "May", value: 290 },
    { label: "Jun", value: 300 },
    { label: "Jul", value: 312 },
  ],
};

export const mockInventoryOverview: InventoryChartData = {
  title: "Inventory Overview",
  summary: "94% stock availability, within safe range",
  viewAllHref: "/inventory/analytics",
  data: [
    { label: "Feb", stockLevel: 88, reorderThreshold: 70 },
    { label: "Mar", stockLevel: 90, reorderThreshold: 70 },
    { label: "Apr", stockLevel: 87, reorderThreshold: 70 },
    { label: "May", stockLevel: 91, reorderThreshold: 70 },
    { label: "Jun", stockLevel: 93, reorderThreshold: 70 },
    { label: "Jul", stockLevel: 94, reorderThreshold: 70 },
  ],
};

export const mockFinanceOverview: FinanceChartData = {
  title: "Finance Overview",
  summary: "Net margin holding at 18% as costs grow",
  viewAllHref: "/finance/analytics",
  data: [
    { label: "Feb", cost: 620, marginPct: 16 },
    { label: "Mar", cost: 640, marginPct: 17 },
    { label: "Apr", cost: 655, marginPct: 16.5 },
    { label: "May", cost: 670, marginPct: 17.8 },
    { label: "Jun", cost: 690, marginPct: 18.2 },
    { label: "Jul", cost: 705, marginPct: 18 },
  ],
};

export const mockAnnouncements: AnnouncementItem[] = [
  {
    id: "an1",
    title: "Updated remote work policy",
    excerpt: "Starting next month, hybrid schedules move to a 3-day minimum in-office.",
    author: "People & Culture",
    dateLabel: "Jul 20",
  },
  {
    id: "an2",
    title: "Q3 all-hands next Thursday",
    excerpt: "Join us for the quarterly recap and roadmap preview.",
    author: "Leadership",
    dateLabel: "Jul 18",
  },
];

export const mockSystemHealth: SystemHealthItem[] = [
  { id: "api", name: "Core API", status: "operational" },
  { id: "payroll-sync", name: "Payroll Sync", status: "operational" },
  { id: "email", name: "Email Delivery", status: "degraded" },
  { id: "integrations", name: "Third-party Integrations", status: "operational" },
];

export const mockCalendarEvents: CalendarEventDay[] = [
  { date: 22, events: ["Sara Ibrahim's birthday"] },
  { date: 24, events: ["Payroll due"] },
  { date: 28, events: ["Youssef Khalil — 3yr anniversary"] },
];
