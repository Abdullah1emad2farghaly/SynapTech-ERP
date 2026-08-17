// Project path: src/pages/admin/purchase-orders/ReceiveGoodsPage.tsx
// Route: /purchase-orders/:id/receive
//
// Own dedicated page, not a drawer/modal — a distinct warehouse-floor task
// with its own validation (see spec §12). Only reachable for Approved/
// PartiallyReceived orders; redirects otherwise. Zero-quantity rows are
// omitted from the request, not sent as explicit zeros.

import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { ArrowLeft, PackageCheck } from "lucide-react";
import { usePurchaseOrder } from "../../../hooks/usePurchaseOrders";
import { useReceivePurchaseOrderGoods } from "../../../hooks/usePurchaseOrderMutations";
import { canPerform } from "../../../utils/purchaseOrderWorkflow";
import type { ReceivedLineRequest } from "../../../types/purchaseOrders.types";
import axios from "axios";
import { handleErrors } from "@/utils/HandleErrors";

export function ReceiveGoodsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: order, isLoading } = usePurchaseOrder(id);
  const receiveGoods = useReceivePurchaseOrderGoods(id ?? "");

  const [receivingNow, setReceivingNow] = useState<Record<string, number>>({});

  const orders = order?.lines ?? [];

  const setQuantity = (lineId: string, remaining: number, raw: number) => {
    const clamped = Math.max(0, Math.min(remaining, Number.isFinite(raw) ? raw : 0));
    setReceivingNow((prev) => ({ ...prev, [lineId]: clamped }));
  };

  const totals = useMemo(() => {
    const totalRemaining = orders.reduce((s, l) => s + (l.quantity - l.receivedQuantity), 0);
    const totalReceivingNow = orders.reduce((s, l) => s + (receivingNow[l.id] ?? 0), 0);
    return { totalRemaining, totalReceivingNow };
  }, [orders, receivingNow]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <div className="h-8 w-64 animate-pulse rounded bg-[--sunken]" />
        <div className="h-64 animate-pulse rounded-lg bg-[--sunken]" />
      </div>
    );
  }

  if (!order) {
    return <div className="p-6 text-center text-sm text-[--ink-secondary]">{t("purchaseOrders.details.notFound")}</div>;
  }

  if (!canPerform("receive", order.status)) {
    navigate(`/purchase-orders/${order.id}`);
    toast.error(t("purchaseOrders.receive.notReceivable"));
    return null;
  }

  const handleSubmit = async () => {
    const receivedLines: ReceivedLineRequest[] = orders
      .filter((l) => (receivingNow[l.id] ?? 0) > 0)
      .map((l) => ({ lineId: l.id, quantityReceived: receivingNow[l.id] }));

    if (receivedLines.length === 0) {
      toast.error(t("purchaseOrders.receive.nothingToReceive"));
      return;
    }

    try {
      console.log("receivedLines", receivedLines);
      await receiveGoods.mutateAsync({ lines: receivedLines });
      toast.success(t("purchaseOrders.toasts.received"));
      navigate(`/inventory/purchase-orders/${order.id}`);
    } catch (error) {
      if(axios.isAxiosError(error)){
        handleErrors(error.response?.data.errors);
      }else
        toast.error(t("common.errors.actionFailed"));
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 pb-28">
      <button
        type="button"
        onClick={() => navigate(`/inventory/purchase-orders/${order.id}`)}
        className="flex w-fit items-center gap-1.5 text-sm text-[--ink-secondary] hover:text-[--ink-primary]"
      >
        <ArrowLeft size={16} className="rtl:rotate-180" />
        {t("purchaseOrders.details.back")}
      </button>

      <div>
        <h1 className="text-2xl font-semibold text-[--ink-primary]">{t("purchaseOrders.receive.title")}</h1>
        <p className="mt-1 text-sm text-[--ink-secondary]">
          {order.orderNumber} · {order.supplierName} · {order.warehouseName}
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-[--hairline]">
        <table className="w-full text-sm">
          <thead className="bg-[--sunken] text-xs text-[--ink-secondary]">
            <tr>
              <th className="px-3 py-2 text-start">{t("purchaseOrders.lines.product")}</th>
              <th className="px-3 py-2 text-end">{t("purchaseOrders.receive.ordered")}</th>
              <th className="px-3 py-2 text-end">{t("purchaseOrders.receive.previouslyReceived")}</th>
              <th className="px-3 py-2 text-end">{t("purchaseOrders.receive.remaining")}</th>
              <th className="px-3 py-2 text-end">{t("purchaseOrders.receive.receivingNow")}</th>
              <th className="px-3 py-2 text-end">{t("purchaseOrders.receive.newTotal")}</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((line) => {
              const remaining = line.quantity - line.receivedQuantity;
              const now = receivingNow[line.id] ?? 0;
              const newTotal = line.receivedQuantity + now;
              return (
                <tr key={line.id} className="border-t border-[--hairline]">
                  <td className="px-3 py-2 text-[--ink-primary]">{line.productName}</td>
                  <td className="px-3 py-2 text-end text-[--ink-secondary]">{line.quantity}</td>
                  <td className="px-3 py-2 text-end text-[--ink-secondary]">{line.receivedQuantity}</td>
                  <td className="px-3 py-2 text-end text-[--ink-secondary]">{remaining}</td>
                  <td className="px-3 py-2 text-end">
                    <input
                      type="number"
                      min={0}
                      max={remaining}
                      step="1"
                      value={now || ""}
                      disabled={remaining === 0}
                      onChange={(e) => setQuantity(line.id, remaining, Number(e.target.value))}
                      className="w-24 rounded-md border border-[--hairline] bg-[--sunken] px-2 py-1.5 text-end text-sm outline-none focus:border-[--signal] focus:ring-2 focus:ring-[--synapse]/30 disabled:opacity-40"
                    />
                  </td>
                  <td className={`px-3 py-2 text-end font-medium ${newTotal >= line.quantity ? "text-[--success]" : "text-[--ink-primary]"}`}>
                    {newTotal}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="fixed inset-x-0 bottom-0 flex flex-wrap items-center justify-between gap-3 border-t border-[--hairline] bg-[--panel] px-6 py-4">
        <div className="flex items-center gap-2 text-sm text-[--ink-secondary]">
          <PackageCheck size={16} className="text-[--signal]" />
          {t("purchaseOrders.receive.summary", {
            receiving: totals.totalReceivingNow,
            remaining: totals.totalRemaining,
          })}
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(`/purchase-orders/${order.id}`)}
            className="rounded-md px-4 py-2 text-sm font-medium text-[--ink-secondary] hover:bg-[--sunken]"
          >
            {t("common.actions.cancel")}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={receiveGoods.isPending}
            className="rounded-md bg-[--signal] px-4 py-2 text-sm font-medium text-white hover:bg-[--signal-hover] disabled:opacity-60"
          >
            {t("purchaseOrders.receive.confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}
