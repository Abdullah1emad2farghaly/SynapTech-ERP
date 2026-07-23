import { Card } from "@/components/common/Card";
import { Avatar } from "@/components/admin/hr/Avatar";
import type { ActivityEntry } from "@/types/hr.types";

// App-wide version of the HR Dashboard's Recent Activity card — same
// component shape, wider data source (all modules, not just HR).
export function RecentActivitiesCard({ entries }: { entries: ActivityEntry[] }) {
  return (
    <Card className="p-5">
      <h3 className="font-medium text-ink-primary">Recent Activities</h3>
      {entries.length === 0 ? (
        <p className="mt-3 text-[0.8125rem] text-ink-tertiary">No recent activity.</p>
      ) : (
        <ul className="mt-3 divide-y divide-hairline">
          {entries.map((entry) => (
            <li key={entry.id} className="flex items-center gap-3 py-3">
              <Avatar name={entry.actor} size="sm" />
              <p className="flex-1 text-[0.8125rem] text-ink-secondary">
                <span className="font-medium text-ink-primary">{entry.actor}</span> {entry.action}{" "}
                <span className="font-medium text-ink-primary">{entry.entityLabel}</span>
              </p>
              <span className="whitespace-nowrap text-[0.8125rem] text-ink-tertiary">
                {entry.timestampLabel}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
