// Project path: src/components/admin/journal-entries/JournalEntriesToolbar.tsx
//
// All filtering/sorting is client-side — GET /api/JournalEntries has no
// confirmed query-param contract. Export is cut: no export endpoint exists.

import { useTranslation } from "react-i18next";
import { Search, RefreshCw, Plus, SlidersHorizontal } from "lucide-react";
import { hasAnyPermission } from "@/utils/permissions";
import { getUserPermissions } from "@/pages/common/LoginPage";

export interface JournalEntriesFilters {
  search: string;
  status: "all" | "Draft" | "Posted" | "Reversed";
  dateFrom: string;
  dateTo: string;
  hasReversal: "all" | "yes" | "no";
}

export type JournalEntriesSortOption =
  | "dateNewest"
  | "dateOldest"
  | "entryNumber"
  | "status";

interface JournalEntriesToolbarProps {
  filters: JournalEntriesFilters;
  onFiltersChange: (filters: JournalEntriesFilters) => void;
  sortValue: JournalEntriesSortOption;
  onSortChange: (value: JournalEntriesSortOption) => void;
  onRefresh: () => void;
  onCreate: () => void;
  isRefreshing?: boolean;
}

export function JournalEntriesToolbar({
  filters,
  onFiltersChange,
  sortValue,
  onSortChange,
  onRefresh,
  onCreate,
  isRefreshing,
}: JournalEntriesToolbarProps) {
  const { t } = useTranslation();
  const canCreateAccess = hasAnyPermission(["accounting.journal.create"], getUserPermissions());


  const patch = (partial: Partial<JournalEntriesFilters>) =>
    onFiltersChange({ ...filters, ...partial });

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-[--hairline] bg-[--panel] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search
            size={16}
            className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[--ink-tertiary]"
          />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => patch({ search: e.target.value })}
            placeholder={t("journalEntries.toolbar.searchPlaceholder")}
            className="w-full rounded-md border border-[--hairline] bg-[--sunken] py-2 ps-9 pe-3 text-sm outline-none focus:border-[--signal] focus:ring-2 focus:ring-[--synapse]/30"
          />
        </div>

        {
          canCreateAccess && (
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
                {t("journalEntries.actions.create")}
              </button>
            </div>
          )
        }

      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-[--hairline] pt-3">
        <SlidersHorizontal size={14} className="text-[--ink-tertiary]" />

        <select
          value={filters.status}
          onChange={(e) => patch({ status: e.target.value as JournalEntriesFilters["status"] })}
          className="rounded-md border border-[--hairline] bg-[--sunken] px-2.5 py-1.5 text-xs outline-none focus:border-[--signal]"
        >
          <option value="all">{t("journalEntries.filters.allStatuses")}</option>
          <option value="Draft">{t("journalEntries.status.Draft")}</option>
          <option value="Posted">{t("journalEntries.status.Posted")}</option>
          <option value="Reversed">{t("journalEntries.status.Reversed")}</option>
        </select>

        <input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => patch({ dateFrom: e.target.value })}
          className="rounded-md border border-[--hairline] bg-[--sunken] px-2.5 py-1.5 text-xs outline-none focus:border-[--signal]"
        />
        <span className="text-xs text-[--ink-tertiary]">{t("journalEntries.filters.to")}</span>
        <input
          type="date"
          value={filters.dateTo}
          onChange={(e) => patch({ dateTo: e.target.value })}
          className="rounded-md border border-[--hairline] bg-[--sunken] px-2.5 py-1.5 text-xs outline-none focus:border-[--signal]"
        />

        <select
          value={filters.hasReversal}
          onChange={(e) => patch({ hasReversal: e.target.value as JournalEntriesFilters["hasReversal"] })}
          className="rounded-md border border-[--hairline] bg-[--sunken] px-2.5 py-1.5 text-xs outline-none focus:border-[--signal]"
        >
          <option value="all">{t("journalEntries.filters.reversalAny")}</option>
          <option value="yes">{t("journalEntries.filters.reversalYes")}</option>
          <option value="no">{t("journalEntries.filters.reversalNo")}</option>
        </select>

        <select
          value={sortValue}
          onChange={(e) => onSortChange(e.target.value as JournalEntriesSortOption)}
          className="ms-auto rounded-md border border-[--hairline] bg-[--sunken] px-2.5 py-1.5 text-xs outline-none focus:border-[--signal]"
        >
          <option value="dateNewest">{t("journalEntries.filters.sortNewest")}</option>
          <option value="dateOldest">{t("journalEntries.filters.sortOldest")}</option>
          <option value="entryNumber">{t("journalEntries.filters.sortEntryNumber")}</option>
          <option value="status">{t("journalEntries.filters.sortStatus")}</option>
        </select>
      </div>
    </div>
  );
}
