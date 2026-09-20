// Intended project path: src/components/admin/cashier/statistics/SalesTrendChart.tsx
import { useTranslation } from "react-i18next";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SalesTrendPoint } from "../../../../utils/cashierStatistics.derive";

interface SalesTrendChartProps {
  data: SalesTrendPoint[];
  isLoading: boolean;
}

// Uses recharts — the project's one confirmed chart library (Dashboard
// module only, so far). Buckets are hour-of-day for single-day ranges,
// calendar day otherwise — see cashierStatistics.derive.ts.
export const SalesTrendChart = ({
  data,
  isLoading,
}: SalesTrendChartProps) => {
  const { t } = useTranslation();

  return (
    <div className="rounded-lg border border-[var(--hairline)] bg-[var(--panel)] p-4">
      <h3 className="mb-3 text-sm font-semibold text-[var(--ink-primary)]">
        {t("cashierStats.charts.salesTrend")}
      </h3>

      {isLoading ? (
        <div className="h-64 animate-pulse rounded-md bg-[var(--sunken)]" />
      ) : data.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-sm text-[var(--ink-tertiary)]">
          {t("cashierStats.noDataForPeriod")}
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart
            data={data}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient
                id="netSalesFill"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="var(--signal)"
                  stopOpacity={0.25}
                />
                <stop
                  offset="95%"
                  stopColor="var(--signal)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--hairline)"
              vertical={false}
            />

            <XAxis
              dataKey="label"
              tick={{
                fontSize: 12,
                fill: "var(--ink-tertiary)",
              }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              tick={{
                fontSize: 12,
                fill: "var(--ink-tertiary)",
              }}
              axisLine={false}
              tickLine={false}
              width={48}
            />

            <Tooltip
              contentStyle={{
                background: "var(--panel)",
                border: "1px solid var(--hairline)",
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(value, name) => {
                const numericValue =
                  typeof value === "number" ? value : Number(value);

                const formattedValue = Number.isFinite(numericValue)
                  ? numericValue.toFixed(2)
                  : "0.00";

                return [
                  formattedValue,
                  name === "netSales"
                    ? t("cashierStats.kpi.netSales")
                    : t("cashierStats.kpi.totalTransactions"),
                ];
              }}
            />

            <Area
              type="monotone"
              dataKey="netSales"
              stroke="var(--signal)"
              strokeWidth={2}
              fill="url(#netSalesFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};