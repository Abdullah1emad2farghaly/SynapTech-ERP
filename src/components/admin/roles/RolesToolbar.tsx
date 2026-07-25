// Project path: src/components/admin/roles/RolesToolbar.tsx
//
// Search and sort are client-side only — GET /api/Roles has no confirmed
// query-param contract. Same precedent as Departments' full-list-load.
// Export/permission-filter/view-toggle from the brief are cut: no backend
// support and, for a full-list module like this, limited real value.

import { useTranslation } from "react-i18next";
import { Search, RefreshCw, Plus } from "lucide-react";

export type RolesSortOption = "nameAsc" | "nameDesc" | "permissionsDesc";

interface RolesToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  sortValue: RolesSortOption;
  onSortChange: (value: RolesSortOption) => void;
  onRefresh: () => void;
  onCreateRole: () => void;
  isRefreshing?: boolean;
}

export function RolesToolbar({
  searchValue,
  onSearchChange,
  sortValue,
  onSortChange,
  onRefresh,
  onCreateRole,
  isRefreshing,
}: RolesToolbarProps) {
  const { t } = useTranslation();

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
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t("roles.toolbar.searchPlaceholder")}
            className="w-full rounded-md border border-[--hairline] bg-[--sunken] py-2 ps-9 pe-3 text-sm text-[--ink-primary] outline-none transition-colors focus:border-[--signal] focus:ring-2 focus:ring-[--synapse]/30"
          />
        </div>

        <select
          value={sortValue}
          onChange={(e) => onSortChange(e.target.value as RolesSortOption)}
          className="rounded-md border border-[--hairline] bg-[--sunken] px-3 py-2 text-sm text-[--ink-primary] outline-none focus:border-[--signal] focus:ring-2 focus:ring-[--synapse]/30"
        >
          <option value="nameAsc">{t("roles.toolbar.sort.nameAsc")}</option>
          <option value="nameDesc">{t("roles.toolbar.sort.nameDesc")}</option>
          <option value="permissionsDesc">
            {t("roles.toolbar.sort.permissionsDesc")}
          </option>
        </select>

        <button
          type="button"
          onClick={onRefresh}
          title={t("common.actions.refresh")}
          className="inline-flex items-center justify-center rounded-md border border-[--hairline] p-2 text-[--ink-secondary] transition-colors hover:bg-[--sunken]"
        >
          <RefreshCw
            size={16}
            className={isRefreshing ? "animate-spin" : undefined}
          />
        </button>
      </div>

      <button
        type="button"
        onClick={onCreateRole}
        className="inline-flex items-center justify-center gap-2 rounded-md bg-[--signal] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[--signal-hover]"
      >
        <Plus size={16} />
        {t("roles.actions.createRole")}
      </button>
    </div>
  );
}
