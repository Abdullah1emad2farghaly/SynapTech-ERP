// Project path: src/pages/admin/sales-orders/ShipGoodsPage.tsx
// Route: /sales-orders/:id/ship
//
// Own dedicated page, mirrors Purchase Orders' Receive Goods page. Only
// reachable for Approved/PartiallyShipped orders. Zero-quantity rows are
// omitted from the request, not sent as explicit zeros.

import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { ArrowLeft, PackageCheck } from "lucide-react";
import { useSalesOrder } from "../../../hooks/useSalesOrders";
import { useShipSalesOrderGoods } from "../../../hooks/useSalesOrderMutations";
import { canPerform } from "../../../utils/salesOrderWorkflow";
import type { ShipGoodsLineRequest } from "../../../types/salesOrders.types";
import axios from "axios";
import { handleErrors } from "@/utils/HandleErrors";

export function ShipGoodsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: order, isLoading } = useSalesOrder(id);
  const shipGoods = useShipSalesOrderGoods(id ?? "");

  const [shippingNow, setShippingNow] = useState<Record<string, number>>({});
  const lines = order?.lines ?? [];

  const setQuantity = (lineId: string, remaining: number, raw: number) => {
    const clamped = Math.max(0, Math.min(remaining, Number.isFinite(raw) ? raw : 0));
    setShippingNow((prev) => ({ ...prev, [lineId]: clamped }));
  };

  const totals = useMemo(() => {
    const totalRemaining = lines.reduce((s, l) => s + (l.quantity - l.shippedQuantity), 0);
    const totalShippingNow = lines.reduce((s, l) => s + (shippingNow[l.id] ?? 0), 0);
    return { totalRemaining, totalShippingNow };
  }, [lines, shippingNow]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <div className="h-8 w-64 animate-pulse rounded bg-[--sunken]" />
        <div className="h-64 animate-pulse rounded-lg bg-[--sunken]" />
      </div>
    );
  }

  if (!order) {
    return <div className="p-6 text-center text-sm text-[--ink-secondary]">{t("salesOrders.details.notFound")}</div>;
  }

  if (!canPerform("ship", order.status)) {
    navigate(`/sales-orders/${order.id}`);
    toast.error(t("salesOrders.ship.notShippable"));
    return null;
  }

  const handleSubmit = async () => {
    const shipLines: ShipGoodsLineRequest[] = lines
      .filter((l) => (shippingNow[l.id] ?? 0) > 0)
      .map((l) => ({ lineId: l.id, quantityShipped: shippingNow[l.id] }));

    if (shipLines.length === 0) {
      toast.error(t("salesOrders.ship.nothingToShip"));
      return;
    }

    try {
      await shipGoods.mutateAsync({ lines: shipLines });
      toast.success(t("salesOrders.toasts.shipped"));
      navigate(`/sales/sales-orders/${order.id}`);
    } catch (error) {
      if(axios.isAxiosError(error)){
        handleErrors(error.response?.data.errors)
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 pb-28">
      <button
        type="button"
        onClick={() => navigate(`/sales/sales-orders/${order.id}`)}
        className="flex w-fit items-center gap-1.5 text-sm text-[--ink-secondary] hover:text-[--ink-primary]"
      >
        <ArrowLeft size={16} className="rtl:rotate-180" />
        {t("salesOrders.details.back")}
      </button>

      <div>
        <h1 className="text-2xl font-semibold text-[--ink-primary]">{t("salesOrders.ship.title")}</h1>
        <p className="mt-1 text-sm text-[--ink-secondary]">
          {order.orderNumber} · {order.customerName} · {order.warehouseName}
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-[--hairline]">
        <table className="w-full text-sm">
          <thead className="bg-[--sunken] text-xs text-[--ink-secondary]">
            <tr>
              <th className="px-3 py-2 text-start">{t("salesOrders.lines.product")}</th>
              <th className="px-3 py-2 text-start">{t("salesOrders.lines.sku")}</th>
              <th className="px-3 py-2 text-end">{t("salesOrders.ship.ordered")}</th>
              <th className="px-3 py-2 text-end">{t("salesOrders.ship.alreadyShipped")}</th>
              <th className="px-3 py-2 text-end">{t("salesOrders.ship.remaining")}</th>
              <th className="px-3 py-2 text-end">{t("salesOrders.ship.shippingNow")}</th>
              <th className="px-3 py-2 text-end">{t("salesOrders.ship.newTotal")}</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line) => {
              const remaining = line.quantity - line.shippedQuantity;
              const now = shippingNow[line.id] ?? 0;
              const newTotal = line.shippedQuantity + now;
              return (
                <tr key={line.id} className="border-t border-[--hairline]">
                  <td className="px-3 py-2 text-[--ink-primary]">{line.productName}</td>
                  <td className="px-3 py-2 font-mono text-xs text-[--ink-secondary]">{line.productSku}</td>
                  <td className="px-3 py-2 text-end text-[--ink-secondary]">{line.quantity}</td>
                  <td className="px-3 py-2 text-end text-[--ink-secondary]">{line.shippedQuantity}</td>
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
          {t("salesOrders.ship.summary", { shipping: totals.totalShippingNow, remaining: totals.totalRemaining })}
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(`/sales/sales-orders/${order.id}`)}
            className="rounded-md px-4 py-2 text-sm font-medium text-[--ink-secondary] hover:bg-[--sunken]"
          >
            {t("common.actions.cancel")}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={shipGoods.isPending}
            className="rounded-md bg-[--signal] px-4 py-2 text-sm font-medium text-white hover:bg-[--signal-hover] disabled:opacity-60"
          >
            {t("salesOrders.ship.confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}
