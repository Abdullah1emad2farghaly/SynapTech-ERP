// Project path: src/components/admin/purchase-orders/PurchaseOrdersToolbar.tsx
//
// Export shows a "not available yet" toast — no export endpoint exists.

import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { Search, RefreshCw, Plus, Download } from "lucide-react";
import { hasAnyPermission } from "@/utils/permissions";

interface PurchaseOrdersToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  onCreate: () => void;
  isRefreshing?: boolean;
}

export function PurchaseOrdersToolbar({
  searchValue,
  onSearchChange,
  onRefresh,
  onCreate,
  isRefreshing,
}: PurchaseOrdersToolbarProps) {
  const { t } = useTranslation();
  const canCreateAccess = hasAnyPermission(["purchasing.orders.create"])

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-sm">
        <Search size={16} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[--ink-tertiary]" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t("purchaseOrders.toolbar.searchPlaceholder")}
          className="w-full rounded-md border border-[--hairline] bg-[--sunken] py-2 ps-9 pe-3 text-sm outline-none focus:border-[--signal] focus:ring-2 focus:ring-[--synapse]/30"
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onRefresh}
          title={t("common.actions.refresh")}
          className="inline-flex items-center justify-center rounded-md border border-[--hairline] p-2 text-[--ink-secondary] hover:bg-[--sunken]"
        >
          <RefreshCw size={16} className={isRefreshing ? "animate-spin" : undefined} />
        </button>
        {/* <button
          type="button"
          onClick={() => toast(t("purchaseOrders.toolbar.exportNotAvailable"))}
          className="inline-flex items-center justify-center gap-2 rounded-md border border-[--hairline] px-3 py-2 text-sm font-medium text-[--ink-secondary] hover:bg-[--sunken]"
        >
          <Download size={16} />
          {t("common.actions.export")}
        </button> */}
        
        <button
          type="button"
          onClick={onCreate}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-[--signal] px-4 py-2 text-sm font-medium text-white hover:bg-[--signal-hover]"
        >
          <Plus size={16} />
          {t("purchaseOrders.actions.create")}
        </button>
      </div>
    </div>
  );
}
