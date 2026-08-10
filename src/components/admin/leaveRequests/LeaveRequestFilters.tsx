// Intended path: src/components/admin/leaveRequests/LeaveRequestFilters.tsx
//
// Desktop: rendered inline as a popover/panel by the parent. Mobile: the parent
// wraps this same content in the existing `Drawer` used as a filter sheet
// (same pattern as Employees' mobile filters) — this component itself is
// presentation-only and layout-agnostic.

import { useTranslation } from "react-i18next";
import { EmployeeSelector } from "./EmployeeSelector";
import { LeaveTypeSelector } from "./LeaveTypeSelector";

export interface LeaveRequestFiltersState {
  employeeId: string;
  leaveType: string;
  startDateFrom: string;
  startDateTo: string;
}

export const EMPTY_LEAVE_REQUEST_FILTERS: LeaveRequestFiltersState = {
  employeeId: "",
  leaveType: "",
  startDateFrom: "",
  startDateTo: "",
};

interface LeaveRequestFiltersProps {
  value: LeaveRequestFiltersState;
  onChange: (value: LeaveRequestFiltersState) => void;
  onClearAll: () => void;
}

export function LeaveRequestFilters({ value, onChange, onClearAll }: LeaveRequestFiltersProps) {
  const { t } = useTranslation();

  const update = (patch: Partial<LeaveRequestFiltersState>) => onChange({ ...value, ...patch });

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <label className="block text-xs font-medium mb-1" style={{ color: "var(--ink-secondary)" }}>
          {t("leaveRequests.filters.employee")}
        </label>
        <EmployeeSelector value={value.employeeId} onChange={(id) => update({ employeeId: id })} />
      </div>

      <div>
        <label className="block text-xs font-medium mb-1" style={{ color: "var(--ink-secondary)" }}>
          {t("leaveRequests.filters.leaveType")}
        </label>
        <LeaveTypeSelector value={value.leaveType} onChange={(v) => update({ leaveType: v })} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "var(--ink-secondary)" }}>
            {t("leaveRequests.filters.startDateFrom")}
          </label>
          <input
            type="date"
            value={value.startDateFrom}
            onChange={(e) => update({ startDateFrom: e.target.value })}
            className="w-full rounded-md px-3 py-2 text-sm"
            style={{ backgroundColor: "var(--sunken)", border: "1px solid var(--hairline)", color: "var(--ink-primary)" }}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "var(--ink-secondary)" }}>
            {t("leaveRequests.filters.startDateTo")}
          </label>
          <input
            type="date"
            value={value.startDateTo}
            onChange={(e) => update({ startDateTo: e.target.value })}
            className="w-full rounded-md px-3 py-2 text-sm"
            style={{ backgroundColor: "var(--sunken)", border: "1px solid var(--hairline)", color: "var(--ink-primary)" }}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={onClearAll}
        className="self-start text-sm font-medium"
        style={{ color: "var(--signal)" }}
      >
        {t("leaveRequests.filters.clearAll")}
      </button>
    </div>
  );
}

export function applyLeaveRequestFilters<T extends {
  employeeId: string;
  leaveType: string;
  startDate: string;
}>(rows: T[], filters: LeaveRequestFiltersState): T[] {
  return rows.filter((row) => {
    if (filters.employeeId && row.employeeId !== filters.employeeId) return false;
    if (filters.leaveType && row.leaveType !== filters.leaveType) return false;
    if (filters.startDateFrom && row.startDate < filters.startDateFrom) return false;
    if (filters.startDateTo && row.startDate > filters.startDateTo) return false;
    return true;
  });
}
