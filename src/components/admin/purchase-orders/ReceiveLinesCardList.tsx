// src/components/admin/purchase-orders/ReceiveLinesCardList.tsx
//
// Mobile counterpart to the receiving table itself. Same state ownership
// as the table version — parent (ReceiveGoodsPage) still holds
// `receivingNow` and passes setQuantity down, this just renders it as cards.

import { ReceiveLineCard } from "./ReceiveLineCard";
import type { PurchaseOrderLine } from "../../../types/purchaseOrders.types";

interface ReceiveLinesCardListProps {
    lines: PurchaseOrderLine[];
    receivingNow: Record<string, number>;
    onQuantityChange: (lineId: string, remaining: number, raw: number) => void;
}

export function ReceiveLinesCardList({ lines, receivingNow, onQuantityChange }: ReceiveLinesCardListProps) {
    return (
        <div className="flex flex-col gap-3">
            {lines.map((line) => (
                <ReceiveLineCard
                    key={line.id}
                    line={line}
                    receivingNow={receivingNow[line.id] ?? 0}
                    onQuantityChange={onQuantityChange}
                />
            ))}
        </div>
    );
}