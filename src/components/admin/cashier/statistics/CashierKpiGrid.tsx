// Intended project path: src/components/admin/cashier/statistics/CashierKpiGrid.tsx
import { useTranslation } from "react-i18next";
import { ArrowDown, ArrowUp } from "lucide-react";
import type { CashierKpis, PeriodComparison } from "../../../../utils/cashierStatistics.derive";

interface CashierKpiGridProps {
  kpis: CashierKpis;
  salesComparison: PeriodComparison;
  transactionsComparison: PeriodComparison;
  isLoading: boolean;
}

// Trend arrows only render when percentChange is a real, computed number —
// comparePeriods() returns null when there's no prior-period data to
// compare against, and null is rendered as "no comparison", never as 0%
// or hidden silently as if nothing changed.
export const CashierKpiGrid = ({
  kpis,
  salesComparison,
  transactionsComparison,
  isLoading,
}: CashierKpiGridProps) => {
  const { t } = useTranslation();

  const Trend = ({ comparison }: { comparison: PeriodComparison }) => {
    if (comparison.percentChange == null) return null;
    const up = comparison.percentChange >= 0;
    return (
      <span
        className={`inline-flex items-center gap-0.5 text-xs font-medium ${
          up ? "text-[var(--success)]" : "text-[var(--error)]"
        }`}
      >
        {up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
        {Math.abs(comparison.percentChange).toFixed(1)}%
      </span>
    );
  };

  const cards = [
    {
      label: t("cashierStats.kpi.totalSales"),
      value: kpis.totalSales.toFixed(2),
      trend: <Trend comparison={salesComparison} />,
    },
    {
      label: t("cashierStats.kpi.totalTransactions"),
      value: String(kpis.totalTransactions),
      trend: <Trend comparison={transactionsComparison} />,
    },
    {
      label: t("cashierStats.kpi.averageTransactionValue"),
      value: kpis.averageTransactionValue.toFixed(2),
    },
    {
      label: t("cashierStats.kpi.itemsSold"),
      value: String(kpis.itemsSold),
    },
    {
      label: t("cashierStats.kpi.voided"),
      value: `${kpis.voidedAmount.toFixed(2)} (${kpis.voidedCount})`,
    },
    {
      label: t("cashierStats.kpi.discounts"),
      value: `${kpis.totalDiscountAmount.toFixed(2)} (${kpis.discountedTransactionCount})`,
    },
    {
      label: t("cashierStats.kpi.netSales"),
      value: kpis.netSales.toFixed(2),
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-lg bg-[var(--sunken)]" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-lg border border-[var(--hairline)] bg-[var(--panel)] p-4"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs text-[var(--ink-tertiary)]">{card.label}</p>
            {card.trend}
          </div>
          <p className="mt-1 text-lg font-semibold tabular-nums text-[var(--ink-primary)]">
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
};
