// Project path: src/components/admin/sales-orders/SalesOrdersFilters.tsx
//
// All client-side — GET /api/SalesOrders has no confirmed query-param
// contract. Customer/Warehouse filter options come from the distinct names
// already present in the fetched list, not separate lookup calls.

import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { SalesOrderStatusBadge } from "./SalesOrderStatusBadge";
import { getNormalFlowSteps } from "../../../utils/salesOrderWorkflow";

export interface SalesOrdersFiltersState {
  statuses: string[];
  customerName: "all" | string;
  warehouseName: "all" | string;
  orderDateFrom: string;
  orderDateTo: string;
  hasWarnings: "all" | "yes" | "no";
}

export const DEFAULT_SO_FILTERS: SalesOrdersFiltersState = {
  statuses: [],
  customerName: "all",
  warehouseName: "all",
  orderDateFrom: "",
  orderDateTo: "",
  hasWarnings: "all",
};

interface SalesOrdersFiltersProps {
  filters: SalesOrdersFiltersState;
  onFiltersChange: (filters: SalesOrdersFiltersState) => void;
  customerNames: string[];
  warehouseNames: string[];
  statusCounts: Record<string, number>;
}

export function SalesOrdersFilters({
  filters,
  onFiltersChange,
  customerNames,
  warehouseNames,
  statusCounts,
}: SalesOrdersFiltersProps) {
  const { t } = useTranslation();
  const patch = (partial: Partial<SalesOrdersFiltersState>) =>
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
    filters.customerName !== "all" ||
    filters.warehouseName !== "all" ||
    filters.orderDateFrom !== "" ||
    filters.orderDateTo !== "" ||
    filters.hasWarnings !== "all";

  return (
    <div className="flex flex-col gap-3">
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
              <SalesOrderStatusBadge status={status} />
              <span className="pe-1 text-[10px] text-[--ink-tertiary]">{statusCounts[status] ?? 0}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[--hairline] bg-[--panel] p-3">
        <select
          value={filters.customerName}
          onChange={(e) => patch({ customerName: e.target.value })}
          className="rounded-md border border-[--hairline] bg-[--sunken] px-2.5 py-1.5 text-xs outline-none focus:border-[--signal]"
        >
          <option value="all">{t("salesOrders.filters.allCustomers")}</option>
          {customerNames.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>

        <select
          value={filters.warehouseName}
          onChange={(e) => patch({ warehouseName: e.target.value })}
          className="rounded-md border border-[--hairline] bg-[--sunken] px-2.5 py-1.5 text-xs outline-none focus:border-[--signal]"
        >
          <option value="all">{t("salesOrders.filters.allWarehouses")}</option>
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
        <span className="text-xs text-[--ink-tertiary]">{t("salesOrders.filters.to")}</span>
        <input
          type="date"
          value={filters.orderDateTo}
          onChange={(e) => patch({ orderDateTo: e.target.value })}
          className="rounded-md border border-[--hairline] bg-[--sunken] px-2.5 py-1.5 text-xs outline-none focus:border-[--signal]"
        />

        <select
          value={filters.hasWarnings}
          onChange={(e) => patch({ hasWarnings: e.target.value as SalesOrdersFiltersState["hasWarnings"] })}
          className="rounded-md border border-[--hairline] bg-[--sunken] px-2.5 py-1.5 text-xs outline-none focus:border-[--signal]"
        >
          <option value="all">{t("salesOrders.filters.warningsAny")}</option>
          <option value="yes">{t("salesOrders.filters.warningsYes")}</option>
          <option value="no">{t("salesOrders.filters.warningsNo")}</option>
        </select>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => onFiltersChange(DEFAULT_SO_FILTERS)}
            className="ms-auto inline-flex items-center gap-1 text-xs text-[--ink-secondary] hover:text-[--ink-primary]"
          >
            <X size={13} />
            {t("salesOrders.filters.reset")}
          </button>
        )}
      </div>
    </div>
  );
}
