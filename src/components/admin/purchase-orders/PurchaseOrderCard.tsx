// src/components/admin/purchase-orders/PurchaseOrderCard.tsx

import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { EntityCard, type EntityCardField } from "../../common/EntityCard";
import type { PurchaseOrderResponse } from "../../../types/purchaseOrders.types";
import { PurchaseOrderStatusBadge } from "./PurchaseOrderStatusBadge";

export interface PurchaseOrderCardProps {
    order: PurchaseOrderResponse;
    onClick: (id: string) => void;
    renderActions: () => ReactNode;
}

export function PurchaseOrderCard({ order, onClick, renderActions }: PurchaseOrderCardProps) {
    const { t } = useTranslation();

    const fields: EntityCardField[] = [
        { key: "supplier", label: t("purchaseOrders.table.supplier"), value: order.supplierName },
        { key: "warehouse", label: t("purchaseOrders.table.warehouse"), value: order.warehouseName },
        { key: "orderDate", label: t("purchaseOrders.table.orderDate"), value: order.orderDate, dir: "ltr" },
        order.warnings.length > 0 && {
            key: "warnings",
            label: t("purchaseOrders.table.warnings"),
            value: String(order.warnings.length),
        },
    ].filter(Boolean) as EntityCardField[];

    return (
        <EntityCard
            id={order.id}
            title={order.orderNumber}
            badge={<PurchaseOrderStatusBadge status={order.status} />}
            fields={fields}
            totalAmount={order.totalAmount}
            onClick={onClick}
            renderActions={renderActions}
        />
    );
}