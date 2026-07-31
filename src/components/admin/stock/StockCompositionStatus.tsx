// src/components/admin/stock/StockCompositionStatus.tsx
//
// Surfaces the real cost of composing Stock Overview from N per-
// warehouse calls (see useStockOverview.ts) rather than hiding it. Shows
// "Loaded X of Y warehouses" while composition is in progress, and lists
// any warehouses whose call failed with an inline per-warehouse retry —
// so a failure in one warehouse doesn't block or discard rows that
// loaded successfully from the others.
//
// Renders nothing once composition is fully done with no failures, so it
// doesn't linger as clutter on a normal, fully-loaded page.

import { useTranslation } from "react-i18next";
import { AlertTriangle } from "lucide-react";
import type { WarehouseLoadState } from "../../../hooks/useStockOverview";

export interface StockCompositionStatusProps {
  warehouseStates: WarehouseLoadState[];
  onRetryWarehouse: (warehouseId: string) => void;
}

export function StockCompositionStatus({
  warehouseStates,
  onRetryWarehouse,
}: StockCompositionStatusProps) {
  const { t } = useTranslation();

  const loadedCount = warehouseStates.filter((w) => !w.isLoading && !w.isError).length;
  const failedWarehouses = warehouseStates.filter((w) => w.isError);
  const isComposing = warehouseStates.some((w) => w.isLoading);

  if (!isComposing && failedWarehouses.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {isComposing && (
        <p className="text-sm text-[var(--ink-tertiary)]">
          {t("stock.overview.composing", {
            loaded: loadedCount,
            total: warehouseStates.length,
          })}
        </p>
      )}

      {failedWarehouses.map((w) => (
        <div
          key={w.warehouseId}
          className="flex items-center justify-between gap-3 rounded-[10px] border border-[var(--hairline)] bg-[var(--warning)]/10 px-3 py-2"
        >
          <span className="flex items-center gap-2 text-sm text-[var(--ink-primary)]">
            <AlertTriangle size={15} className="text-[var(--warning)]" />
            {t("stock.overview.warehouseLoadFailed", { name: w.warehouseName })}
          </span>
          <button
            type="button"
            onClick={() => onRetryWarehouse(w.warehouseId)}
            className="text-sm font-medium text-[var(--signal)] hover:text-[var(--signal-hover)]"
          >
            {t("common.actions.retry")}
          </button>
        </div>
      ))}
    </div>
  );
}
