// src/components/admin/departments/DepartmentsKpiRow.tsx
//
// Three real KPI cards plus one optional fourth, all derived from the
// already-loaded department list — no separate endpoint or request.
// "Managers Assigned" and "Recently Created" from the original brief are
// deliberately absent: no managerId or createdDate field exists to
// compute them from. "Root Departments" is offered instead of "Recently
// Created" since it's genuinely derivable and meaningful for a
// hierarchy-centric module the way a recency stat would have been for
// Users.

import { useTranslation } from "react-i18next";
import { Building2, CheckCircle2, XCircle, GitBranch } from "lucide-react";

export interface DepartmentsKpiRowProps {
  total: number;
  active: number;
  inactive: number;
  root: number;
  /** Hide the Root Departments card entirely if it isn't wanted. */
  showRoot?: boolean;
}

interface KpiCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
}

function KpiCard({ icon, label, value }: KpiCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-[16px] border border-[var(--hairline)] bg-[var(--panel)] p-4 transition-shadow duration-150 hover:shadow-[var(--elevation-1)]">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[var(--sunken)] text-[var(--signal)]">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xl font-semibold text-[var(--ink-primary)]">{value}</p>
        <p className="truncate text-xs text-[var(--ink-tertiary)]">{label}</p>
      </div>
    </div>
  );
}

export function DepartmentsKpiRow({
  total,
  active,
  inactive,
  root,
  showRoot = true,
}: DepartmentsKpiRowProps) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      <KpiCard icon={<Building2 size={18} />} label={t("departments.kpi.total")} value={total} />
      <KpiCard
        icon={<CheckCircle2 size={18} />}
        label={t("departments.kpi.active")}
        value={active}
      />
      <KpiCard icon={<XCircle size={18} />} label={t("departments.kpi.inactive")} value={inactive} />
      {showRoot && (
        <KpiCard icon={<GitBranch size={18} />} label={t("departments.kpi.root")} value={root} />
      )}
    </div>
  );
}
