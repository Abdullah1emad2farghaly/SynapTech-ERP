// Project path: src/components/admin/sales-orders/SalesOrdersToolbar.tsx

import { useTranslation } from "react-i18next";
import { Search, RefreshCw, Plus } from "lucide-react";

interface SalesOrdersToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  onCreate: () => void;
  isRefreshing?: boolean;
  canCreateAccess: boolean;
}

export function SalesOrdersToolbar({
  searchValue,
  onSearchChange,
  onRefresh,
  onCreate,
  isRefreshing,
  canCreateAccess,
}: SalesOrdersToolbarProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-sm">
        <Search size={16} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[--ink-tertiary]" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t("salesOrders.toolbar.searchPlaceholder")}
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
              {t("salesOrders.actions.create")}
            </button>
          </div>
        )
      }


    </div>
  );
}
