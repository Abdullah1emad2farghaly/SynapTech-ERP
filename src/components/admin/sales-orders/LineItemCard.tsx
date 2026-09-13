// src/components/admin/sales-orders/LineItemCard.tsx
//
// Mobile counterpart to Sales Orders' LineItemsReadOnlyTable rows —
// product name as title, SKU shown as a field row (no subtitle slot on
// EntityCard, same workaround as Products/Journal Entries/Branches),
// Quantity/Unit Price/Line Total/Shipped/Remaining as the rest. lineTotal
// is computed the same way as the table (quantity * unitPrice), not read
// from the line. Read-only: no onClick/actions.

import { useTranslation } from "react-i18next";
import { EntityCard, type EntityCardField } from "../../common/EntityCard";
import type { SalesOrderLine } from "../../../types/salesOrders.types";

export interface LineItemCardProps {
  line: SalesOrderLine;
}

export function LineItemCard({ line }: LineItemCardProps) {
  const { t } = useTranslation();
  const remaining = line.quantity - line.shippedQuantity;
  const lineTotal = line.quantity * line.unitPrice;

  const fields: EntityCardField[] = [
    {
      key: "sku",
      label: t("salesOrders.lines.sku"),
      value: <span className="font-mono text-xs">{line.productSku}</span>,
      dir: "ltr",
    },
    { key: "quantity", label: t("salesOrders.lines.quantity"), value: line.quantity, dir: "ltr" },
    { key: "unitPrice", label: t("salesOrders.lines.unitPrice"), value: line.unitPrice.toFixed(2), dir: "ltr" },
    {
      key: "lineTotal",
      label: t("salesOrders.lines.lineTotal"),
      value: <span className="font-medium">{lineTotal.toFixed(2)}</span>,
      dir: "ltr",
    },
    { key: "shipped", label: t("salesOrders.lines.shipped"), value: line.shippedQuantity, dir: "ltr" },
    {
      key: "remaining",
      label: t("salesOrders.lines.remaining"),
      value: (
        <span className={remaining > 0 ? "text-[--warning]" : "text-[--success]"}>{remaining}</span>
      ),
      dir: "ltr",
    },
  ];

  return <EntityCard id={line.id} title={line.productName} fields={fields} />;
}
