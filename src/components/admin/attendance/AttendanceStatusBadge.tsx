// src/components/admin/attendance/AttendanceStatusBadge.tsx

// The API defines no status enum — this renders whatever string comes back,
// with a color map for known-looking values and a neutral fallback for anything else.
// Deliberately separate from the derived "In Progress"/"Completed" pill (see AttendanceDerivedPill).

interface AttendanceStatusBadgeProps {
  status: string | null;
  emptyLabel: string; // translated "No status" fallback
}

const KNOWN_STATUS_STYLES: Record<string, string> = {
  present: "bg-[var(--success)]/10 text-[var(--success)]",
  late: "bg-[var(--warning)]/10 text-[var(--warning)]",
  absent: "bg-[var(--error)]/10 text-[var(--error)]",
  "half day": "bg-[var(--warning)]/10 text-[var(--warning)]",
  "early leave": "bg-[var(--warning)]/10 text-[var(--warning)]",
};

export function AttendanceStatusBadge({ status, emptyLabel }: AttendanceStatusBadgeProps) {
  if (!status) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--sunken)] px-2.5 py-1 text-xs font-medium text-[var(--ink-tertiary)]">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--ink-tertiary)]" />
        {emptyLabel}
      </span>
    );
  }

  const style = KNOWN_STATUS_STYLES[status.toLowerCase()] ?? "bg-[var(--sunken)] text-[var(--ink-secondary)]";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${style}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}
