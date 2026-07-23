import { Plus, PlayCircle, Send, FileText } from "lucide-react";
import { KpiRow } from "@/components/admin/dashboard/KpiRow";
import { RevenueAreaChart } from "@/components/admin/dashboard/RevenueAreaChart";
import { SalesBarChart } from "@/components/admin/dashboard/SalesBarChart";
import { InventoryLineChart } from "@/components/admin/dashboard/InventoryLineChart";
import { FinanceComposedChart } from "@/components/admin/dashboard/FinanceComposedChart";
import { EmployeeSummaryCard } from "@/components/admin/dashboard/EmployeeSummaryCard";
import { PendingApprovalsCard } from "@/components/admin/dashboard/PendingApprovalsCard";
import { CalendarWidget } from "@/components/admin/dashboard/CalendarWidget";
import { RecentActivitiesCard } from "@/components/admin/dashboard/RecentActivitiesCard";
import { AnnouncementsCard } from "@/components/admin/dashboard/AnnouncementsCard";
import { SystemHealthCard } from "@/components/admin/dashboard/SystemHealthCard";
import { QuickActionsRow } from "@/components/admin/dashboard/QuickActionsRow";
import {
  mockDashboardKpis,
  mockRevenueOverview,
  mockSalesOverview,
  mockInventoryOverview,
  mockFinanceOverview,
  mockAnnouncements,
  mockSystemHealth,
  mockCalendarEvents,
} from "@/utils/mockDashboardData";
import { mockApprovals, mockActivity } from "@/utils/mockHrData";

// The application root screen — everything a returning user should see
// without scrolling (KPI row + four Overview charts) comes first; the
// lower "read when you have a few more minutes" tier follows.
export default function DashboardHomePage() {
  const approvalRows = mockApprovals.map((a) => ({
    id: a.id,
    title: a.title,
    requester: a.requester,
    ageLabel: a.ageLabel,
  }));

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-primary">Dashboard</h1>
          <p className="text-[0.9375rem] text-ink-secondary">
            How the business is doing right now.
          </p>
        </div>
        <QuickActionsRow
          actions={[
            { id: "add-employee", label: "Add Employee", icon: Plus, onClick: () => {} },
            { id: "run-payroll", label: "Run Payroll", icon: PlayCircle, onClick: () => {} },
            { id: "request-leave", label: "Request Leave", icon: Send, onClick: () => {} },
            { id: "create-report", label: "Create Report", icon: FileText, onClick: () => {} },
          ]}
        />
      </div>

      <KpiRow kpis={mockDashboardKpis} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RevenueAreaChart {...mockRevenueOverview} />
        <SalesBarChart {...mockSalesOverview} />
        <InventoryLineChart {...mockInventoryOverview} />
        <FinanceComposedChart {...mockFinanceOverview} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <EmployeeSummaryCard
          hrDashboardHref="/hr"
          stats={[
            { label: "Headcount", value: "91" },
            { label: "New hires (mo.)", value: "4" },
            { label: "Open positions", value: "7" },
            { label: "Attrition rate", value: "6.2%" },
          ]}
        />
        <PendingApprovalsCard items={approvalRows} />
        <CalendarWidget
          monthLabel="July 2026"
          daysInMonth={31}
          startWeekday={3}
          todayDate={22}
          events={mockCalendarEvents}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <RecentActivitiesCard entries={mockActivity} />
        <AnnouncementsCard announcements={mockAnnouncements} />
        <SystemHealthCard items={mockSystemHealth} />
      </div>
    </div>
  );
}
