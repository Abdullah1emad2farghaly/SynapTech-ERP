// src/components/attendance/MyAttendanceHistoryView.tsx

import { useTranslation } from "react-i18next";
import { History } from "lucide-react";
import { useMyAttendanceHistory } from "../../../hooks/useAttendance";
import { AttendanceStatusBadge } from "./AttendanceStatusBadge";
import { EmptyState } from "../../common/EmptyState";
import { formatAttendanceDate, formatAttendanceTime } from "../../../utils/attendanceFormat";

export function MyAttendanceHistoryView() {
  const { t, i18n } = useTranslation();
  const { data, isLoading } = useMyAttendanceHistory();

  if (!isLoading && (!data || data.length === 0)) {
    return (
      <EmptyState
        icon={History}
        title={t("attendance.myHistory.emptyTitle")}
        description={t("attendance.myHistory.emptyDescription")}
      />
    );
  }

  return (
    <>
      <div className="hidden md:block overflow-hidden rounded-[16px] border border-[var(--hairline)] bg-[var(--panel)]">
        <table className="w-full text-sm">
          <thead className="bg-[var(--sunken)] text-xs font-medium text-[var(--ink-tertiary)]">
            <tr>
              <th className="px-4 py-3 text-start">{t("attendance.columns.date")}</th>
              <th className="px-4 py-3 text-start">{t("attendance.columns.checkIn")}</th>
              <th className="px-4 py-3 text-start">{t("attendance.columns.checkOut")}</th>
              <th className="px-4 py-3 text-start">{t("attendance.columns.status")}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-t border-[var(--hairline)]">
                  <td colSpan={4} className="px-4 py-4">
                    <div className="h-4 w-full animate-pulse rounded bg-[var(--sunken)]" />
                  </td>
                </tr>
              ))}
            {!isLoading &&
              data!.map((r) => (
                <tr key={r.id} className="border-t border-[var(--hairline)]">
                  <td className="px-4 py-3 text-[var(--ink-primary)]">{formatAttendanceDate(r.date, i18n.language)}</td>
                  <td className="px-4 py-3 text-[var(--ink-secondary)]">{formatAttendanceTime(r.checkInTime, i18n.language)}</td>
                  <td className="px-4 py-3 text-[var(--ink-secondary)]">{formatAttendanceTime(r.checkOutTime, i18n.language)}</td>
                  <td className="px-4 py-3">
                    <AttendanceStatusBadge status={r.status} emptyLabel={t("attendance.status.none")} />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-3">
        {isLoading &&
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-[16px] bg-[var(--sunken)]" />
          ))}
        {!isLoading &&
          data!.map((r) => (
            <div key={r.id} className="rounded-[16px] border border-[var(--hairline)] bg-[var(--panel)] p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[var(--ink-primary)]">{formatAttendanceDate(r.date, i18n.language)}</p>
                <AttendanceStatusBadge status={r.status} emptyLabel={t("attendance.status.none")} />
              </div>
              <div className="mt-2 flex items-center gap-6 text-xs">
                <div>
                  <p className="text-[var(--ink-tertiary)]">{t("attendance.columns.checkIn")}</p>
                  <p className="text-[var(--ink-secondary)]">{formatAttendanceTime(r.checkInTime, i18n.language)}</p>
                </div>
                <div>
                  <p className="text-[var(--ink-tertiary)]">{t("attendance.columns.checkOut")}</p>
                  <p className="text-[var(--ink-secondary)]">{formatAttendanceTime(r.checkOutTime, i18n.language)}</p>
                </div>
              </div>
            </div>
          ))}
      </div>
    </>
  );
}
