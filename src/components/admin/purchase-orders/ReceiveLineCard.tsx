// src/components/admin/purchase-orders/ReceiveLineCard.tsx
//
// Mobile counterpart to ReceiveGoodsPage's table rows — product name as
// title, Ordered/Previously Received/Remaining/Receiving Now/New Total as
// fields. Receiving Now embeds the same live quantity input as the table;
// New Total keeps the ordered-vs-complete color cue. No onClick/actions —
// this card is itself the editable surface, same role LineItemCard plays
// for the read-only line items table.

import { useTranslation } from "react-i18next";
import { EntityCard, type EntityCardField } from "../../common/EntityCard";
import type { PurchaseOrderLine } from "../../../types/purchaseOrders.types";

export interface ReceiveLineCardProps {
    line: PurchaseOrderLine;
    receivingNow: number;
    onQuantityChange: (lineId: string, remaining: number, raw: number) => void;
}

export function ReceiveLineCard({ line, receivingNow, onQuantityChange }: ReceiveLineCardProps) {
    const { t } = useTranslation();
    const remaining = line.quantity - line.receivedQuantity;
    const newTotal = line.receivedQuantity + receivingNow;

    const fields: EntityCardField[] = [
        { key: "ordered", label: t("purchaseOrders.receive.ordered"), value: line.quantity, dir: "ltr" },
        {
            key: "previouslyReceived",
            label: t("purchaseOrders.receive.previouslyReceived"),
            value: line.receivedQuantity,
            dir: "ltr",
        },
        { key: "remaining", label: t("purchaseOrders.receive.remaining"), value: remaining, dir: "ltr" },
        {
            key: "receivingNow",
            label: t("purchaseOrders.receive.receivingNow"),
            value: (
                <input
                    type="number"
                    min={0}
                    max={remaining}
                    step="1"
                    value={receivingNow || ""}
                    disabled={remaining === 0}
                    onChange={(e) => onQuantityChange(line.id, remaining, Number(e.target.value))}
                    className="w-24 rounded-md border border-[--hairline] bg-[--sunken] px-2 py-1.5 text-end text-sm outline-none focus:border-[--signal] focus:ring-2 focus:ring-[--synapse]/30 disabled:opacity-40"
                />
            ),
        },
        {
            key: "newTotal",
            label: t("purchaseOrders.receive.newTotal"),
            dir: "ltr",
            value: (
                <span className={`font-medium ${newTotal >= line.quantity ? "text-[--success]" : "text-[--ink-primary]"}`}>
                    {newTotal}
                </span>
            ),
        },
    ];

    return <EntityCard id={line.id} title={line.productName} fields={fields} />;
}