// Project path: src/components/admin/purchase-orders/PurchaseOrdersTable.tsx
//
// ASSUMPTION: DataTable's row-selection prop names are inferred, same caveat
// noted in Warehouses/Suppliers — verify before merging.
//
// Bulk bar only offers Cancel, and only enables when every selected order's
// status allows it (Draft/Submitted/Approved) — see spec §5.

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FileText, XCircle } from "lucide-react";
import { DataTable, type DataTableColumn } from "../../common/DataTable";
import { PurchaseOrderStatusBadge } from "./PurchaseOrderStatusBadge";
import { WarningsBadge } from "./WarningsBadge";
import { PurchaseOrderActionMenu } from "./PurchaseOrderActionMenu";
import { canPerform } from "../../../utils/purchaseOrderWorkflow";
import type { PurchaseOrderResponse } from "../../../types/purchaseOrders.types";
import { hasAnyPermission } from "@/utils/permissions";

interface PurchaseOrdersTableProps {
  orders: PurchaseOrderResponse[];
  isLoading: boolean;
  hasActiveFilters: boolean;
  onView: (order: PurchaseOrderResponse) => void;
  onEdit: (order: PurchaseOrderResponse) => void;
  onSubmit: (order: PurchaseOrderResponse) => void;
  onApprove: (order: PurchaseOrderResponse) => void;
  onReceive: (order: PurchaseOrderResponse) => void;
  onCancel: (order: PurchaseOrderResponse) => void;
  onPrint: (order: PurchaseOrderResponse) => void;
  onDuplicate: (order: PurchaseOrderResponse) => void;
  onBulkCancel: (ids: string[]) => void;
  onCreate: () => void;
}

function receivingProgress(order: PurchaseOrderResponse): number {
  const totalOrdered = order.lines.reduce((s, l) => s + l.quantity, 0);
  const totalReceived = order.lines.reduce((s, l) => s + l.receivedQuantity, 0);
  if (totalOrdered === 0) return 0;
  return Math.round((totalReceived / totalOrdered) * 100);
}

export function PurchaseOrdersTable({
  orders,
  isLoading,
  hasActiveFilters,
  onView,
  onEdit,
  onSubmit,
  onApprove,
  onReceive,
  onCancel,
  onPrint,
  onDuplicate,
  onBulkCancel,
  onCreate,
}: PurchaseOrdersTableProps) {
  const { t } = useTranslation();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const canManageAccess = hasAnyPermission(["purchasing.orders.manage"])
    const canCteateAccess = hasAnyPermission(["purchasing.orders.create"])
    const canApproveAccess = hasAnyPermission(["purchasing.orders.approve"])
    const canCancelAccess = hasAnyPermission(["purchasing.orders.cancel"])
    const canReceiveAccess = hasAnyPermission(["purchasing.orders.receive"])
  
    const access = {
      canApproveAccess,
      canManageAccess,
      canCteateAccess,
      canCancelAccess,
      canReceiveAccess
    }

  const selectedOrders = orders.filter((o) => selectedIds.includes(o.id));
  const canBulkCancel =
    selectedOrders.length > 0 && selectedOrders.every((o) => canPerform("cancel", o.status, access));

  const columns: DataTableColumn<PurchaseOrderResponse>[] = [
    {
      id: "orderNumber",
      header: t("purchaseOrders.table.orderNumber"),
      cell: (order) => (
        <button type="button" onClick={() => onView(order)} className="font-mono text-sm font-medium text-[--ink-primary] hover:text-[--signal]">
          {order.orderNumber}
        </button>
      ),
    },
    {
      id: "supplier",
      header: t("purchaseOrders.table.supplier"),
      cell: (order) => (
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[--signal]/10 text-[10px] font-medium text-[--signal]">
            {order.supplierName.slice(0, 2).toUpperCase()}
          </span>
          <span className="text-sm text-[--ink-secondary]">{order.supplierName}</span>
        </div>
      ),
    },
    {
      id: "warehouse",
      header: t("purchaseOrders.table.warehouse"),
      cell: (order) => <span className="text-sm text-[--ink-secondary]">{order.warehouseName}</span>,
    },
    {
      id: "status",
      header: t("purchaseOrders.table.status"),
      cell: (order) => <PurchaseOrderStatusBadge status={order.status} />,
    },
    {
      id: "orderDate",
      header: t("purchaseOrders.table.orderDate"),
      cell: (order) => (
        <span className="text-sm text-[--ink-secondary]">{new Date(order.orderDate).toLocaleDateString()}</span>
      ),
    },
    {
      id: "totalAmount",
      header: t("purchaseOrders.table.total"),
      cell: (order) => <span className="text-sm font-medium text-[--ink-primary]">{order.totalAmount.toFixed(2)}</span>,
    },
    {
      id: "receiving",
      header: t("purchaseOrders.table.receiving"),
      cell: (order) => (
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[--sunken]">
            <div className="h-full bg-[--signal]" style={{ width: `${receivingProgress(order)}%` }} />
          </div>
          <span className="text-xs text-[--ink-tertiary]">{receivingProgress(order)}%</span>
        </div>
      ),
    },
    {
      id: "warnings",
      header: t("purchaseOrders.table.warnings"),
      cell: (order) => <WarningsBadge warnings={order.warnings} />,
    },
    {
      id: "actions",
      header: "",
      cell: (order) => (
        <PurchaseOrderActionMenu
          order={order}
          onView={onView}
          onEdit={onEdit}
          onSubmit={onSubmit}
          onApprove={onApprove}
          onReceive={onReceive}
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
            {t("purchaseOrders.bulk.selectedCount", { count: selectedIds.length })}
          </span>
          <button
            type="button"
            disabled={!canBulkCancel}
            onClick={() => {
              onBulkCancel(selectedIds);
              setSelectedIds([]);
            }}
            title={!canBulkCancel ? t("purchaseOrders.bulk.cancelDisabledHint") : undefined}
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-[--error] hover:bg-[--error]/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <XCircle size={14} />
            {t("purchaseOrders.bulk.cancelSelected")}
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
              <p className="font-medium text-[--ink-primary]">{t("purchaseOrders.empty.filteredTitle")}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <FileText size={32} className="text-[--ink-tertiary]" />
              <p className="font-medium text-[--ink-primary]">{t("purchaseOrders.empty.title")}</p>
              <p className="max-w-sm text-sm text-[--ink-secondary]">{t("purchaseOrders.empty.description")}</p>
              <button
                type="button"
                onClick={onCreate}
                className="mt-1 rounded-md bg-[--signal] px-4 py-2 text-sm font-medium text-white hover:bg-[--signal-hover]"
              >
                {t("purchaseOrders.actions.create")}
              </button>
            </div>
          )
        }
      />
    </div>
  );
}
