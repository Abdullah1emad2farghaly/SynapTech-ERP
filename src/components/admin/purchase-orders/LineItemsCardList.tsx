// src/components/admin/purchase-orders/LineItemsCardList.tsx
//
// Mobile counterpart to LineItemsReadOnlyTable itself — same responsive
// role as the CustomerCard/CustomersTable split: swap this in on small
// screens, keep the table for sm and up.

import { LineItemCard } from "./LineItemCard";
import type { PurchaseOrderLine } from "../../../types/purchaseOrders.types";

interface LineItemsCardListProps {
    lines: PurchaseOrderLine[];
}

export function LineItemsCardList({ lines }: LineItemsCardListProps) {
    return (
        <div className="flex flex-col gap-3">
            {lines.map((line) => (
                <LineItemCard key={line.id} line={line} />
            ))}
        </div>
    );
}