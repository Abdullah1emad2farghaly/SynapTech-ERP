// src/components/admin/customers/CustomersKpiRow.tsx
//
// Exactly three cards, all real, per the brief's own explicit caution to
// only generate KPIs derivable from available data. No trend arrows —
// there's no historical/prior-period data point to compare against, so a
// fake up/down indicator would be more misleading than omitting it.

import { useTranslation } from "react-i18next";
import { Users, CheckCircle2, XCircle } from "lucide-react";

export interface CustomersKpiRowProps {
  total: number;
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
        <p className="truncate text-xl font-semibold text-[var(--ink-primary)]">
          {value.toLocaleString()}
        </p>
        <p className="truncate text-xs text-[var(--ink-tertiary)]">{label}</p>
      </div>
    </div>
  );
}

export function CustomersKpiRow({ total, active, inactive }: CustomersKpiRowProps) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <KpiCard icon={<Users size={18} />} label={t("customers.kpi.total")} value={total} />
      <KpiCard icon={<CheckCircle2 size={18} />} label={t("customers.kpi.active")} value={active} />
      <KpiCard icon={<XCircle size={18} />} label={t("customers.kpi.inactive")} value={inactive} />
    </div>
  );
}
