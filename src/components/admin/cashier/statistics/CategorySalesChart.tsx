// src/components/admin/cashier/statistics/CategorySalesChart.tsx

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
import type { CategorySalesRow } from "../../../../utils/cashierStatistics.derive";

interface CategorySalesChartProps {
  data: CategorySalesRow[];
  isLoading: boolean;
}

export const CategorySalesChart = ({
  data,
  isLoading,
}: CategorySalesChartProps) => {
  const { t } = useTranslation();

  return (
    <div className="rounded-lg border border-[var(--hairline)] bg-[var(--panel)] p-4">
      <h3 className="mb-3 text-sm font-semibold text-[var(--ink-primary)]">
        {t("cashierStats.charts.salesByCategory")}
      </h3>

      {isLoading ? (
        <div className="h-64 animate-pulse rounded-md bg-[var(--sunken)]" />
      ) : data.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-sm text-[var(--ink-tertiary)]">
          {t("cashierStats.noDataForPeriod")}
        </div>
      ) : (
        <ResponsiveContainer
          width="100%"
          height={Math.max(200, data.length * 32)}
        >
          <BarChart
            data={data}
            layout="vertical"
            margin={{
              top: 4,
              right: 16,
              left: 8,
              bottom: 4,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--hairline)"
              horizontal={false}
            />

            <XAxis
              type="number"
              tick={{
                fontSize: 11,
                fill: "var(--ink-tertiary)",
              }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              type="category"
              dataKey="categoryName"
              tick={{
                fontSize: 12,
                fill: "var(--ink-primary)",
              }}
              axisLine={false}
              tickLine={false}
              width={120}
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
                  t("cashierStats.charts.revenue"),
                ];
              }}
            />

            <Bar
              dataKey="revenue"
              fill="var(--synapse)"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};