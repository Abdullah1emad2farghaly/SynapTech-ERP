// src/pages/attendance/MyAttendancePage.tsx

import { useTranslation } from "react-i18next";
import { TodayAttendanceCard } from "@/components/admin/attendance/TodayAttendanceCard";
import { MyAttendanceHistoryView } from "@/components/admin/attendance/MyAttendanceHistoryView";

export function MyAttendancePage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <header>
        <h1 className="text-xl font-semibold text-[var(--ink-primary)]">{t("attendance.myAttendance.title")}</h1>
      </header>

      <TodayAttendanceCard />

      <div>
        <h2 className="mb-3 text-sm font-medium text-[var(--ink-primary)]">{t("attendance.myAttendance.historyTitle")}</h2>
        <MyAttendanceHistoryView />
      </div>
    </div>
  );
}
