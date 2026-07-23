import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/common/Card";

interface EmployeeSummaryStat {
  label: string;
  value: string;
}

interface EmployeeSummaryCardProps {
  stats: EmployeeSummaryStat[];
  hrDashboardHref: string;
}

export function EmployeeSummaryCard({ stats, hrDashboardHref }: EmployeeSummaryCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-ink-primary">Employee Summary</h3>
        <Link
          to={hrDashboardHref}
          className="flex items-center gap-1 text-[0.8125rem] font-medium text-signal hover:text-signal-hover"
        >
          View HR Dashboard
          <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />
        </Link>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4">
        {stats.map((stat) => (
          <div key={stat.label}>
            <p className="font-display text-xl font-semibold text-ink-primary">{stat.value}</p>
            <p className="text-[0.8125rem] text-ink-secondary">{stat.label}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
