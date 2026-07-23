import { Card } from "@/components/common/Card";
import type { AnnouncementItem } from "@/types/dashboard.types";

export function AnnouncementsCard({ announcements }: { announcements: AnnouncementItem[] }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-ink-primary">Company Announcements</h3>
        <button type="button" className="text-[0.8125rem] font-medium text-signal hover:text-signal-hover">
          View all
        </button>
      </div>
      {announcements.length === 0 ? (
        <p className="mt-3 text-[0.8125rem] text-ink-tertiary">No announcements right now.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {announcements.map((item) => (
            <li key={item.id} className="border-b border-hairline pb-3 last:border-0 last:pb-0">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[0.9375rem] font-medium text-ink-primary">{item.title}</p>
                <span className="shrink-0 text-[0.75rem] text-ink-tertiary">{item.dateLabel}</span>
              </div>
              <p className="mt-1 text-[0.8125rem] text-ink-secondary">{item.excerpt}</p>
              <p className="mt-1 text-[0.75rem] text-ink-tertiary">{item.author}</p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
