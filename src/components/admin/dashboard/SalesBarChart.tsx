import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip, Cell } from "recharts";
import { ChartCard } from "@/components/admin/dashboard/ChartCard";
import type { OverviewChartData } from "@/types/dashboard.types";

// Sales are discrete monthly totals, not a running accumulation — bars
// compare each period against the others more honestly than a filled area
// would (an area implies continuity between points that isn't really there).
export function SalesBarChart({ title, summary, data, viewAllHref }: OverviewChartData) {
  const latestIndex = data.length - 1;

  return (
    <ChartCard
      title={title}
      summary={summary}
      viewAllHref={viewAllHref}
      tableFallback={
        <>
          <thead><tr><th scope="col">Period</th><th scope="col">Deals closed</th></tr></thead>
          <tbody>
            {data.map((p) => (
              <tr key={p.label}><td>{p.label}</td><td>{p.value}</td></tr>
            ))}
          </tbody>
        </>
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
          <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#9098B8", fontSize: 12 }} />
          <Tooltip
            cursor={{ fill: "#EEF0F6" }}
            contentStyle={{ borderRadius: 8, border: "1px solid #E2E4F0", fontSize: 13 }}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]} isAnimationActive animationDuration={280}>
            {data.map((_, index) => (
              <Cell key={index} fill={index === latestIndex ? "#4338CA" : "#C7CCE8"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
