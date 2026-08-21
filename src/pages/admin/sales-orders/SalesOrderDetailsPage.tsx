// Project path: src/pages/admin/sales-orders/SalesOrderDetailsPage.tsx
// Route: /sales-orders/:id

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Printer, Clock, ShieldQuestion } from "lucide-react";
import { useSalesOrder } from "../../../hooks/useSalesOrders";
import { SalesOrderStatusBadge } from "../../../components/admin/sales-orders/SalesOrderStatusBadge";
import { SalesOrderStatusTracker } from "../../../components/admin/sales-orders/SalesOrderStatusTracker";
import { StockWarningsPanel } from "../../../components/admin/sales-orders/StockWarningsPanel";
import { LineItemsReadOnlyTable } from "../../../components/admin/sales-orders/LineItemsReadOnlyTable";
import {
  SalesOrderActionDialog,
  type SalesOrderDialogAction,
} from "../../../components/admin/sales-orders/SalesOrderActionDialog";
import { canPerform } from "../../../utils/salesOrderWorkflow";
import { hasAnyPermission } from "@/utils/permissions";
import { getUserPermissions } from "@/pages/common/LoginPage";

export function SalesOrderDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: order, isLoading } = useSalesOrder(id);
  const [dialogAction, setDialogAction] = useState<SalesOrderDialogAction | null>(null);
  const canCancelAccess = hasAnyPermission(["sales.orders.cancel"], getUserPermissions());
  const canShipAccess = hasAnyPermission(["sales.orders.ship"], getUserPermissions());
  const canApproveAccess = hasAnyPermission(["sales.orders.approve"], getUserPermissions());
  const canCreateAccess = hasAnyPermission(["sales.orders.create"], getUserPermissions())

  const access = {
    canCancelAccess,
    canShipAccess,
    canApproveAccess,
    canCreateAccess
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
    return <div className="p-6 text-center text-sm text-[--ink-secondary]">{t("salesOrders.details.notFound")}</div>;
  }

  const totalOrdered = order.lines.reduce((s, l) => s + l.quantity, 0);
  const totalShipped = order.lines.reduce((s, l) => s + l.shippedQuantity, 0);

  // Frontend-only "days since order" caption — pure date math, not an SLA claim.
  const daysSinceOrder = Math.max(
    0,
    Math.round((Date.now() - new Date(order.orderDate).getTime()) / (1000 * 60 * 60 * 24))
  );

  return (
    <div className="flex flex-col gap-6 p-6">
      <button
        type="button"
        onClick={() => navigate("/sales/sales-orders")}
        className="flex w-fit items-center gap-1.5 text-sm text-[--ink-secondary] hover:text-[--ink-primary]"
      >
        <ArrowLeft size={16} className="rtl:rotate-180" />
        {t("salesOrders.details.back")}
      </button>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-mono text-2xl font-semibold text-[--ink-primary]">{order.orderNumber}</h1>
            <SalesOrderStatusBadge status={order.status} />
          </div>
          <p className="mt-1 text-sm text-[--ink-secondary]">
            {order.customerName} · {order.warehouseName}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canPerform("edit", order.status, access) && (
            <button
              type="button"
              onClick={() => navigate(`/sales/sales-orders/${order.id}/edit`)}
              className="rounded-md border border-[--hairline] px-3 py-2 text-sm font-medium text-[--ink-primary] hover:bg-[--sunken]"
            >
              {t("salesOrders.actions.edit")}
            </button>
          )}
          {canPerform("submit", order.status, access) && (
            <button type="button" onClick={() => setDialogAction("submit")} className="rounded-md bg-[--signal] px-3 py-2 text-sm font-medium text-white hover:bg-[--signal-hover]">
              {t("salesOrders.actions.submit")}
            </button>
          )}
          {(canPerform("approve", order.status, access))&& (
            <button type="button" onClick={() => setDialogAction("approve")} className="rounded-md bg-[--signal] px-3 py-2 text-sm font-medium text-white hover:bg-[--signal-hover]">
              {t("salesOrders.actions.approve")}
            </button>
          )}
          {(canPerform("ship", order.status, access)) && (
            <button
              type="button"
              onClick={() => navigate(`/sales/sales-orders/${order.id}/ship`)}
              className="rounded-md bg-[--signal] px-3 py-2 text-sm font-medium text-white hover:bg-[--signal-hover]"
            >
              {t("salesOrders.actions.ship")}
            </button>
          )}
          <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-md border border-[--hairline] px-3 py-2 text-sm font-medium text-[--ink-primary] hover:bg-[--sunken]">
            <Printer size={15} />
            {t("salesOrders.actions.print")}
          </button>
          {(canPerform("cancel", order.status, access)) && (
            <button
              type="button"
              onClick={() => setDialogAction("cancel")}
              className="rounded-md border border-[--hairline] px-3 py-2 text-sm font-medium text-[--error] hover:bg-[--error]/5"
            >
              {t("salesOrders.actions.cancel")}
            </button>
          )}
        </div>
      </div>

      <SalesOrderStatusTracker order={order} />

      <StockWarningsPanel warnings={order.stockWarnings} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-[--hairline] bg-[--panel] p-4">
          <p className="text-xs text-[--ink-tertiary]">{t("salesOrders.details.totalAmount")}</p>
          <p className="text-lg font-semibold text-[--ink-primary]">{order.totalAmount.toFixed(2)}</p>
        </div>
        <div className="rounded-lg border border-[--hairline] bg-[--panel] p-4">
          <p className="text-xs text-[--ink-tertiary]">{t("salesOrders.details.totalOrdered")}</p>
          <p className="text-lg font-semibold text-[--ink-primary]">{totalOrdered}</p>
        </div>
        <div className="rounded-lg border border-[--hairline] bg-[--panel] p-4">
          <p className="text-xs text-[--ink-tertiary]">{t("salesOrders.details.totalShipped")}</p>
          <p className="text-lg font-semibold text-[--ink-primary]">{totalShipped}</p>
        </div>
        <div className="rounded-lg border border-[--hairline] bg-[--panel] p-4">
          <p className="text-xs text-[--ink-tertiary]">{t("salesOrders.details.linesCount")}</p>
          <p className="text-lg font-semibold text-[--ink-primary]">{order.lines.length}</p>
        </div>
      </div>

      <div className="rounded-lg border border-[--hairline] bg-[--panel] p-4">
        <p className="text-xs text-[--ink-tertiary]">{t("salesOrders.fields.orderDate")}</p>
        <p className="text-sm text-[--ink-primary]">
          {new Date(order.orderDate).toLocaleDateString()}{" "}
          <span className="text-[--ink-tertiary]">
            ({t("salesOrders.details.daysSinceOrder", { count: daysSinceOrder })})
          </span>
        </p>
      </div>

      {order.notes && (
        <div className="rounded-lg border border-[--hairline] bg-[--panel] p-4">
          <p className="mb-1 text-xs text-[--ink-tertiary]">{t("salesOrders.fields.notes")}</p>
          <p className="text-sm text-[--ink-primary]">{order.notes}</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-[--ink-primary]">{t("salesOrders.details.lineItems")}</h2>
        <LineItemsReadOnlyTable lines={order.lines} />
      </div>

      {/* <div className="flex items-center gap-2 rounded-lg border border-dashed border-[--hairline] p-4 text-sm text-[--ink-tertiary]">
        <Clock size={16} />
        {t("salesOrders.details.activityComingSoon")}
      </div>
      <div className="flex items-center gap-2 rounded-lg border border-dashed border-[--hairline] p-4 text-sm text-[--ink-tertiary]">
        <ShieldQuestion size={16} />
        {t("salesOrders.details.auditComingSoon")}
      </div> */}

      <SalesOrderActionDialog action={dialogAction} order={order} onClose={() => setDialogAction(null)} />
    </div>
  );
}
