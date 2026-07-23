import { Card } from "@/components/common/Card";
import type { SystemHealthItem, SystemStatus } from "@/types/dashboard.types";

const STATUS_STYLES: Record<SystemStatus, { dot: string; label: string; text: string }> = {
  operational: { dot: "bg-success", label: "Operational", text: "text-success" },
  degraded: { dot: "bg-warning", label: "Degraded", text: "text-warning" },
  down: { dot: "bg-error", label: "Down", text: "text-error" },
};

// Deliberately quiet by design — reassures in the common all-green case and
// only draws attention when something's actually wrong; never competes
// visually with the KPI row above it on the dashboard.
export function SystemHealthCard({ items }: { items: SystemHealthItem[] }) {
  return (
    <Card className="p-5">
      <h3 className="font-medium text-ink-primary">System Health</h3>
      <ul className="mt-3 space-y-2.5">
        {items.map((item) => {
          const style = STATUS_STYLES[item.status];
          return (
            <li key={item.id} className="flex items-center justify-between text-[0.8125rem]">
              <span className="text-ink-secondary">{item.name}</span>
              <span className={`flex items-center gap-1.5 font-medium ${style.text}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} aria-hidden="true" />
                {style.label}
              </span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
