// Intended project path: src/components/admin/cashier/statistics/TopProductsChart.tsx
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
import type { TopProductRow } from "../../../../utils/cashierStatistics.derive";

interface TopProductsChartProps {
  data: TopProductRow[];
  isLoading: boolean;
}

export const TopProductsChart = ({
  data,
  isLoading,
}: TopProductsChartProps) => {
  const { t } = useTranslation();

  return (
    <div className="rounded-lg border border-[var(--hairline)] bg-[var(--panel)] p-4">
      <h3 className="mb-3 text-sm font-semibold text-[var(--ink-primary)]">
        {t("cashierStats.charts.topProducts")}
      </h3>

      {isLoading ? (
        <div className="h-72 animate-pulse rounded-md bg-[var(--sunken)]" />
      ) : data.length === 0 ? (
        <div className="flex h-72 items-center justify-center text-sm text-[var(--ink-tertiary)]">
          {t("cashierStats.noDataForPeriod")}
        </div>
      ) : (
        <>
          <ResponsiveContainer
            width="100%"
            height={Math.max(220, data.length * 34)}
          >
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
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
                dataKey="productName"
                tick={{
                  fontSize: 12,
                  fill: "var(--ink-primary)",
                }}
                axisLine={false}
                tickLine={false}
                width={140}
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
                    typeof value === "number" ? value : Number(value);

                  return [
                    Number.isFinite(numericValue)
                      ? numericValue.toFixed(2)
                      : "0.00",
                    t("cashierStats.topProducts.sales"),
                  ];
                }}
              />

              <Bar
                dataKey="salesAmount"
                fill="var(--signal)"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-[var(--ink-tertiary)]">
                <tr>
                  <th className="py-1 text-start font-medium">
                    {t("cashier.cart.product")}
                  </th>
                  <th className="py-1 text-start font-medium">
                    {t("cashier.cart.sku")}
                  </th>
                  <th className="py-1 text-end font-medium">
                    {t("cashierStats.topProducts.qtySold")}
                  </th>
                  <th className="py-1 text-end font-medium">
                    {t("cashierStats.topProducts.sales")}
                  </th>
                  <th className="py-1 text-end font-medium">
                    {t("cashierStats.topProducts.share")}
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[var(--hairline)]">
                {data.map((row) => (
                  <tr key={row.productId}>
                    <td className="py-1.5 text-[var(--ink-primary)]">
                      {row.productName}
                    </td>

                    <td className="py-1.5 font-mono text-[var(--ink-tertiary)]">
                      {row.productSku ?? "—"}
                    </td>

                    <td className="py-1.5 text-end tabular-nums">
                      {row.quantitySold}
                    </td>

                    <td className="py-1.5 text-end font-medium tabular-nums">
                      {row.salesAmount.toFixed(2)}
                    </td>

                    <td className="py-1.5 text-end tabular-nums text-[var(--ink-tertiary)]">
                      {row.percentage.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};