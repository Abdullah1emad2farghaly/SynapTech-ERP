import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip } from "recharts";
import { ChartCard } from "@/components/admin/dashboard/ChartCard";
import type { OverviewChartData } from "@/types/dashboard.types";

// Revenue is a running total that's naturally read as a filled trend —
// the area fill communicates "accumulating" in a way a bare line doesn't.
export function RevenueAreaChart({ title, summary, data, viewAllHref }: OverviewChartData) {
  return (
    <ChartCard
      title={title}
      summary={summary}
      viewAllHref={viewAllHref}
      tableFallback={
        <>
          <thead><tr><th scope="col">Period</th><th scope="col">Revenue</th></tr></thead>
          <tbody>
            {data.map((p) => (
              <tr key={p.label}><td>{p.label}</td><td>{p.value}</td></tr>
            ))}
          </tbody>
        </>
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
          <defs>
            <linearGradient id="revenue-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4338CA" stopOpacity={0.28} />
              <stop offset="100%" stopColor="#4338CA" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#9098B8", fontSize: 12 }} />
          <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E2E4F0", fontSize: 13 }} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#4338CA"
            strokeWidth={2}
            fill="url(#revenue-gradient)"
            isAnimationActive
            animationDuration={280}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
