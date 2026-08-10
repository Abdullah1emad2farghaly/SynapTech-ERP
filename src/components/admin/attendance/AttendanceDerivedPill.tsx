// src/components/admin/attendance/AttendanceDerivedPill.tsx

import { DerivedAttendanceState } from "../../../types/attendance.types";

// Purely a frontend-computed indicator (checkInTime/checkOutTime presence).
// Rendered alongside — never instead of — the real API `status` badge.

interface AttendanceDerivedPillProps {
  state: DerivedAttendanceState;
  labels: { notCheckedIn: string; checkedIn: string; completed: string };
}

export function AttendanceDerivedPill({ state, labels }: AttendanceDerivedPillProps) {
  const map = {
    "not-checked-in": { text: labels.notCheckedIn, cls: "text-[var(--ink-tertiary)]" },
    "checked-in": { text: labels.checkedIn, cls: "text-[var(--synapse)]" },
    completed: { text: labels.completed, cls: "text-[var(--ink-secondary)]" },
  } as const;

  const { text, cls } = map[state];
  return <span className={`text-xs font-medium ${cls}`}>{text}</span>;
}
