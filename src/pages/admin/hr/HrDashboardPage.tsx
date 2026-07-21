import { Users, CalendarClock, CalendarCheck, Cake, FileWarning, Plus, PlayCircle, Send } from "lucide-react";
import { KPICard } from "@/components/admin/hr/KPICard";
import { StatusBadge } from "@/components/admin/hr/StatusBadge";
import { Avatar } from "@/components/admin/hr/Avatar";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { EmptyState } from "@/components/admin/hr/EmptyState";
import {
  mockActivity,
  mockApprovals,
  mockDashboardKpis,
  mockUpcomingEvents,
} from "@/utils/mockHrData";

const EVENT_ICON = {
  birthday: Cake,
  anniversary: CalendarCheck,
  "contract-expiry": FileWarning,
  "start-date": Users,
};

export default function HrDashboardPage() {
  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-primary">HR & Payroll</h1>
          <p className="text-[0.9375rem] text-ink-secondary">
            What&apos;s happening across the workforce right now.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary">
            <Plus className="h-4 w-4" /> Add Employee
          </Button>
          <Button variant="secondary">
            <PlayCircle className="h-4 w-4" /> Run Payroll
          </Button>
          <Button variant="secondary">
            <Send className="h-4 w-4" /> Request Leave
          </Button>
        </div>
      </div>

      {/* Executive KPI row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {mockDashboardKpis.map((kpi) => (
          <KPICard key={kpi.id} {...kpi} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Pending Approvals */}
        <Card className="p-5">
          <h2 className="font-medium text-ink-primary">Pending Approvals</h2>
          {mockApprovals.length === 0 ? (
            <EmptyState icon={CalendarCheck} title="Nothing waiting on you" />
          ) : (
            <ul className="mt-3 divide-y divide-hairline">
              {mockApprovals.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <p className="text-[0.9375rem] text-ink-primary">{item.title}</p>
                    <p className="text-[0.8125rem] text-ink-tertiary">
                      {item.requester} · {item.ageLabel}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary">Reject</Button>
                    <Button>Approve</Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Payroll Status */}
        <Card className="p-5">
          <h2 className="font-medium text-ink-primary">Payroll Status</h2>
          <div className="mt-3 flex items-center justify-between">
            <div>
              <p className="text-[0.9375rem] text-ink-primary">July 2026 pay period</p>
              <p className="text-[0.8125rem] text-ink-tertiary">Due in 4 days</p>
            </div>
            <StatusBadge label="Processing" variant="info" />
          </div>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-sunken">
            <div className="h-full w-2/3 rounded-full bg-signal" />
          </div>
          <p className="mt-2 text-[0.8125rem] text-ink-tertiary">61 of 91 employees validated</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Upcoming Events */}
        <Card className="p-5">
          <h2 className="font-medium text-ink-primary">Upcoming Events</h2>
          <ul className="mt-3 divide-y divide-hairline">
            {mockUpcomingEvents.map((event) => {
              const Icon = EVENT_ICON[event.kind];
              return (
                <li key={event.id} className="flex items-center gap-3 py-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sunken text-ink-secondary">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <p className="flex-1 text-[0.9375rem] text-ink-primary">{event.title}</p>
                  <span className="text-[0.8125rem] text-ink-tertiary">{event.dateLabel}</span>
                </li>
              );
            })}
          </ul>
        </Card>

        {/* Recent Activity */}
        <Card className="p-5">
          <h2 className="font-medium text-ink-primary">Recent Activity</h2>
          <ul className="mt-3 divide-y divide-hairline">
            {mockActivity.map((entry) => (
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
        </Card>
      </div>
    </div>
  );
}
