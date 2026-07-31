// src/components/admin/stock/WarehouseCard.tsx
//
// One card per warehouse holding stock of a given product, used on
// ProductStockDetailsPage. Deliberately uniform sizing regardless of
// quantity — no card should visually imply "this one matters more,"
// since that would suggest a threshold judgment (low/high stock) the
// backend has no concept of.

import { useTranslation } from "react-i18next";
import { Repeat, ArrowLeftRight, Warehouse as WarehouseIcon } from "lucide-react";

export interface WarehouseCardProps {
  warehouseId: string;
  warehouseName: string;
  quantityOnHand: number;
  onRecordMovement: (warehouseId: string) => void;
  onTransfer: (warehouseId: string) => void;
  onViewWarehouse: (warehouseId: string) => void;
}

export function WarehouseCard({
  warehouseId,
  warehouseName,
  quantityOnHand,
  onRecordMovement,
  onTransfer,
  onViewWarehouse,
}: WarehouseCardProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-3 rounded-[16px] border border-[var(--hairline)] bg-[var(--panel)] p-4">
      <button
        type="button"
        onClick={() => onViewWarehouse(warehouseId)}
        className="flex items-center gap-2 text-start"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[var(--sunken)] text-[var(--ink-secondary)]">
          <WarehouseIcon size={16} />
        </span>
        <span className="font-medium text-[var(--ink-primary)] hover:text-[var(--signal)]">
          {warehouseName}
        </span>
      </button>

      <div>
        <p className="text-2xl font-semibold text-[var(--ink-primary)]">
          {quantityOnHand.toLocaleString()}
        </p>
        <p className="text-xs text-[var(--ink-tertiary)]">{t("stock.column.quantityOnHand")}</p>
      </div>

      <div className="mt-1 flex gap-2 border-t border-[var(--hairline)] pt-3">
        <button
          type="button"
          onClick={() => onRecordMovement(warehouseId)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-[10px] border border-[var(--hairline)] px-3 py-2 text-sm font-medium text-[var(--ink-primary)] hover:bg-[var(--sunken)]"
        >
          <Repeat size={14} />
          {t("stock.actions.recordMovement")}
        </button>
        <button
          type="button"
          onClick={() => onTransfer(warehouseId)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-[10px] border border-[var(--hairline)] px-3 py-2 text-sm font-medium text-[var(--ink-primary)] hover:bg-[var(--sunken)]"
        >
          <ArrowLeftRight size={14} />
          {t("stock.actions.transfer")}
        </button>
      </div>
    </div>
  );
}
