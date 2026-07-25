// src/components/admin/branches/BranchesKpiRow.tsx
//
// Four KPI cards, all derived from the already-loaded branch list — no
// separate endpoint. The fourth card shows the current Main Branch's
// name if exactly one branch has isMain: true. If the data actually has
// more than one (the API doesn't confirm exclusivity — see the design
// doc), this deliberately surfaces that as a count + flag rather than
// silently picking one and hiding the discrepancy.

import { useTranslation } from "react-i18next";
import { Building2, CheckCircle2, XCircle, Star } from "lucide-react";

export interface BranchesKpiRowProps {
  total: number;
  active: number;
  inactive: number;
  /** Branches with isMain: true. Normally exactly one. */
  mainBranches: { id: string; name: string }[];
}

interface KpiCardProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

function KpiCard({ icon, label, value }: KpiCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-[16px] border border-[var(--hairline)] bg-[var(--panel)] p-4 transition-shadow duration-150 hover:shadow-[var(--elevation-1)]">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[var(--sunken)] text-[var(--signal)]">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="truncate text-xl font-semibold text-[var(--ink-primary)]">{value}</p>
        <p className="truncate text-xs text-[var(--ink-tertiary)]">{label}</p>
      </div>
    </div>
  );
}

export function BranchesKpiRow({ total, active, inactive, mainBranches }: BranchesKpiRowProps) {
  const { t } = useTranslation();

  let mainValue: React.ReactNode;
  if (mainBranches.length === 0) {
    mainValue = "—";
  } else if (mainBranches.length === 1) {
    mainValue = mainBranches[0]!.name;
  } else {
    // More than one branch flagged Main — the API doesn't confirm this
    // can't happen, so surface it honestly instead of silently picking one.
    mainValue = `${mainBranches.length} ⚠︎`;
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      <KpiCard icon={<Building2 size={18} />} label={t("branches.kpi.total")} value={total} />
      <KpiCard icon={<CheckCircle2 size={18} />} label={t("branches.kpi.active")} value={active} />
      <KpiCard icon={<XCircle size={18} />} label={t("branches.kpi.inactive")} value={inactive} />
      <KpiCard icon={<Star size={18} />} label={t("branches.kpi.main")} value={mainValue} />
    </div>
  );
}
