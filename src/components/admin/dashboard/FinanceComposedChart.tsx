import { ComposedChart, Bar, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { ChartCard } from "@/components/admin/dashboard/ChartCard";
import type { FinanceChartData } from "@/types/dashboard.types";

// Finance pairs two different units (cost as an absolute amount, margin as
// a percentage) — a composed bar+line chart with a secondary axis is the
// standard enterprise-BI way to show a rate metric riding alongside its
// underlying volume metric without distorting either scale.
export function FinanceComposedChart({ title, summary, data, viewAllHref }: FinanceChartData) {
  return (
    <ChartCard
      title={title}
      summary={summary}
      viewAllHref={viewAllHref}
      tableFallback={
        <>
          <thead>
            <tr><th scope="col">Period</th><th scope="col">Cost</th><th scope="col">Margin %</th></tr>
          </thead>
          <tbody>
            {data.map((p) => (
              <tr key={p.label}><td>{p.label}</td><td>{p.cost}</td><td>{p.marginPct}</td></tr>
            ))}
          </tbody>
        </>
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
          <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#9098B8", fontSize: 12 }} />
          <YAxis yAxisId="cost" hide />
          <YAxis yAxisId="margin" orientation="right" hide domain={[0, 100]} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgb(var(--color-panel))',
              border: '1px solid rgb(var(--color-hairline))',
              borderRadius: '8px',
              boxShadow: 'var(--shadow-elevation-1)',
              color: 'rgb(var(--color-ink-primary))',
            }}
            labelStyle={{
              color: 'rgb(var(--color-ink-primary))',
              fontWeight: 500,
              marginBottom: '4px',
            }}
            itemStyle={{
              color: 'rgb(var(--color-ink-secondary))',
            }}
            cursor={{
              stroke: 'rgb(var(--color-hairline))',
            }}
          />
          <Bar
            yAxisId="cost"
            dataKey="cost"
            name="Cost"
            fill="#C7CCE8"
            radius={[6, 6, 0, 0]}
            isAnimationActive
            animationDuration={280}
          />
          <Line
            yAxisId="margin"
            type="monotone"
            dataKey="marginPct"
            name="Margin %"
            stroke="#22D3EE"
            strokeWidth={2}
            dot={{ r: 3 }}
            isAnimationActive
            animationDuration={280}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
