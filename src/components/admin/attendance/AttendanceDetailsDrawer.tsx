// src/components/admin/attendance/AttendanceDetailsDrawer.tsx

import { useTranslation } from "react-i18next";
import { Drawer } from "../../common/Drawer";
import { AttendanceRecordResponse } from "../../../types/attendance.types";
import { AttendanceStatusBadge } from "./AttendanceStatusBadge";
import { formatAttendanceDate, formatAttendanceTime, calculateWorkingDuration } from "../../../utils/attendanceFormat";

interface AttendanceDetailsDrawerProps {
  record: AttendanceRecordResponse | null;
  onClose: () => void;
  locale: string;
}

export function AttendanceDetailsDrawer({ record, onClose, locale }: AttendanceDetailsDrawerProps) {
  const { t } = useTranslation();
  if (!record) return null;

  const duration = calculateWorkingDuration(record.checkInTime, record.checkOutTime);

  const rows = [
    { label: t("attendance.details.date"), value: formatAttendanceDate(record.date, locale) },
    { label: t("attendance.details.checkIn"), value: formatAttendanceTime(record.checkInTime, locale) },
    { label: t("attendance.details.checkOut"), value: formatAttendanceTime(record.checkOutTime, locale) },
    ...(duration ? [{ label: t("attendance.details.duration"), value: duration }] : []),
  ];

  return (
    <Drawer
      open={!!record}
      onClose={onClose}
      title={t("attendance.details.title")}
      subtitle={record.employeeName ?? t("common.unknown")}
    >
      <div className="flex flex-col gap-4 p-4">
        <AttendanceStatusBadge status={record.status} emptyLabel={t("attendance.status.none")} />

        <div className="divide-y divide-[var(--hairline)]">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center justify-between py-3">
              <span className="text-sm text-[var(--ink-tertiary)]">{r.label}</span>
              <span className="text-sm text-[var(--ink-primary)]">{r.value}</span>
            </div>
          ))}
        </div>

        <div>
          <p className="mb-1 text-sm text-[var(--ink-tertiary)]">{t("attendance.details.notes")}</p>
          <p className="text-sm text-[var(--ink-primary)]">{record.notes || t("attendance.notes.none")}</p>
        </div>
      </div>
    </Drawer>
  );
}
