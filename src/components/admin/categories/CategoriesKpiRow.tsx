// src/components/admin/categories/CategoriesKpiRow.tsx
//
// Five real cards (Total / Root / Child / Active / Inactive), all
// derived from the already-loaded category list — no separate endpoint,
// same pattern as every prior module's KPI row.

import { useTranslation } from "react-i18next";
import { FolderTree, GitBranch, Layers, CheckCircle2, XCircle } from "lucide-react";

export interface CategoriesKpiRowProps {
  total: number;
  root: number;
  child: number;
  active: number;
  inactive: number;
}

function KpiCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
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

export function CategoriesKpiRow({ total, root, child, active, inactive }: CategoriesKpiRowProps) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      <KpiCard icon={<FolderTree size={18} />} label={t("categories.kpi.total")} value={total} />
      <KpiCard icon={<GitBranch size={18} />} label={t("categories.kpi.root")} value={root} />
      <KpiCard icon={<Layers size={18} />} label={t("categories.kpi.child")} value={child} />
      <KpiCard icon={<CheckCircle2 size={18} />} label={t("categories.kpi.active")} value={active} />
      <KpiCard icon={<XCircle size={18} />} label={t("categories.kpi.inactive")} value={inactive} />
    </div>
  );
}
