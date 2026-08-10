// src/components/admin/attendance/AttendanceSummaryCards.tsx

// All four numbers are computed client-side from the currently loaded dataset —
// there is no statistics/dashboard endpoint. "Attention" = records with a check-in
// but no check-out (frontend-derived, not an API status).

import { useTranslation } from "react-i18next";
import { AttendanceRecordResponse } from "../../../types/attendance.types";
import { getDerivedAttendanceState } from "../../../utils/attendanceFormat";

interface AttendanceSummaryCardsProps {
  records: AttendanceRecordResponse[];
}

export function AttendanceSummaryCards({ records }: AttendanceSummaryCardsProps) {
  const { t } = useTranslation();

  const total = records.length;
  const checkedIn = records.filter((r) => getDerivedAttendanceState(r) !== "not-checked-in").length;
  const completed = records.filter((r) => getDerivedAttendanceState(r) === "completed").length;
  const attention = records.filter((r) => getDerivedAttendanceState(r) === "checked-in").length;

  const cards = [
    { label: t("attendance.summary.total"), value: total, hint: t("attendance.summary.totalHint") },
    { label: t("attendance.summary.checkedIn"), value: checkedIn, hint: t("attendance.summary.checkedInHint") },
    { label: t("attendance.summary.completed"), value: completed, hint: t("attendance.summary.completedHint") },
    { label: t("attendance.summary.attention"), value: attention, hint: t("attendance.summary.attentionHint") },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {cards.map((c) => (
        <div key={c.label} className="rounded-[16px] border border-[var(--hairline)] bg-[var(--panel)] p-4">
          <p className="text-xs font-medium text-[var(--ink-tertiary)]">{c.label}</p>
          <p className="mt-1 text-2xl font-semibold text-[var(--ink-primary)]">{c.value}</p>
          <p className="mt-0.5 text-xs text-[var(--ink-tertiary)]">{c.hint}</p>
        </div>
      ))}
    </div>
  );
}
