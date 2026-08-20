// Project path: src/components/admin/suppliers/SuppliersToolbar.tsx
//
// Search/filter/sort are client-side — GET /api/Suppliers takes no query
// params per the confirmed contract.

import { useTranslation } from "react-i18next";
import { Search, RefreshCw, Plus } from "lucide-react";

export interface SuppliersFilters {
  search: string;
  status: "all" | "active" | "inactive";
}

export type SuppliersSortOption = "nameAsc" | "nameDesc";

interface SuppliersToolbarProps {
  filters: SuppliersFilters;
  onFiltersChange: (filters: SuppliersFilters) => void;
  sortValue: SuppliersSortOption;
  onSortChange: (value: SuppliersSortOption) => void;
  onRefresh: () => void;
  onCreate: () => void;
  isRefreshing?: boolean;
  canManageAccess: boolean;
}

export function SuppliersToolbar({
  filters,
  onFiltersChange,
  sortValue,
  onSortChange,
  onRefresh,
  onCreate,
  isRefreshing,
  canManageAccess
}: SuppliersToolbarProps) {
  const { t } = useTranslation();
  const patch = (partial: Partial<SuppliersFilters>) =>
    onFiltersChange({ ...filters, ...partial });

  return (
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
            placeholder={t("suppliers.toolbar.searchPlaceholder")}
            className="w-full rounded-md border border-[--hairline] bg-[--sunken] py-2 ps-9 pe-3 text-sm outline-none focus:border-[--signal] focus:ring-2 focus:ring-[--synapse]/30"
          />
        </div>

        <select
          value={filters.status}
          onChange={(e) =>
            patch({ status: e.target.value as SuppliersFilters["status"] })
          }
          className="rounded-md border border-[--hairline] bg-[--sunken] px-3 py-2 text-sm outline-none focus:border-[--signal]"
        >
          <option value="all">{t("suppliers.toolbar.allStatuses")}</option>
          <option value="active">{t("common.status.active")}</option>
          <option value="inactive">{t("common.status.inactive")}</option>
        </select>

        <select
          value={sortValue}
          onChange={(e) => onSortChange(e.target.value as SuppliersSortOption)}
          className="rounded-md border border-[--hairline] bg-[--sunken] px-3 py-2 text-sm outline-none focus:border-[--signal]"
        >
          <option value="nameAsc">{t("suppliers.toolbar.sortNameAsc")}</option>
          <option value="nameDesc">{t("suppliers.toolbar.sortNameDesc")}</option>
        </select>

        <button
          type="button"
          onClick={onRefresh}
          title={t("common.actions.refresh")}
          className="inline-flex items-center justify-center rounded-md border border-[--hairline] p-2 text-[--ink-secondary] hover:bg-[--sunken]"
        >
          <RefreshCw size={16} className={isRefreshing ? "animate-spin" : undefined} />
        </button>
      </div>

      {
        canManageAccess && (
          <button
            type="button"
            onClick={onCreate}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-[--signal] px-4 py-2 text-sm font-medium text-white hover:bg-[--signal-hover]"
          >
            <Plus size={16} />
            {t("suppliers.actions.create")}
          </button>
        )
      }

    </div>
  );
}
