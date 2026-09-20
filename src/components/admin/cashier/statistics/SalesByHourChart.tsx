// src/components/admin/cashier/statistics/SalesByHourChart.tsx

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
import type { HourlyPoint } from "../../../../utils/cashierStatistics.derive";

interface SalesByHourChartProps {
  data: HourlyPoint[];
  isLoading: boolean;
}

export const SalesByHourChart = ({
  data,
  isLoading,
}: SalesByHourChartProps) => {
  const { t } = useTranslation();

  const hasData = data.some((point) => point.transactions > 0);

  return (
    <div className="rounded-lg border border-[var(--hairline)] bg-[var(--panel)] p-4">
      <h3 className="mb-3 text-sm font-semibold text-[var(--ink-primary)]">
        {t("cashierStats.charts.salesByHour")}
      </h3>

      {isLoading ? (
        <div className="h-56 animate-pulse rounded-md bg-[var(--sunken)]" />
      ) : !hasData ? (
        <div className="flex h-56 items-center justify-center text-sm text-[var(--ink-tertiary)]">
          {t("cashierStats.noDataForPeriod")}
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart
            data={data}
            margin={{
              top: 8,
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
              dataKey="hour"
              tick={{
                fontSize: 11,
                fill: "var(--ink-tertiary)",
              }}
              axisLine={false}
              tickLine={false}
              interval={2}
            />

            <YAxis
              direction={"ltr"}
              tick={{
                fontSize: 12,
                fill: "var(--ink-tertiary)",
              }}
              axisLine={false}
              tickLine={false}
              width={40}
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
                    ? numericValue
                    : 0,
                  t("cashierStats.kpi.totalTransactions"),
                ];
              }}
            />

            <Bar
              dataKey="transactions"
              fill="var(--signal)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};