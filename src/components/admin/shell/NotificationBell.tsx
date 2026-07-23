import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";

export interface NotificationItem {
  id: string;
  title: string;
  timestampLabel: string;
  read: boolean;
  onClick?: () => void;
}

interface NotificationBellProps {
  notifications: NotificationItem[];
}

// Panel is intentionally minimal here — the full Notification Center
// (grouping by day, preferences link, etc.) from the HR module design doc
// can render inside this same trigger once that data source exists.
export function NotificationBell({ notifications }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
        className="relative rounded-full p-2 text-ink-secondary hover:bg-sunken hover:text-ink-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-synapse"
      >
        <Bell className="h-4.5 w-4.5" aria-hidden="true" />
        {unreadCount > 0 ? (
          <span className="absolute end-1.5 top-1.5 h-2 w-2 rounded-full bg-error" aria-hidden="true" />
        ) : null}
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute end-0 z-20 mt-2 w-80 rounded-lg border border-hairline bg-panel py-1.5 shadow-elevation1"
        >
          <div className="flex items-center justify-between px-3.5 py-2">
            <p className="text-[0.8125rem] font-medium text-ink-primary">Notifications</p>
            {unreadCount > 0 ? (
              <button type="button" className="text-[0.75rem] text-signal hover:text-signal-hover">
                Mark all as read
              </button>
            ) : null}
          </div>
          <div className="my-1 border-t border-hairline" />

          {notifications.length === 0 ? (
            <p className="px-3.5 py-6 text-center text-[0.8125rem] text-ink-tertiary">You're all caught up.</p>
          ) : (
            <ul className="max-h-80 overflow-y-auto">
              {notifications.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={item.onClick}
                    className={[
                      "flex w-full items-start gap-2 border-s-2 px-3.5 py-2.5 text-start text-[0.8125rem] hover:bg-sunken",
                      item.read ? "border-transparent text-ink-secondary" : "border-signal text-ink-primary",
                    ].join(" ")}
                  >
                    <span className="flex-1">{item.title}</span>
                    <span className="shrink-0 whitespace-nowrap text-[0.75rem] text-ink-tertiary">
                      {item.timestampLabel}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
