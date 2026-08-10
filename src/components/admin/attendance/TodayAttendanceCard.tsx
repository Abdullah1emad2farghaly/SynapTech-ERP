// src/components/attendance/TodayAttendanceCard.tsx

import { useTranslation } from "react-i18next";
import { LogIn, LogOut } from "lucide-react";
import toast from "react-hot-toast";
import { useTodayAttendance, useCheckIn, useCheckOut } from "../../../hooks/useAttendance";
import { formatAttendanceTime, calculateWorkingDuration } from "../../../utils/attendanceFormat";

export function TodayAttendanceCard() {
  const { t, i18n } = useTranslation();
  const { todayRecord, isLoading } = useTodayAttendance();
  const checkInMutation = useCheckIn();
  const checkOutMutation = useCheckOut();

  const hasCheckedIn = !!todayRecord?.checkInTime;
  const hasCheckedOut = !!todayRecord?.checkOutTime;

  const handleCheckIn = () => {
    checkInMutation.mutate(undefined, {
      onSuccess: () => toast.success(t("attendance.toast.checkInSuccess")),
      onError: () => toast.error(t("attendance.toast.checkInError")),
    });
  };

  const handleCheckOut = () => {
    checkOutMutation.mutate(undefined, {
      onSuccess: () => toast.success(t("attendance.toast.checkOutSuccess")),
      onError: () => toast.error(t("attendance.toast.checkOutError")),
    });
  };

  if (isLoading) {
    return <div className="h-40 animate-pulse rounded-[16px] bg-[var(--sunken)]" />;
  }

  const duration = calculateWorkingDuration(todayRecord?.checkInTime ?? null, todayRecord?.checkOutTime ?? null);

  return (
    <div className="rounded-[16px] border border-[var(--hairline)] bg-[var(--panel)] p-6">
      <p className="text-sm text-[var(--ink-tertiary)]">{t("attendance.today.label")}</p>

      {!hasCheckedIn && (
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-base text-[var(--ink-secondary)]">{t("attendance.today.notCheckedIn")}</p>
          <button
            onClick={handleCheckIn}
            disabled={checkInMutation.isPending}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[10px] bg-[var(--signal)] px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
          >
            <LogIn size={16} />
            {checkInMutation.isPending ? t("attendance.today.checkingIn") : t("attendance.today.checkIn")}
          </button>
        </div>
      )}

      {hasCheckedIn && !hasCheckedOut && (
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-2xl font-semibold text-[var(--ink-primary)]">
              {formatAttendanceTime(todayRecord!.checkInTime, i18n.language)}
            </p>
            <p className="text-sm text-[var(--synapse)]">{t("attendance.today.checkedIn")}</p>
          </div>
          <button
            onClick={handleCheckOut}
            disabled={checkOutMutation.isPending}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[10px] border border-[var(--hairline)] px-5 py-2.5 text-sm font-medium text-[var(--ink-primary)] disabled:opacity-60"
          >
            <LogOut size={16} />
            {checkOutMutation.isPending ? t("attendance.today.checkingOut") : t("attendance.today.checkOut")}
          </button>
        </div>
      )}

      {hasCheckedIn && hasCheckedOut && (
        <div className="mt-3 flex flex-wrap items-center gap-6">
          <div>
            <p className="text-xs text-[var(--ink-tertiary)]">{t("attendance.columns.checkIn")}</p>
            <p className="text-base font-medium text-[var(--ink-primary)]">
              {formatAttendanceTime(todayRecord!.checkInTime, i18n.language)}
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--ink-tertiary)]">{t("attendance.columns.checkOut")}</p>
            <p className="text-base font-medium text-[var(--ink-primary)]">
              {formatAttendanceTime(todayRecord!.checkOutTime, i18n.language)}
            </p>
          </div>
          {duration && (
            <div>
              <p className="text-xs text-[var(--ink-tertiary)]">{t("attendance.today.duration")}</p>
              <p className="text-base font-medium text-[var(--ink-primary)]">{duration}</p>
            </div>
          )}
          <span className="text-sm font-medium text-[var(--success)]">{t("attendance.today.completed")}</span>
        </div>
      )}
    </div>
  );
}
