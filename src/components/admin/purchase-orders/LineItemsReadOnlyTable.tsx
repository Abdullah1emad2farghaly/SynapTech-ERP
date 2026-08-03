// Project path: src/components/admin/purchase-orders/LineItemsReadOnlyTable.tsx

import { useTranslation } from "react-i18next";
import type { PurchaseOrderLine } from "../../../types/purchaseOrders.types";

interface LineItemsReadOnlyTableProps {
  lines: PurchaseOrderLine[];
}

export function LineItemsReadOnlyTable({ lines }: LineItemsReadOnlyTableProps) {
  const { t } = useTranslation();

  return (
    <div className="overflow-hidden rounded-lg border border-[--hairline]">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-[--sunken] text-xs text-[--ink-secondary]">
          <tr>
            <th className="px-3 py-2 text-start">{t("purchaseOrders.lines.product")}</th>
            <th className="px-3 py-2 text-end">{t("purchaseOrders.lines.quantity")}</th>
            <th className="px-3 py-2 text-end">{t("purchaseOrders.lines.unitPrice")}</th>
            <th className="px-3 py-2 text-end">{t("purchaseOrders.lines.lineTotal")}</th>
            <th className="px-3 py-2 text-end">{t("purchaseOrders.lines.received")}</th>
            <th className="px-3 py-2 text-end">{t("purchaseOrders.lines.remaining")}</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line) => {
            const remaining = line.quantity - line.receivedQuantity;
            return (
              <tr key={line.id} className="border-t border-[--hairline] hover:bg-[--sunken]">
                <td className="px-3 py-2 text-[--ink-primary]">{line.productName}</td>
                <td className="px-3 py-2 text-end text-[--ink-primary]">{line.quantity}</td>
                <td className="px-3 py-2 text-end text-[--ink-primary]">{line.unitPrice.toFixed(2)}</td>
                <td className="px-3 py-2 text-end font-medium text-[--ink-primary]">
                  {line?.lineTotal?.toFixed(2)}
                </td>
                <td className="px-3 py-2 text-end text-[--ink-secondary]">{line.receivedQuantity}</td>
                <td className={`px-3 py-2 text-end ${remaining > 0 ? "text-[--warning]" : "text-[--success]"}`}>
                  {remaining}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
