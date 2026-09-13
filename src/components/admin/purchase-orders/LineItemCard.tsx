// src/components/admin/purchase-orders/LineItemCard.tsx
//
// Mobile counterpart to LineItemsReadOnlyTable's rows — product name as
// the card title, quantity/price/total/received/remaining as the body.
// Read-only: no click-through, no actions, matching the table exactly.

import { useTranslation } from "react-i18next";
import type { PurchaseOrderLine } from "../../../types/purchaseOrders.types";
import { EntityCard, EntityCardField } from "@/components/common/EntityCard";

export interface LineItemCardProps {
    line: PurchaseOrderLine;
}

export function LineItemCard({ line }: LineItemCardProps) {
    const { t } = useTranslation();
    const remaining = line.quantity - line.receivedQuantity;

    const fields: EntityCardField[] = [
        { key: "quantity", label: t("purchaseOrders.lines.quantity"), value: line.quantity, dir: "ltr" },
        { key: "unitPrice", label: t("purchaseOrders.lines.unitPrice"), value: line.unitPrice.toFixed(2), dir: "ltr" },
        { 
            key: "lineTotal", 
            label: t("purchaseOrders.lines.lineTotal"), 
            value:  (
                <span className={"text-[--success]"}>{(line.unitPrice * line.quantity).toFixed(2)}</span>
            ),
            dir: "ltr" },
        { key: "received", label: t("purchaseOrders.lines.received"), value: line.receivedQuantity, dir: "ltr" },
        {
            key: "remaining",
            label: t("purchaseOrders.lines.remaining"),
            value: (
                <span className={remaining > 0 ? "text-[--warning]" : "text-[--warning]"}>{remaining}</span>
            ),
            dir: "ltr",
        },
    ];

    return <EntityCard id={line.id} title={line.productName} fields={fields} />;
}