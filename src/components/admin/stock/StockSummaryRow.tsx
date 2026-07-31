// src/components/admin/stock/StockSummaryRow.tsx
//
// Three cards only, all real, all computed from the composed rows
// useStockOverview already produced — no separate request. Deliberately
// NO "Low Stock" or "Needs Reorder" card, despite being a common ERP
// pattern — there's no reorder-level field anywhere in the confirmed
// data, so a threshold-based card here would be inventing a concept the
// backend doesn't have.

import { useTranslation } from "react-i18next";
import { Package, Warehouse, Boxes } from "lucide-react";

export interface StockSummaryRowProps {
  totalProducts: number;
  totalWarehouses: number;
  totalUnitsOnHand: number;
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

export function StockSummaryRow({
  totalProducts,
  totalWarehouses,
  totalUnitsOnHand,
}: StockSummaryRowProps) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <KpiCard icon={<Package size={18} />} label={t("stock.kpi.totalProducts")} value={totalProducts} />
      <KpiCard
        icon={<Warehouse size={18} />}
        label={t("stock.kpi.totalWarehouses")}
        value={totalWarehouses}
      />
      <KpiCard
        icon={<Boxes size={18} />}
        label={t("stock.kpi.totalUnitsOnHand")}
        value={totalUnitsOnHand}
      />
    </div>
  );
}
