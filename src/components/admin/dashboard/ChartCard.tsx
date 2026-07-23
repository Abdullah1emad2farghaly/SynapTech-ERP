import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/common/Card";

interface ChartCardProps {
  title: string;
  summary: string;
  viewAllHref: string;
  tableFallback: ReactNode; // sr-only <table> for screen readers
  children: ReactNode; // the actual chart
}

// Shared shell only — no chart-rendering logic lives here. Each metric
// (Revenue, Sales, Inventory, Finance) uses the chart type that actually
// fits its data shape, composed inside this same header/footer frame so
// the dashboard still reads as one coherent product.
export function ChartCard({ title, summary, viewAllHref, tableFallback, children }: ChartCardProps) {
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

      <table className="sr-only">
        <caption>{title} data</caption>
        {tableFallback}
      </table>

      <div className="mt-4 h-[240px]" aria-hidden="true">
        {children}
      </div>
    </Card>
  );
}
