// Project path: src/components/admin/purchase-orders/PurchaseOrdersFilters.tsx
//
// All client-side — GET /api/PurchaseOrders has no confirmed query-param
// contract. Supplier/Warehouse filter options are the distinct names present
// in the already-fetched list, not separate lookup calls (see spec §5).
// Saved Filters are cut — no persistence layer exists (see spec §5).

import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { PurchaseOrderStatusBadge } from "./PurchaseOrderStatusBadge";
import { getNormalFlowSteps } from "../../../utils/purchaseOrderWorkflow";

export interface PurchaseOrdersFiltersState {
  statuses: string[];
  supplierName: "all" | string;
  warehouseName: "all" | string;
  orderDateFrom: string;
  orderDateTo: string;
  expectedDateFrom: string;
  expectedDateTo: string;
  hasWarnings: "all" | "yes" | "no";
}

export const DEFAULT_PO_FILTERS: PurchaseOrdersFiltersState = {
  statuses: [],
  supplierName: "all",
  warehouseName: "all",
  orderDateFrom: "",
  orderDateTo: "",
  expectedDateFrom: "",
  expectedDateTo: "",
  hasWarnings: "all",
};

interface PurchaseOrdersFiltersProps {
  filters: PurchaseOrdersFiltersState;
  onFiltersChange: (filters: PurchaseOrdersFiltersState) => void;
  supplierNames: string[];
  warehouseNames: string[];
  statusCounts: Record<string, number>;
}

export function PurchaseOrdersFilters({
  filters,
  onFiltersChange,
  supplierNames,
  warehouseNames,
  statusCounts,
}: PurchaseOrdersFiltersProps) {
  const { t } = useTranslation();
  const patch = (partial: Partial<PurchaseOrdersFiltersState>) =>
    onFiltersChange({ ...filters, ...partial });

  const toggleStatus = (status: string) => {
    patch({
      statuses: filters.statuses.includes(status)
        ? filters.statuses.filter((s) => s !== status)
        : [...filters.statuses, status],
    });
  };

  const hasActiveFilters =
    filters.statuses.length > 0 ||
    filters.supplierName !== "all" ||
    filters.warehouseName !== "all" ||
    filters.orderDateFrom !== "" ||
    filters.orderDateTo !== "" ||
    filters.hasWarnings !== "all";

  return (
    <div className="flex flex-col gap-3">
      {/* Quick filter chips */}
      <div className="flex flex-wrap items-center gap-2">
        {[...getNormalFlowSteps(), "Cancelled"].map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => toggleStatus(status)}
            className={`rounded-full border px-1 py-0.5 transition-colors ${
              filters.statuses.includes(status)
                ? "border-[--signal] ring-1 ring-[--signal]"
                : "border-transparent opacity-70 hover:opacity-100"
            }`}
          >
            <span className="inline-flex items-center gap-1">
              <PurchaseOrderStatusBadge status={status} />
              <span className="pe-1 text-[10px] text-[--ink-tertiary]">
                {statusCounts[status] ?? 0}
              </span>
            </span>
          </button>
        ))}
      </div>

      {/* Advanced filters */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[--hairline] bg-[--panel] p-3">
        <select
          value={filters.supplierName}
          onChange={(e) => patch({ supplierName: e.target.value })}
          className="rounded-md border border-[--hairline] bg-[--sunken] px-2.5 py-1.5 text-xs outline-none focus:border-[--signal]"
        >
          <option value="all">{t("purchaseOrders.filters.allSuppliers")}</option>
          {supplierNames.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>

        <select
          value={filters.warehouseName}
          onChange={(e) => patch({ warehouseName: e.target.value })}
          className="rounded-md border border-[--hairline] bg-[--sunken] px-2.5 py-1.5 text-xs outline-none focus:border-[--signal]"
        >
          <option value="all">{t("purchaseOrders.filters.allWarehouses")}</option>
          {warehouseNames.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>

        <input
          type="date"
          value={filters.orderDateFrom}
          onChange={(e) => patch({ orderDateFrom: e.target.value })}
          className="rounded-md border border-[--hairline] bg-[--sunken] px-2.5 py-1.5 text-xs outline-none focus:border-[--signal]"
        />
        <span className="text-xs text-[--ink-tertiary]">{t("purchaseOrders.filters.to")}</span>
        <input
          type="date"
          value={filters.orderDateTo}
          onChange={(e) => patch({ orderDateTo: e.target.value })}
          className="rounded-md border border-[--hairline] bg-[--sunken] px-2.5 py-1.5 text-xs outline-none focus:border-[--signal]"
        />

        <select
          value={filters.hasWarnings}
          onChange={(e) => patch({ hasWarnings: e.target.value as PurchaseOrdersFiltersState["hasWarnings"] })}
          className="rounded-md border border-[--hairline] bg-[--sunken] px-2.5 py-1.5 text-xs outline-none focus:border-[--signal]"
        >
          <option value="all">{t("purchaseOrders.filters.warningsAny")}</option>
          <option value="yes">{t("purchaseOrders.filters.warningsYes")}</option>
          <option value="no">{t("purchaseOrders.filters.warningsNo")}</option>
        </select>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => onFiltersChange(DEFAULT_PO_FILTERS)}
            className="ms-auto inline-flex items-center gap-1 text-xs text-[--ink-secondary] hover:text-[--ink-primary]"
          >
            <X size={13} />
            {t("purchaseOrders.filters.reset")}
          </button>
        )}
      </div>
    </div>
  );
}
