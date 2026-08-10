// src/components/admin/attendance/AttendanceFiltersDrawer.tsx

import { useTranslation } from "react-i18next";
import { Drawer } from "../../common/Drawer";
import { AttendanceFilterState } from "../../../types/attendance.types";
import { EmployeeSelector } from "./EmployeeSelector";

interface AttendanceFiltersDrawerProps {
  open: boolean;
  onClose: () => void;
  filters: AttendanceFilterState;
  onChange: (next: AttendanceFilterState) => void;
  statusOptions: string[];
}

export function AttendanceFiltersDrawer({ open, onClose, filters, onChange, statusOptions }: AttendanceFiltersDrawerProps) {
  const { t } = useTranslation();

  return (
    <Drawer open={open} onClose={onClose} title={t("attendance.filters.title")}>
      <div className="flex flex-col gap-4 p-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--ink-secondary)]">
            {t("attendance.filters.employee")}
          </label>
          <EmployeeSelector value={filters.employeeId} onChange={(id) => onChange({ ...filters, employeeId: id })} />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--ink-secondary)]">
            {t("attendance.filters.date")}
          </label>
          <select
            value={filters.datePreset}
            onChange={(e) => onChange({ ...filters, datePreset: e.target.value as AttendanceFilterState["datePreset"] })}
            className="w-full rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] px-3 py-2 text-sm"
          >
            <option value="all">{t("attendance.filters.dateAll")}</option>
            <option value="today">{t("attendance.filters.dateToday")}</option>
            <option value="week">{t("attendance.filters.dateWeek")}</option>
            <option value="month">{t("attendance.filters.dateMonth")}</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--ink-secondary)]">
            {t("attendance.filters.status")}
          </label>
          <select
            value={filters.status ?? ""}
            onChange={(e) => onChange({ ...filters, status: e.target.value || null })}
            className="w-full rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] px-3 py-2 text-sm"
          >
            <option value="">{t("attendance.filters.statusAll")}</option>
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={() => onChange({ search: filters.search, employeeId: null, datePreset: "all", status: null })}
            className="flex-1 rounded-[10px] border border-[var(--hairline)] py-2 text-sm text-[var(--ink-primary)]"
          >
            {t("attendance.filters.clear")}
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-[10px] bg-[var(--signal)] py-2 text-sm font-medium text-white"
          >
            {t("attendance.filters.apply")}
          </button>
        </div>
      </div>
    </Drawer>
  );
}
