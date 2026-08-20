// Project path: src/components/admin/warehouses/WarehousesToolbar.tsx
//
// All filtering/sorting is client-side — GET /api/Warehouses takes no query
// params. Export has no backing endpoint; the button is kept per the brief but
// shows a "not available yet" toast rather than silently doing nothing (see spec §9).

import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { Search, RefreshCw, Plus, Download, X } from "lucide-react";

export interface WarehousesFilters {
  search: string;
  branchId: "all" | string;
  status: "all" | "active" | "inactive";
}

export type WarehousesSortOption = "nameAsc" | "nameDesc" | "codeAsc";

interface BranchOption {
  value: string;
  label: string;
}

interface WarehousesToolbarProps {
  filters: WarehousesFilters;
  onFiltersChange: (filters: WarehousesFilters) => void;
  sortValue: WarehousesSortOption;
  onSortChange: (value: WarehousesSortOption) => void;
  branches: BranchOption[];
  onRefresh: () => void;
  onCreate: () => void;
  isRefreshing?: boolean;
  canManageAccess: boolean;
}

const DEFAULT_FILTERS: WarehousesFilters = {
  search: "",
  branchId: "all",
  status: "all",
};

export function WarehousesToolbar({
  filters,
  onFiltersChange,
  sortValue,
  onSortChange,
  branches,
  onRefresh,
  onCreate,
  isRefreshing,
  canManageAccess
}: WarehousesToolbarProps) {
  const { t } = useTranslation();
  const patch = (partial: Partial<WarehousesFilters>) =>
    onFiltersChange({ ...filters, ...partial });

  const hasActiveFilters =
    filters.search !== "" || filters.branchId !== "all" || filters.status !== "all";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:max-w-xs">
            <Search
              size={16}
              className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[--ink-tertiary]"
            />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => patch({ search: e.target.value })}
              placeholder={t("warehouses.toolbar.searchPlaceholder")}
              className="w-full rounded-md border border-[--hairline] bg-[--sunken] py-2 ps-9 pe-3 text-sm outline-none focus:border-[--signal] focus:ring-2 focus:ring-[--synapse]/30"
            />
          </div>

          <select
            value={filters.branchId}
            onChange={(e) => patch({ branchId: e.target.value })}
            className="rounded-md border border-[--hairline] bg-[--sunken] px-3 py-2 text-sm outline-none focus:border-[--signal]"
          >
            <option value="all">{t("warehouses.toolbar.allBranches")}</option>
            {branches.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </select>

          <select
            value={filters.status}
            onChange={(e) =>
              patch({ status: e.target.value as WarehousesFilters["status"] })
            }
            className="rounded-md border border-[--hairline] bg-[--sunken] px-3 py-2 text-sm outline-none focus:border-[--signal]"
          >
            <option value="all">{t("warehouses.toolbar.allStatuses")}</option>
            <option value="active">{t("common.status.active")}</option>
            <option value="inactive">{t("common.status.inactive")}</option>
          </select>

          <select
            value={sortValue}
            onChange={(e) => onSortChange(e.target.value as WarehousesSortOption)}
            className="rounded-md border border-[--hairline] bg-[--sunken] px-3 py-2 text-sm outline-none focus:border-[--signal]"
          >
            <option value="nameAsc">{t("warehouses.toolbar.sortNameAsc")}</option>
            <option value="nameDesc">{t("warehouses.toolbar.sortNameDesc")}</option>
            <option value="codeAsc">{t("warehouses.toolbar.sortCode")}</option>
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => onFiltersChange(DEFAULT_FILTERS)}
              className="inline-flex items-center gap-1 text-sm text-[--ink-secondary] hover:text-[--ink-primary]"
            >
              <X size={14} />
              {t("warehouses.toolbar.reset")}
            </button>
          )}


        </div>

        {
          canManageAccess && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onRefresh}
                title={t("common.actions.refresh")}
                className="inline-flex items-center justify-center rounded-md border border-[--hairline] p-2 text-[--ink-secondary] hover:bg-[--sunken]"
              >
                <RefreshCw size={16} className={isRefreshing ? "animate-spin" : undefined} />
              </button>
              <button
                type="button"
                onClick={onCreate}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-[--signal] px-4 py-2 text-sm font-medium text-white hover:bg-[--signal-hover]"
              >
                <Plus size={16} />
                {t("warehouses.actions.create")}
              </button>
            </div>
          )
        }

      </div>
    </div>
  );
}
