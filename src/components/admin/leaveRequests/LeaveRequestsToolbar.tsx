// Intended path: src/components/admin/leaveRequests/LeaveRequestsToolbar.tsx

import { Plus, Search, SlidersHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { LeaveRequestFiltersState } from "./LeaveRequestFilters";

interface LeaveRequestsToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  statusFilter: string | null;
  onStatusFilterChange: (status: string | null) => void;
  activeFilterCount: number;
  onOpenAdvancedFilters: () => void;
  onCreateClick: () => void;
}

const STATUS_CHIPS: Array<{ value: string | null; labelKey: string }> = [
  { value: null, labelKey: "leaveRequests.filters.all" },
  { value: "Pending", labelKey: "leaveRequests.status.pending" },
  { value: "Approved", labelKey: "leaveRequests.status.approved" },
  { value: "Rejected", labelKey: "leaveRequests.status.rejected" },
  { value: "Cancelled", labelKey: "leaveRequests.status.cancelled" },
];

export function LeaveRequestsToolbar({
  searchValue,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  activeFilterCount,
  onOpenAdvancedFilters,
  onCreateClick,
}: LeaveRequestsToolbarProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search
            size={16}
            className="absolute top-1/2 -translate-y-1/2 start-3"
            style={{ color: "var(--ink-tertiary)" }}
          />
          <input
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t("leaveRequests.filters.searchPlaceholder")}
            className="w-full rounded-md ps-9 pe-3 py-2 text-sm outline-none"
            style={{ backgroundColor: "var(--sunken)", border: "1px solid var(--hairline)", color: "var(--ink-primary)" }}
          />
        </div>

        <button
          type="button"
          onClick={onOpenAdvancedFilters}
          className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm"
          style={{ border: "1px solid var(--hairline)", color: "var(--ink-secondary)" }}
        >
          <SlidersHorizontal size={14} />
          {t("leaveRequests.filters.filters")}
          {activeFilterCount > 0 && (
            <span
              className="rounded-full text-xs px-1.5"
              style={{ backgroundColor: "var(--signal)", color: "var(--on-signal)" }}
            >
              {activeFilterCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={onCreateClick}
          className="sm:ms-auto inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium"
          style={{ backgroundColor: "var(--signal)", color: "var(--on-signal)" }}
        >
          <Plus size={16} />
          {t("leaveRequests.actions.create")}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_CHIPS.map((chip) => {
          const isActive = statusFilter === chip.value;
          return (
            <button
              key={chip.labelKey}
              type="button"
              onClick={() => onStatusFilterChange(chip.value)}
              className="rounded-full px-3 py-1 text-xs font-medium"
              style={{
                backgroundColor: isActive ? "var(--signal)" : "var(--sunken)",
                color: isActive ? "var(--on-signal)" : "var(--ink-secondary)",
              }}
            >
              {t(chip.labelKey)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function countActiveFilters(filters: LeaveRequestFiltersState): number {
  let count = 0;
  if (filters.employeeId) count += 1;
  if (filters.leaveType) count += 1;
  if (filters.startDateFrom) count += 1;
  if (filters.startDateTo) count += 1;
  return count;
}
