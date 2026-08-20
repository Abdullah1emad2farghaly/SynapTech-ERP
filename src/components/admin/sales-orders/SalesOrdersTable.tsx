// Project path: src/components/admin/sales-orders/SalesOrdersTable.tsx
//
// ASSUMPTION: DataTable's row-selection prop names are inferred, same caveat
// noted in every other module — verify before merging.

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FileText, XCircle } from "lucide-react";
import { DataTable, type DataTableColumn } from "../../common/DataTable";
import { SalesOrderStatusBadge } from "./SalesOrderStatusBadge";
import { StockWarningsBadge } from "./StockWarningsBadge";
import { SalesOrderActionMenu } from "./SalesOrderActionMenu";
import { canPerform } from "../../../utils/salesOrderWorkflow";
import type { SalesOrderResponse } from "../../../types/salesOrders.types";
import { hasAnyPermission } from "@/utils/permissions";

interface SalesOrdersTableProps {
  orders: SalesOrderResponse[];
  isLoading: boolean;
  hasActiveFilters: boolean;
  onView: (order: SalesOrderResponse) => void;
  onEdit: (order: SalesOrderResponse) => void;
  onSubmit: (order: SalesOrderResponse) => void;
  onApprove: (order: SalesOrderResponse) => void;
  onShip: (order: SalesOrderResponse) => void;
  onCancel: (order: SalesOrderResponse) => void;
  onPrint: (order: SalesOrderResponse) => void;
  onDuplicate: (order: SalesOrderResponse) => void;
  onBulkCancel: (ids: string[]) => void;
  onCreate: () => void;
}

function shippingProgress(order: SalesOrderResponse): number {
  const totalOrdered = order.lines.reduce((s, l) => s + l.quantity, 0);
  const totalShipped = order.lines.reduce((s, l) => s + l.shippedQuantity, 0);
  if (totalOrdered === 0) return 0;
  return Math.round((totalShipped / totalOrdered) * 100);
}

export function SalesOrdersTable({
  orders,
  isLoading,
  hasActiveFilters,
  onView,
  onEdit,
  onSubmit,
  onApprove,
  onShip,
  onCancel,
  onPrint,
  onDuplicate,
  onBulkCancel,
  onCreate,
}: SalesOrdersTableProps) {
  const canCancelAccess = hasAnyPermission(["sales.orders.cancel"]);
  const canShipAccess = hasAnyPermission(["sales.orders.ship"]);
  const canApproveAccess = hasAnyPermission(["sales.orders.approve"]);
  const canCreateAccess = hasAnyPermission(["sales.orders.create"])

  const access = {
    canCancelAccess,
    canShipAccess,
    canApproveAccess,
    canCreateAccess
  }
  const { t } = useTranslation();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const selectedOrders = orders.filter((o) => selectedIds.includes(o.id));
  const canBulkCancel =
    selectedOrders.length > 0 && selectedOrders.every((o) => canPerform("cancel", o.status, access));

  const columns: DataTableColumn<SalesOrderResponse>[] = [
    {
      id: "orderNumber",
      header: t("salesOrders.table.orderNumber"),
      cell: (order) => (
        <button type="button" onClick={() => onView(order)} className="font-mono text-sm font-medium text-[--ink-primary] hover:text-[--signal]">
          {order.orderNumber}
        </button>
      ),
    },
    {
      id: "customer",
      header: t("salesOrders.table.customer"),
      cell: (order) => (
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[--signal]/10 text-[10px] font-medium text-[--signal]">
            {order.customerName.slice(0, 2).toUpperCase()}
          </span>
          <span className="text-sm text-[--ink-secondary]">{order.customerName}</span>
        </div>
      ),
    },
    {
      id: "warehouse",
      header: t("salesOrders.table.warehouse"),
      cell: (order) => <span className="text-sm text-[--ink-secondary]">{order.warehouseName}</span>,
    },
    {
      id: "orderDate",
      header: t("salesOrders.table.orderDate"),
      cell: (order) => (
        <span className="text-sm text-[--ink-secondary]">{new Date(order.orderDate).toLocaleDateString()}</span>
      ),
    },
    {
      id: "status",
      header: t("salesOrders.table.status"),
      cell: (order) => <SalesOrderStatusBadge status={order.status} />,
    },
    {
      id: "totalAmount",
      header: t("salesOrders.table.total"),
      cell: (order) => <span className="text-sm font-medium text-[--ink-primary]">{order.totalAmount.toFixed(2)}</span>,
    },
    {
      id: "shipping",
      header: t("salesOrders.table.shipping"),
      cell: (order) => (
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[--sunken]">
            <div className="h-full bg-[--signal]" style={{ width: `${shippingProgress(order)}%` }} />
          </div>
          <span className="text-xs text-[--ink-tertiary]">{shippingProgress(order)}%</span>
        </div>
      ),
    },
    {
      id: "warnings",
      header: t("salesOrders.table.warnings"),
      cell: (order) => <StockWarningsBadge warnings={order.stockWarnings} />,
    },
    {
      id: "actions",
      header: "",
      cell: (order) => (
        <SalesOrderActionMenu
          order={order}
          onView={onView}
          onEdit={onEdit}
          onSubmit={onSubmit}
          onApprove={onApprove}
          onShip={onShip}
          onCancel={onCancel}
          onPrint={onPrint}
          onDuplicate={onDuplicate}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      {selectedIds.length > 0 && (
        <div role="status" aria-live="polite" className="flex items-center justify-between rounded-md border border-[--hairline] bg-[--sunken] px-4 py-2.5">
          <span className="text-sm text-[--ink-primary]">
            {t("salesOrders.bulk.selectedCount", { count: selectedIds.length })}
          </span>
          <button
            type="button"
            disabled={!canBulkCancel}
            onClick={() => {
              onBulkCancel(selectedIds);
              setSelectedIds([]);
            }}
            title={!canBulkCancel ? t("salesOrders.bulk.cancelDisabledHint") : undefined}
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-[--error] hover:bg-[--error]/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <XCircle size={14} />
            {t("salesOrders.bulk.cancelSelected")}
          </button>
        </div>
      )}

      <DataTable
        columns={columns}
        rows={orders}
        getRowId={(order) => order.id}
        isLoading={isLoading}
        skeletonRowCount={6}
        // selectable
        // selectedIds={selectedIds}
        // onSelectionChange={setSelectedIds}
        emptyState={
          hasActiveFilters ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <FileText size={32} className="text-[--ink-tertiary]" />
              <p className="font-medium text-[--ink-primary]">{t("salesOrders.empty.filteredTitle")}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <FileText size={32} className="text-[--ink-tertiary]" />
              <p className="font-medium text-[--ink-primary]">{t("salesOrders.empty.title")}</p>
              <p className="max-w-sm text-sm text-[--ink-secondary]">{t("salesOrders.empty.description")}</p>
              <button
                type="button"
                onClick={onCreate}
                className="mt-1 rounded-md bg-[--signal] px-4 py-2 text-sm font-medium text-white hover:bg-[--signal-hover]"
              >
                {t("salesOrders.actions.create")}
              </button>
            </div>
          )
        }
      />
    </div>
  );
}
