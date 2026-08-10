// src/components/admin/attendance/AttendanceFiltersBar.tsx

import { useTranslation } from "react-i18next";
import { Search, SlidersHorizontal, RefreshCw } from "lucide-react";
import { AttendanceFilterState } from "../../../types/attendance.types";
import { EmployeeSelector } from "./EmployeeSelector";

interface AttendanceFiltersBarProps {
  filters: AttendanceFilterState;
  onChange: (next: AttendanceFilterState) => void;
  statusOptions: string[]; // distinct statuses found in the loaded dataset — not API-provided
  onOpenMobileFilters: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export function AttendanceFiltersBar({
  filters,
  onChange,
  statusOptions,
  onOpenMobileFilters,
  onRefresh,
  isRefreshing,
}: AttendanceFiltersBarProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1 md:max-w-xs">
          <Search size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-[var(--ink-tertiary)]" />
          <input
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            placeholder={t("attendance.filters.searchPlaceholder")}
            className="w-full rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] py-2 ps-9 pe-3 text-sm outline-none focus:border-[var(--signal)]"
          />
        </div>

        {/* Desktop-only filter controls */}
        <div className="hidden md:flex md:items-center md:gap-2">
          <EmployeeSelector
            value={filters.employeeId}
            onChange={(id) => onChange({ ...filters, employeeId: id })}
            className="w-56"
          />

          <select
            value={filters.datePreset}
            onChange={(e) => onChange({ ...filters, datePreset: e.target.value as AttendanceFilterState["datePreset"] })}
            className="rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--ink-primary)]"
          >
            <option value="all">{t("attendance.filters.dateAll")}</option>
            <option value="today">{t("attendance.filters.dateToday")}</option>
            <option value="week">{t("attendance.filters.dateWeek")}</option>
            <option value="month">{t("attendance.filters.dateMonth")}</option>
          </select>

          <select
            value={filters.status ?? ""}
            onChange={(e) => onChange({ ...filters, status: e.target.value || null })}
            className="rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--ink-primary)]"
          >
            <option value="">{t("attendance.filters.statusAll")}</option>
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Mobile-only filters trigger */}
        <button
          onClick={onOpenMobileFilters}
          className="md:hidden inline-flex items-center justify-center gap-2 rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--ink-primary)]"
        >
          <SlidersHorizontal size={14} /> {t("attendance.filters.filtersButton")}
        </button>
      </div>

      <button
        onClick={onRefresh}
        disabled={isRefreshing}
        className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--ink-primary)] disabled:opacity-60"
      >
        <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
        {t("common.refresh")}
      </button>
    </div>
  );
}
