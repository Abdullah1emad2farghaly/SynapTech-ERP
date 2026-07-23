import { KPICard } from "@/components/admin/hr/KPICard";
import type { DashboardKpi } from "@/types/dashboard.types";

// Reuses the KPICard already built for the HR Dashboard — one component,
// every KPI row app-wide, rather than a second bespoke card here.
export function KpiRow({ kpis }: { kpis: DashboardKpi[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <KPICard key={kpi.id} {...kpi} />
      ))}
    </div>
  );
}
