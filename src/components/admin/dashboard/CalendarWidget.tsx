import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/common/Card";
import type { CalendarEventDay } from "@/types/dashboard.types";

interface CalendarWidgetProps {
  events: CalendarEventDay[];
  monthLabel: string;
  daysInMonth: number;
  startWeekday: number; // 0 = Sunday
  todayDate: number;
}

// Compact month grid — a smaller, dashboard-scoped sibling to the full Leave
// Calendar page. Fully keyboard-navigable: arrow keys move between days,
// Enter opens that day's event list below the grid.
export function CalendarWidget({ events, monthLabel, daysInMonth, startWeekday, todayDate }: CalendarWidgetProps) {
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const eventsByDate = new Map(events.map((e) => [e.date, e.events]));

  const cells: (number | null)[] = [
    ...Array(startWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const onKeyDown = (event: React.KeyboardEvent, date: number) => {
    const delta = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : event.key === "ArrowDown" ? 7 : event.key === "ArrowUp" ? -7 : 0;
    if (delta !== 0) {
      event.preventDefault();
      const nextDate = date + delta;
      if (nextDate >= 1 && nextDate <= daysInMonth) {
        document.getElementById(`cal-day-${nextDate}`)?.focus();
      }
    } else if (event.key === "Enter") {
      setSelectedDate(date);
    }
  };

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-ink-primary">{monthLabel}</h3>
        <div className="flex gap-1">
          <button type="button" aria-label="Previous month" className="rounded p-1 text-ink-tertiary hover:bg-sunken hover:text-ink-primary">
            <ChevronLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
          </button>
          <button type="button" aria-label="Next month" className="rounded p-1 text-ink-tertiary hover:bg-sunken hover:text-ink-primary">
            <ChevronRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[0.6875rem] text-ink-tertiary">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <span key={`${d}-${i}`}>{d}</span>
        ))}
      </div>

      <div role="grid" className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((date, index) => {
          if (date === null) return <span key={`empty-${index}`} />;
          const hasEvents = eventsByDate.has(date);
          const isToday = date === todayDate;
          return (
            <button
              key={date}
              id={`cal-day-${date}`}
              type="button"
              role="gridcell"
              tabIndex={date === todayDate ? 0 : -1}
              onKeyDown={(e) => onKeyDown(e, date)}
              onClick={() => setSelectedDate(date)}
              className={[
                "relative aspect-square rounded-md text-[0.75rem] transition-colors duration-control",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-synapse",
                isToday ? "border border-signal text-signal" : "text-ink-secondary hover:bg-sunken",
                selectedDate === date ? "bg-sunken" : "",
              ].join(" ")}
            >
              {date}
              {hasEvents ? (
                <span className="absolute bottom-1 start-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-synapse" aria-hidden="true" />
              ) : null}
            </button>
          );
        })}
      </div>

      {selectedDate && eventsByDate.has(selectedDate) ? (
        <ul className="mt-4 space-y-1.5 border-t border-hairline pt-3">
          {eventsByDate.get(selectedDate)!.map((label) => (
            <li key={label} className="text-[0.8125rem] text-ink-secondary">
              {label}
            </li>
          ))}
        </ul>
      ) : null}
    </Card>
  );
}
