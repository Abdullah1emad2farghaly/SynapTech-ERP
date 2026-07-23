import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip } from "recharts";
import { Card } from "@/components/common/Card";
import type { OverviewChartData } from "@/types/dashboard.types";

// Shared shell for Revenue / Sales / Inventory / Finance Overview — one
// component, four data sources. Each card is a doorway into that
// function's full analytics page via "View full analytics".
export function OverviewChartCard({ title, summary, data, viewAllHref }: OverviewChartData) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-medium text-ink-primary">{title}</h3>
          <p className="mt-0.5 text-[0.8125rem] text-ink-secondary">{summary}</p>
        </div>
        <Link
          to={viewAllHref}
          className="flex shrink-0 items-center gap-1 text-[0.8125rem] font-medium text-signal hover:text-signal-hover"
        >
          View full analytics
          <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />
        </Link>
      </div>

      {/* Visually-hidden data table fallback for screen readers — Recharts'
          SVG output alone isn't reliably announced. */}
      <table className="sr-only">
        <caption>{title} data</caption>
        <thead>
          <tr>
            <th scope="col">Period</th>
            <th scope="col">Value</th>
          </tr>
        </thead>
        <tbody>
          {data.map((point) => (
            <tr key={point.label}>
              <td>{point.label}</td>
              <td>{point.value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 h-[240px]" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
            <defs>
              <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4338CA" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#4338CA" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9098B8", fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #E2E4F0",
                fontSize: 13,
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#4338CA"
              strokeWidth={2}
              fill={`url(#gradient-${title})`}
              isAnimationActive
              animationDuration={280}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
