// Project path: src/components/admin/sales-orders/LineItemsReadOnlyTable.tsx
//
// SKU gets its own column here — a field Purchase Orders' line-items table
// doesn't have (see spec §1, §15).

import { useTranslation } from "react-i18next";
import type { SalesOrderLine } from "../../../types/salesOrders.types";

interface LineItemsReadOnlyTableProps {
  lines: SalesOrderLine[];
}

export function LineItemsReadOnlyTable({ lines }: LineItemsReadOnlyTableProps) {
  const { t } = useTranslation();

  return (
    <div className="overflow-hidden rounded-lg border border-[--hairline]">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-[--sunken] text-xs text-[--ink-secondary]">
          <tr>
            <th className="px-3 py-2 text-start">{t("salesOrders.lines.product")}</th>
            <th className="px-3 py-2 text-start">{t("salesOrders.lines.sku")}</th>
            <th className="px-3 py-2 text-end">{t("salesOrders.lines.quantity")}</th>
            <th className="px-3 py-2 text-end">{t("salesOrders.lines.unitPrice")}</th>
            <th className="px-3 py-2 text-end">{t("salesOrders.lines.lineTotal")}</th>
            <th className="px-3 py-2 text-end">{t("salesOrders.lines.shipped")}</th>
            <th className="px-3 py-2 text-end">{t("salesOrders.lines.remaining")}</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line) => {
            const remaining = line.quantity - line.shippedQuantity;
            const lineTotal = line.quantity * line.unitPrice; // frontend-calculated — no lineTotal field on the response
            return (
              <tr key={line.id} className="border-t border-[--hairline] hover:bg-[--sunken]">
                <td className="px-3 py-2 text-[--ink-primary]">{line.productName}</td>
                <td className="px-3 py-2 font-mono text-xs text-[--ink-secondary]">{line.productSku}</td>
                <td className="px-3 py-2 text-end text-[--ink-primary]">{line.quantity}</td>
                <td className="px-3 py-2 text-end text-[--ink-primary]">{line.unitPrice.toFixed(2)}</td>
                <td className="px-3 py-2 text-end font-medium text-[--ink-primary]">{lineTotal.toFixed(2)}</td>
                <td className="px-3 py-2 text-end text-[--ink-secondary]">{line.shippedQuantity}</td>
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
