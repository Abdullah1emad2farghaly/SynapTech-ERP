// src/components/admin/cashier/statistics/DiscountsOverviewCard.tsx

import { useTranslation } from "react-i18next";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type {
  CashierKpis,
  DiscountTrendPoint,
} from "../../../../utils/cashierStatistics.derive";

interface DiscountsOverviewCardProps {
  kpis: CashierKpis;
  trend: DiscountTrendPoint[];
  isLoading: boolean;
}

export const DiscountsOverviewCard = ({
  kpis,
  trend,
  isLoading,
}: DiscountsOverviewCardProps) => {
  const { t } = useTranslation();

  const averageDiscount =
    kpis.discountedTransactionCount > 0
      ? kpis.totalDiscountAmount / kpis.discountedTransactionCount
      : 0;

  const discountRate =
    kpis.totalTransactions > 0
      ? (kpis.discountedTransactionCount / kpis.totalTransactions) * 100
      : 0;

  return (
    <div className="rounded-lg border border-[var(--hairline)] bg-[var(--panel)] p-4">
      <h3 className="mb-3 text-sm font-semibold text-[var(--ink-primary)]">
        {t("cashierStats.charts.discounts")}
      </h3>

      {isLoading ? (
        <div className="h-56 animate-pulse rounded-md bg-[var(--sunken)]" />
      ) : (
        <>
          {/* Discount KPIs */}
          <div className="mb-4 grid grid-cols-3 gap-3">
            <div>
              <p className="text-xs text-[var(--ink-tertiary)]">
                {t("cashierStats.discounts.total")}
              </p>

              <p className="text-base font-semibold tabular-nums text-[var(--ink-primary)]">
                {kpis.totalDiscountAmount.toFixed(2)}
              </p>
            </div>

            <div>
              <p className="text-xs text-[var(--ink-tertiary)]">
                {t("cashierStats.discounts.average")}
              </p>

              <p className="text-base font-semibold tabular-nums text-[var(--ink-primary)]">
                {averageDiscount.toFixed(2)}
              </p>
            </div>

            <div>
              <p className="text-xs text-[var(--ink-tertiary)]">
                {t("cashierStats.discounts.rate")}
              </p>

              <p className="text-base font-semibold tabular-nums text-[var(--ink-primary)]">
                {discountRate.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Discount Trend */}
          {trend.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-sm text-[var(--ink-tertiary)]">
              {t("cashierStats.noDataForPeriod")}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart
                data={trend}
                margin={{
                  top: 4,
                  right: 8,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--hairline)"
                  vertical={false}
                />

                <XAxis
                  dataKey="label"
                  tick={{
                    fontSize: 11,
                    fill: "var(--ink-tertiary)",
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  tick={{
                    fontSize: 11,
                    fill: "var(--ink-tertiary)",
                  }}
                  axisLine={false}
                  tickLine={false}
                  width={36}
                />

                <Tooltip
                  contentStyle={{
                    background: "var(--panel)",
                    border: "1px solid var(--hairline)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(value) => {
                    const numericValue =
                      typeof value === "number"
                        ? value
                        : Number(value);

                    return [
                      Number.isFinite(numericValue)
                        ? numericValue.toFixed(2)
                        : "0.00",
                      t("cashierStats.discounts.total"),
                    ];
                  }}
                />

                <Bar
                  dataKey="discountAmount"
                  fill="var(--warning)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </>
      )}
    </div>
  );
};