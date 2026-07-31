// src/pages/admin/stock/ProductStockDetailsPage.tsx
//
// Built directly from GET /api/Stock/products/{productId} — a single
// call, no composition needed (unlike the Overview page), so loading is
// simple. Shows Total Quantity (summed client-side across the response's
// warehouse entries) and one WarehouseCard per warehouse holding stock
// of this product.
//
// Deliberately does NOT show a product image, description, category, or
// any other metadata beyond name — the confirmed response for this
// endpoint is exactly productId/productSku/productName/warehouseId/
// warehouseName/quantityOnHand repeated per warehouse; nothing richer
// exists to show without a separate Products endpoint this module's API
// list doesn't include.

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Repeat, ArrowLeftRight } from "lucide-react";
import { WarehouseCard } from "../../../components/admin/stock/WarehouseCard";
import { useProductStock } from "../../../hooks/useStock";

function ProductStockDetailsSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="h-16 animate-pulse rounded-[16px] bg-[var(--sunken)]" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-40 animate-pulse rounded-[16px] bg-[var(--sunken)]" />
        ))}
      </div>
    </div>
  );
}

export function ProductStockDetailsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();

  const { data: stockLevels, isLoading, isError, refetch } = useProductStock(productId);

  const totalQuantity = useMemo(
    () => (stockLevels ?? []).reduce((sum, level) => sum + level.quantityOnHand, 0),
    [stockLevels],
  );

  const productName = stockLevels?.[0]?.productName ?? "";
  const productSku = stockLevels?.[0]?.productSku ?? "";

  if (isLoading) {
    return <ProductStockDetailsSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <p className="font-medium text-[var(--error)]">{t("common.errors.loadFailed")}</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="text-sm text-[var(--signal)] hover:text-[var(--signal-hover)]"
        >
          {t("common.actions.retry")}
        </button>
      </div>
    );
  }

  if (!stockLevels || stockLevels.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <p className="font-medium text-[var(--ink-primary)]">{t("stock.product.noStock")}</p>
        <button
          type="button"
          onClick={() => navigate("/inventory/stock")}
          className="text-sm text-[var(--signal)] hover:text-[var(--signal-hover)]"
        >
          {t("stock.product.backToOverview")}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={() => navigate("/inventory/stock")}
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]"
      >
        <ArrowLeft size={15} className="rtl:rotate-180" />
        {t("stock.product.backToOverview")}
      </button>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[16px] border border-[var(--hairline)] bg-[var(--panel)] p-5">
        <div>
          <h1 className="text-xl font-semibold text-[var(--ink-primary)]">{productName}</h1>
          <p className="font-mono text-sm text-[var(--ink-tertiary)]">{productSku}</p>
        </div>
        <div className="text-end">
          <p className="text-3xl font-semibold text-[var(--ink-primary)]">
            {totalQuantity.toLocaleString()}
          </p>
          <p className="text-xs text-[var(--ink-tertiary)]">{t("stock.product.totalQuantity")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {stockLevels.map((level) => (
          <WarehouseCard
            key={level.warehouseId}
            warehouseId={level.warehouseId}
            warehouseName={level.warehouseName}
            quantityOnHand={level.quantityOnHand}
            onRecordMovement={(warehouseId) =>
              navigate(
                `/inventory/movements/new?productId=${productId}&warehouseId=${warehouseId}`,
              )
            }
            onTransfer={(warehouseId) =>
              navigate(`/inventory/transfer?productId=${productId}&fromWarehouseId=${warehouseId}`)
            }
            onViewWarehouse={(warehouseId) => navigate(`/inventory/warehouses/${warehouseId}`)}
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-2 border-t border-[var(--hairline)] pt-4">
        <button
          type="button"
          onClick={() => navigate(`/inventory/movements/new?productId=${productId}`)}
          className="inline-flex items-center gap-1.5 rounded-[10px] bg-[var(--signal)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--signal-hover)]"
        >
          <Repeat size={14} />
          {t("stock.actions.recordMovement")}
        </button>
        <button
          type="button"
          onClick={() => navigate(`/inventory/transfer?productId=${productId}`)}
          className="inline-flex items-center gap-1.5 rounded-[10px] border border-[var(--hairline)] px-4 py-2 text-sm font-medium text-[var(--ink-primary)] hover:bg-[var(--sunken)]"
        >
          <ArrowLeftRight size={14} />
          {t("stock.actions.transfer")}
        </button>
      </div>
    </div>
  );
}
