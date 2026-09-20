// Intended project path: src/components/admin/cashier/statistics/CustomerAnalyticsPanel.tsx
import { useTranslation } from "react-i18next";
import type { CustomerBreakdown, TopCustomerRow } from "../../../../utils/cashierStatistics.derive";
import { useCustomers } from "../../../../hooks/useCustomers"; // existing, confirmed Customers module hook

interface CustomerAnalyticsPanelProps {
  breakdown: CustomerBreakdown;
  topCustomers: TopCustomerRow[];
  isLoading: boolean;
}

// Order responses only carry customerId (no name) — names are resolved
// here against the real Customers list, same cross-reference pattern used
// for category sales (products → categories).
export const CustomerAnalyticsPanel = ({
  breakdown,
  topCustomers,
  isLoading,
}: CustomerAnalyticsPanelProps) => {
  const { t } = useTranslation();
  const { data: customers = [] } = useCustomers();
  const nameById = new Map(customers.map((c) => [c.id, c.name]));

  return (
    <div className="rounded-lg border border-[var(--hairline)] bg-[var(--panel)] p-4">
      <h3 className="mb-3 text-sm font-semibold text-[var(--ink-primary)]">
        {t("cashierStats.charts.customers")}
      </h3>

      {isLoading ? (
        <div className="h-56 animate-pulse rounded-md bg-[var(--sunken)]" />
      ) : (
        <>
          <div className="mb-4 grid grid-cols-3 gap-3">
            <div>
              <p className="text-xs text-[var(--ink-tertiary)]">{t("cashierStats.customers.served")}</p>
              <p className="text-base font-semibold tabular-nums text-[var(--ink-primary)]">
                {breakdown.totalServed}
              </p>
            </div>
            <div>
              <p className="text-xs text-[var(--ink-tertiary)]">{t("cashierStats.customers.registered")}</p>
              <p className="text-base font-semibold tabular-nums text-[var(--ink-primary)]">
                {breakdown.registeredCount}
              </p>
            </div>
            <div>
              <p className="text-xs text-[var(--ink-tertiary)]">{t("cashierStats.customers.walkIn")}</p>
              <p className="text-base font-semibold tabular-nums text-[var(--ink-primary)]">
                {breakdown.walkInCount}
              </p>
            </div>
          </div>

          {topCustomers.length === 0 ? (
            <p className="text-sm text-[var(--ink-tertiary)]">{t("cashierStats.noDataForPeriod")}</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-xs text-[var(--ink-tertiary)]">
                <tr>
                  <th className="py-1 text-start font-medium">{t("cashierStats.customers.topCustomers")}</th>
                  <th className="py-1 text-end font-medium">{t("cashier.orders.total").replace(":", "")}</th>
                  <th className="py-1 text-end font-medium">{t("cashierStats.customers.transactions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--hairline)]">
                {topCustomers.map((c) => (
                  <tr key={c.customerId}>
                    <td className="py-1.5 text-[var(--ink-primary)]">
                      {nameById.get(c.customerId) ?? c.customerId}
                    </td>
                    <td className="py-1.5 text-end font-medium tabular-nums">{c.totalSpent.toFixed(2)}</td>
                    <td className="py-1.5 text-end tabular-nums text-[var(--ink-tertiary)]">
                      {c.transactionCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
};
