// src/components/admin/accounts/AccountsKpiRow.tsx
//
// Total / Active / Inactive / Root / Child are always shown — all real,
// derived from the loaded list. Per-type cards are NOT hardcoded to
// Assets/Liabilities/Revenue/Expenses/Equity — accountType is a free-form
// string with no confirmed enum, so this renders one card per distinct
// type value actually present in the data, capped to the top N by
// frequency (the rest are still reachable via the type filter, just not
// given a KPI card each) to avoid the row growing unbounded if a real
// Chart of Accounts uses many type strings.

import { useTranslation } from "react-i18next";
import { Landmark, CheckCircle2, XCircle, GitBranch, Layers } from "lucide-react";

export interface TypeCount {
  accountType: string;
  count: number;
}

export interface AccountsKpiRowProps {
  total: number;
  active: number;
  inactive: number;
  root: number;
  child: number;
  /** Distinct accountType values present in the loaded data, with counts — already sorted by frequency. */
  typeCounts: TypeCount[];
  /** How many per-type cards to show before folding the rest into the filter panel only. */
  maxTypeCards?: number;
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
        <p className="truncate text-xl font-semibold text-[var(--ink-primary)]">{value}</p>
        <p className="truncate text-xs text-[var(--ink-tertiary)]">{label}</p>
      </div>
    </div>
  );
}

export function AccountsKpiRow({
  total,
  active,
  inactive,
  root,
  child,
  typeCounts,
  maxTypeCards = 4,
}: AccountsKpiRowProps) {
  const { t } = useTranslation();
  const visibleTypeCounts = typeCounts.slice(0, maxTypeCards);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      <KpiCard icon={<Landmark size={18} />} label={t("accounts.kpi.total")} value={total} />
      <KpiCard icon={<CheckCircle2 size={18} />} label={t("accounts.kpi.active")} value={active} />
      <KpiCard icon={<XCircle size={18} />} label={t("accounts.kpi.inactive")} value={inactive} />
      <KpiCard icon={<GitBranch size={18} />} label={t("accounts.kpi.root")} value={root} />
      <KpiCard icon={<Layers size={18} />} label={t("accounts.kpi.child")} value={child} />
      {visibleTypeCounts.map((tc) => (
        <KpiCard
          key={tc.accountType}
          icon={<Landmark size={18} />}
          label={tc.accountType}
          value={tc.count}
        />
      ))}
    </div>
  );
}
