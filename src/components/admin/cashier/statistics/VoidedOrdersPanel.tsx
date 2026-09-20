// Intended project path: src/components/admin/cashier/statistics/VoidedOrdersPanel.tsx
import { useTranslation } from "react-i18next";
import { TriangleAlert } from "lucide-react";
import type { VoidedOrdersStats } from "../../../../utils/cashierStatistics.derive";

interface VoidedOrdersPanelProps {
  stats: VoidedOrdersStats;
  isLoading: boolean;
}

// This is deliberately titled "Voided Orders", not "Returns" — the Cashier
// API contract has no refund/return concept at all, only Void (see Module
// 12 build notes). Relabeling Void as "Returns" would misrepresent what
// actually happened to the transaction, so this stays honest to the data.
export const VoidedOrdersPanel = ({ stats, isLoading }: VoidedOrdersPanelProps) => {
  const { t } = useTranslation();

  return (
    <div className="rounded-lg border border-[var(--hairline)] bg-[var(--panel)] p-4">
      <h3 className="mb-3 text-sm font-semibold text-[var(--ink-primary)]">
        {t("cashierStats.charts.voidedOrders")}
      </h3>

      {isLoading ? (
        <div className="h-40 animate-pulse rounded-md bg-[var(--sunken)]" />
      ) : (
        <>
          <div className="mb-4 grid grid-cols-3 gap-3">
            <div>
              <p className="text-xs text-[var(--ink-tertiary)]">{t("cashierStats.voided.amount")}</p>
              <p className="text-base font-semibold tabular-nums text-[var(--error)]">
                {stats.voidedAmount.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-xs text-[var(--ink-tertiary)]">{t("cashierStats.voided.count")}</p>
              <p className="text-base font-semibold tabular-nums text-[var(--ink-primary)]">
                {stats.voidedCount}
              </p>
            </div>
            <div>
              <p className="text-xs text-[var(--ink-tertiary)]">{t("cashierStats.voided.rate")}</p>
              <p className="text-base font-semibold tabular-nums text-[var(--ink-primary)]">
                {stats.voidRate != null ? `${stats.voidRate.toFixed(1)}%` : "—"}
              </p>
            </div>
          </div>

          {stats.mostVoidedProducts.length === 0 ? (
            <p className="text-sm text-[var(--ink-tertiary)]">{t("cashierStats.voided.noneInPeriod")}</p>
          ) : (
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-[var(--ink-tertiary)]">
                <TriangleAlert className="h-3.5 w-3.5" />
                {t("cashierStats.voided.mostVoidedProducts")}
              </p>
              <ul className="space-y-1.5">
                {stats.mostVoidedProducts.map((p) => (
                  <li key={p.productId} className="flex items-center justify-between text-sm">
                    <span className="text-[var(--ink-primary)]">{p.productName}</span>
                    <span className="tabular-nums text-[var(--ink-tertiary)]">{p.quantitySold}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
};
