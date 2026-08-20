// Project path: src/pages/admin/purchase-orders/PurchaseOrderDetailsPage.tsx
// Route: /purchase-orders/:id

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Printer, Clock, ShieldQuestion } from "lucide-react";
import { usePurchaseOrder } from "../../../hooks/usePurchaseOrders";
import { PurchaseOrderStatusBadge } from "../../../components/admin/purchase-orders/PurchaseOrderStatusBadge";
import { PurchaseOrderStatusTracker } from "../../../components/admin/purchase-orders/PurchaseOrderStatusTracker";
import { WarningsPanel } from "../../../components/admin/purchase-orders/WarningsPanel";
import { LineItemsReadOnlyTable } from "../../../components/admin/purchase-orders/LineItemsReadOnlyTable";
import {
  PurchaseOrderActionDialog,
  type PurchaseOrderDialogAction,
} from "../../../components/admin/purchase-orders/PurchaseOrderActionDialog";
import { canPerform } from "../../../utils/purchaseOrderWorkflow";
import { hasAnyPermission } from "@/utils/permissions";

export function PurchaseOrderDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: order, isLoading } = usePurchaseOrder(id);
  const [dialogAction, setDialogAction] = useState<PurchaseOrderDialogAction | null>(null);

  const canManageAccess = hasAnyPermission(["purchasing.orders.manage"])
  const canCteateAccess = hasAnyPermission(["purchasing.orders.create"])
  const canApproveAccess = hasAnyPermission(["purchasing.orders.approve"])
  const canCancelAccess = hasAnyPermission(["purchasing.orders.cancel"])
  const canReceiveAccess = hasAnyPermission(["purchasing.orders.receive"])

  const access = {
    canManageAccess,
    canCteateAccess,
    canApproveAccess,
    canCancelAccess,
    canReceiveAccess
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <div className="h-8 w-64 animate-pulse rounded bg-[--sunken]" />
        <div className="h-40 animate-pulse rounded-lg bg-[--sunken]" />
      </div>
    );
  }

  if (!order) {
    return <div className="p-6 text-center text-sm text-[--ink-secondary]">{t("purchaseOrders.details.notFound")}</div>;
  }

  const totalOrdered = order.lines.reduce((s, l) => s + l.quantity, 0);
  const totalReceived = order.lines.reduce((s, l) => s + l.receivedQuantity, 0);

  return (
    <div className="flex flex-col gap-6 p-6">
      <button
        type="button"
        onClick={() => navigate("/purchasing/purchase-orders")}
        className="flex w-fit items-center gap-1.5 text-sm text-[--ink-secondary] hover:text-[--ink-primary]"
      >
        <ArrowLeft size={16} className="rtl:rotate-180" />
        {t("purchaseOrders.details.back")}
      </button>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-mono text-2xl font-semibold text-[--ink-primary]">{order.orderNumber}</h1>
            <PurchaseOrderStatusBadge status={order.status} />
          </div>
          <p className="mt-1 text-sm text-[--ink-secondary]">
            {order.supplierName} · {order.warehouseName}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canPerform("edit", order.status, access) && (
            <button
              type="button"
              onClick={() => navigate(`/purchasing/purchase-orders/${order.id}/edit`)}
              className="rounded-md border border-[--hairline] px-3 py-2 text-sm font-medium text-[--ink-primary] hover:bg-[--sunken]"
            >
              {t("purchaseOrders.actions.edit")}
            </button>
          )}
          {canPerform("submit", order.status, access) && (
            <button type="button" onClick={() => setDialogAction("submit")} className="rounded-md bg-[--signal] px-3 py-2 text-sm font-medium text-white hover:bg-[--signal-hover]">
              {t("purchaseOrders.actions.submit")}
            </button>
          )}
          {canPerform("approve", order.status, access) && (
            <button type="button" onClick={() => setDialogAction("approve")} className="rounded-md bg-[--signal] px-3 py-2 text-sm font-medium text-white hover:bg-[--signal-hover]">
              {t("purchaseOrders.actions.approve")}
            </button>
          )}
          {canPerform("receive", order.status, access) && (
            <button
              type="button"
              onClick={() => navigate(`/purchasing/purchase-orders/${order.id}/receive`)}
              className="rounded-md bg-[--signal] px-3 py-2 text-sm font-medium text-white hover:bg-[--signal-hover]"
            >
              {t("purchaseOrders.actions.receive")}
            </button>
          )}
          <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-md border border-[--hairline] px-3 py-2 text-sm font-medium text-[--ink-primary] hover:bg-[--sunken]">
            <Printer size={15} />
            {t("purchaseOrders.actions.print")}
          </button>
          {canPerform("cancel", order.status, access) && (
            <button
              type="button"
              onClick={() => setDialogAction("cancel")}
              className="rounded-md border border-[--hairline] px-3 py-2 text-sm font-medium text-[--error] hover:bg-[--error]/5"
            >
              {t("purchaseOrders.actions.cancel")}
            </button>
          )}
        </div>
      </div>

      <PurchaseOrderStatusTracker order={order} />

      <WarningsPanel warnings={order.warnings} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-[--hairline] bg-[--panel] p-4">
          <p className="text-xs text-[--ink-tertiary]">{t("purchaseOrders.details.totalAmount")}</p>
          <p className="text-lg font-semibold text-[--ink-primary]">{order.totalAmount.toFixed(2)}</p>
        </div>
        <div className="rounded-lg border border-[--hairline] bg-[--panel] p-4">
          <p className="text-xs text-[--ink-tertiary]">{t("purchaseOrders.details.totalOrdered")}</p>
          <p className="text-lg font-semibold text-[--ink-primary]">{totalOrdered}</p>
        </div>
        <div className="rounded-lg border border-[--hairline] bg-[--panel] p-4">
          <p className="text-xs text-[--ink-tertiary]">{t("purchaseOrders.details.totalReceived")}</p>
          <p className="text-lg font-semibold text-[--ink-primary]">{totalReceived}</p>
        </div>
        <div className="rounded-lg border border-[--hairline] bg-[--panel] p-4">
          <p className="text-xs text-[--ink-tertiary]">{t("purchaseOrders.details.linesCount")}</p>
          <p className="text-lg font-semibold text-[--ink-primary]">{order.lines.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-[--hairline] bg-[--panel] p-4">
          <p className="text-xs text-[--ink-tertiary]">{t("purchaseOrders.fields.orderDate")}</p>
          <p className="text-sm text-[--ink-primary]">{new Date(order.orderDate).toLocaleDateString()}</p>
        </div>
        <div className="rounded-lg border border-[--hairline] bg-[--panel] p-4">
          <p className="text-xs text-[--ink-tertiary]">{t("purchaseOrders.fields.expectedDate")}</p>
          <p className="text-sm text-[--ink-primary]">{new Date(order.expectedDate).toLocaleDateString()}</p>
        </div>
      </div>

      {order.notes && (
        <div className="rounded-lg border border-[--hairline] bg-[--panel] p-4">
          <p className="mb-1 text-xs text-[--ink-tertiary]">{t("purchaseOrders.fields.notes")}</p>
          <p className="text-sm text-[--ink-primary]">{order.notes}</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-[--ink-primary]">{t("purchaseOrders.details.lineItems")}</h2>
        <LineItemsReadOnlyTable lines={order.lines} />
      </div>

      {/* <div className="flex items-center gap-2 rounded-lg border border-dashed border-[--hairline] p-4 text-sm text-[--ink-tertiary]">
        <Clock size={16} />
        {t("purchaseOrders.details.activityComingSoon")}
      </div>
      <div className="flex items-center gap-2 rounded-lg border border-dashed border-[--hairline] p-4 text-sm text-[--ink-tertiary]">
        <ShieldQuestion size={16} />
        {t("purchaseOrders.details.auditComingSoon")}
      </div> */}

      <PurchaseOrderActionDialog action={dialogAction} order={order} onClose={() => setDialogAction(null)} />
    </div>
  );
}
