// src/components/admin/sales-orders/SalesOrderCard.tsx

import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { EntityCard, type EntityCardField } from "../../../components/common/EntityCard";
import type { SalesOrderResponse } from "../../../types/salesOrders.types";
import { SalesOrderStatusBadge } from "@/components/admin/sales-orders/SalesOrderStatusBadge";

export interface SalesOrderCardProps {
  order: SalesOrderResponse;
  onClick: (id: string) => void;
  renderActions: () => ReactNode;
}

export function SalesOrderCard({ order, onClick, renderActions }: SalesOrderCardProps) {
  const { t } = useTranslation();

  const fields: EntityCardField[] = [
    {
      key: "customer",
      label: t("salesOrders.table.customer"),
      value: order.customerName,
    },
    {
      key: "warehouse",
      label: t("salesOrders.table.warehouse"),
      value: order.warehouseName,
    },
    {
      key: "orderDate",
      label: t("salesOrders.table.orderDate"),
      value: order.orderDate,
      dir: "ltr",
    },
    {
      key: "orderDate",
      label: t("salesOrders.table.orderDate"),
      value: order.orderDate,
      dir: "ltr",
    },
    
  ].filter(Boolean) as EntityCardField[];

  return (
    <EntityCard
     badge={<SalesOrderStatusBadge status={order.status} />}
      id={order.id}
      title={order.orderNumber}
      fields={fields}
      totalAmount={order.totalAmount}
      onClick={onClick}
      renderActions={renderActions}
    />
  );
  
}