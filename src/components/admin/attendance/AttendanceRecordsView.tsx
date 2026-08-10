// src/components/admin/attendance/AttendanceRecordsView.tsx

import { useTranslation } from "react-i18next";
import { Eye, Clock } from "lucide-react";
import { AttendanceRecordResponse } from "../../../types/attendance.types";
import { Avatar } from "../../common/Avatar";
import { AttendanceStatusBadge } from "./AttendanceStatusBadge";
import { AttendanceDerivedPill } from "./AttendanceDerivedPill";
import { EmptyState } from "../../common/EmptyState";
import { formatAttendanceDate, formatAttendanceTime, getDerivedAttendanceState } from "../../../utils/attendanceFormat";

interface AttendanceRecordsViewProps {
  records: AttendanceRecordResponse[];
  isLoading?: boolean;
  onViewDetails: (record: AttendanceRecordResponse) => void;
  locale: string;
}

export function AttendanceRecordsView({ records, isLoading, onViewDetails, locale }: AttendanceRecordsViewProps) {
  const { t } = useTranslation();

  if (!isLoading && records.length === 0) {
    return (
      <EmptyState
        icon={Clock}
        title={t("attendance.empty.title")}
        description={t("attendance.empty.description")}
      />
    );
  }

  const derivedLabels = {
    notCheckedIn: t("attendance.derived.notCheckedIn"),
    checkedIn: t("attendance.derived.checkedIn"),
    completed: t("attendance.derived.completed"),
  };

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block overflow-hidden rounded-[16px] border border-[var(--hairline)] bg-[var(--panel)]">
        <table className="w-full text-sm">
          <thead className="bg-[var(--sunken)] text-xs font-medium text-[var(--ink-tertiary)]">
            <tr>
              <th className="px-4 py-3 text-start">{t("attendance.columns.employee")}</th>
              <th className="px-4 py-3 text-start">{t("attendance.columns.date")}</th>
              <th className="px-4 py-3 text-start">{t("attendance.columns.checkIn")}</th>
              <th className="px-4 py-3 text-start">{t("attendance.columns.checkOut")}</th>
              <th className="px-4 py-3 text-start">{t("attendance.columns.status")}</th>
              <th className="px-4 py-3 text-start">{t("attendance.columns.notes")}</th>
              <th className="px-4 py-3 text-end">{t("attendance.columns.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading &&
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-t border-[var(--hairline)]">
                  <td colSpan={7} className="px-4 py-4">
                    <div className="h-4 w-full animate-pulse rounded bg-[var(--sunken)]" />
                  </td>
                </tr>
              ))}
            {!isLoading &&
              records.map((r) => (
                <tr
                  key={r.id}
                  className="border-t border-[var(--hairline)] hover:bg-[var(--sunken)]/50 cursor-pointer"
                  onClick={() => onViewDetails(r)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar name={r.employeeName ?? "—"} size="sm" />
                      <span className="text-[var(--ink-primary)]">{r.employeeName ?? t("common.unknown")}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[var(--ink-secondary)]">{formatAttendanceDate(r.date, locale)}</td>
                  <td className="px-4 py-3 text-[var(--ink-secondary)]">{formatAttendanceTime(r.checkInTime, locale)}</td>
                  <td className="px-4 py-3 text-[var(--ink-secondary)]">{formatAttendanceTime(r.checkOutTime, locale)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <AttendanceStatusBadge status={r.status} emptyLabel={t("attendance.status.none")} />
                      <AttendanceDerivedPill state={getDerivedAttendanceState(r)} labels={derivedLabels} />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[var(--ink-tertiary)] max-w-[180px] truncate">
                    {r.notes || t("attendance.notes.none")}
                  </td>
                  <td className="px-4 py-3 text-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDetails(r);
                      }}
                      className="inline-flex items-center gap-1 rounded-[8px] px-2 py-1 text-xs text-[var(--signal)] hover:bg-[var(--sunken)]"
                    >
                      <Eye size={14} /> {t("common.view")}
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {isLoading &&
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-[16px] bg-[var(--sunken)]" />
          ))}
        {!isLoading &&
          records.map((r) => (
            <button
              key={r.id}
              onClick={() => onViewDetails(r)}
              className="w-full text-start rounded-[16px] border border-[var(--hairline)] bg-[var(--panel)] p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar name={r.employeeName ?? "—"} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-[var(--ink-primary)]">{r.employeeName ?? t("common.unknown")}</p>
                    <p className="text-xs text-[var(--ink-tertiary)]">{formatAttendanceDate(r.date, locale)}</p>
                  </div>
                </div>
                <AttendanceStatusBadge status={r.status} emptyLabel={t("attendance.status.none")} />
              </div>
              <div className="mt-3 flex items-center justify-between text-xs">
                <div>
                  <p className="text-[var(--ink-tertiary)]">{t("attendance.columns.checkIn")}</p>
                  <p className="text-[var(--ink-secondary)]">{formatAttendanceTime(r.checkInTime, locale)}</p>
                </div>
                <div>
                  <p className="text-[var(--ink-tertiary)]">{t("attendance.columns.checkOut")}</p>
                  <p className="text-[var(--ink-secondary)]">{formatAttendanceTime(r.checkOutTime, locale)}</p>
                </div>
                <span className="text-[var(--signal)]">{t("attendance.viewDetails")} →</span>
              </div>
            </button>
          ))}
      </div>
    </>
  );
}
