// src/components/admin/stock/StockRowCard.tsx
//
// Mobile counterpart to StockOverviewTable's rows — Product name + SKU as
// title/subtitle, Warehouse (conditional, matching showWarehouseColumn) +
// Quantity on Hand as the body. Quantity formatting/color matches the
// table's cell exactly.

import { useTranslation } from "react-i18next";
import { EntityCard, type EntityCardField } from "../../common/EntityCard";
import type { StockOverviewRow } from "./StockOverviewTable";

export interface StockRowCardProps {
  row: StockOverviewRow;
  showWarehouseColumn?: boolean;
  renderActions: () => React.ReactNode;
}

export function StockRowCard({ row, showWarehouseColumn = true, renderActions }: StockRowCardProps) {
  const { t } = useTranslation();

  const fields: EntityCardField[] = [
    showWarehouseColumn && {
      key: "warehouse",
      label: t("stock.column.warehouse"),
      value: row.warehouseName,
    },
    {
      key: "quantity",
      label: t("stock.column.quantityOnHand"),
      value: (
        <span className="font-medium text-[var(--success)]">
          {row.quantityOnHand.toLocaleString()}
        </span>
      ),
      dir: "ltr",
    },
  ].filter(Boolean) as EntityCardField[];

  return (
    <EntityCard
      id={row.productId}
      title={row.productName}
      fields={[
        {
          key: "sku",
          label: t("stock.column.product"),
          value: <span className="font-mono text-xs">{row.productSku}</span>,
          dir: "ltr",
        },
        ...fields,
      ]}
      renderActions={renderActions}
    />
  );
  // Note: SKU wasn't previously a separate column header in the table (it's
  // a subtitle line under productName inside the "product" cell), so I've
  // kept it as a labeled field here instead — EntityCard has no built-in
  // subtitle slot under the title. Flag if you'd rather add one to
  // EntityCard for this case instead of listing SKU as a field row.
}