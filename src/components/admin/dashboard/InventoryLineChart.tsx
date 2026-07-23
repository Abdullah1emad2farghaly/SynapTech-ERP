import { LineChart, Line, ResponsiveContainer, XAxis, Tooltip, Legend } from "recharts";
import { ChartCard } from "@/components/admin/dashboard/ChartCard";
import type { InventoryChartData } from "@/types/dashboard.types";

// Inventory is best read as two comparable series (actual stock level vs.
// the reorder threshold) — a multi-line chart makes "are we close to
// running low" visible at a glance in a way a single series can't.
export function InventoryLineChart({ title, summary, data, viewAllHref }: InventoryChartData) {
  return (
    <ChartCard
      title={title}
      summary={summary}
      viewAllHref={viewAllHref}
      tableFallback={
        <>
          <thead>
            <tr><th scope="col">Period</th><th scope="col">Stock level</th><th scope="col">Reorder threshold</th></tr>
          </thead>
          <tbody>
            {data.map((p) => (
              <tr key={p.label}><td>{p.label}</td><td>{p.stockLevel}</td><td>{p.reorderThreshold}</td></tr>
            ))}
          </tbody>
        </>
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
          <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#9098B8", fontSize: 12 }} />
          <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E2E4F0", fontSize: 13 }} />
          <Legend
            verticalAlign="top"
            align="right"
            height={24}
            wrapperStyle={{ fontSize: 12 }}
            iconType="circle"
          />
          <Line
            type="monotone"
            dataKey="stockLevel"
            name="Stock level"
            stroke="#4338CA"
            strokeWidth={2}
            dot={{ r: 3 }}
            isAnimationActive
            animationDuration={280}
          />
          <Line
            type="monotone"
            dataKey="reorderThreshold"
            name="Reorder threshold"
            stroke="#D97706"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            dot={false}
            isAnimationActive
            animationDuration={280}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
