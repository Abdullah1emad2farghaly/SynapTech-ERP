// src/components/admin/cashier/statistics/PaymentMethodsChart.tsx

import { useTranslation } from "react-i18next";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { PaymentMethodBreakdown } from "../../../../utils/cashierStatistics.derive";

interface PaymentMethodsChartProps {
  data: PaymentMethodBreakdown[];
  isLoading: boolean;
}

// Small fixed palette because payment methods are expected to remain limited.
const COLORS = [
  "var(--signal)",
  "var(--synapse)",
  "var(--success)",
  "var(--warning)",
  "var(--ink-tertiary)",
];

export const PaymentMethodsChart = ({
  data,
  isLoading,
}: PaymentMethodsChartProps) => {
  const { t } = useTranslation();

  return (
    <div className="rounded-lg border border-[var(--hairline)] bg-[var(--panel)] p-4">
      <h3 className="mb-3 text-sm font-semibold text-[var(--ink-primary)]">
        {t("cashierStats.charts.paymentMethods")}
      </h3>

      {isLoading ? (
        <div className="h-56 animate-pulse rounded-md bg-[var(--sunken)]" />
      ) : data.length === 0 ? (
        <div className="flex h-56 items-center justify-center text-sm text-[var(--ink-tertiary)]">
          {t("cashierStats.noDataForPeriod")}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <ResponsiveContainer
            width="100%"
            height={200}
            className="sm:max-w-[200px]"
          >
            <PieChart>
              <Pie
                data={data}
                dataKey="amount"
                nameKey="method"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={2}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={entry.method}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>

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
                    t("cashierStats.charts.amount"),
                  ];
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          <ul className="flex-1 space-y-2">
            {data.map((entry, index) => (
              <li
                key={entry.method}
                className="flex items-center justify-between text-sm"
              >
                <span className="flex items-center gap-2 text-[var(--ink-secondary)]">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{
                      backgroundColor:
                        COLORS[index % COLORS.length],
                    }}
                  />

                  {entry.method}
                </span>

                <span className="tabular-nums text-[var(--ink-primary)]">
                  {entry.amount.toFixed(2)} ({entry.percentage.toFixed(0)}%)
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};