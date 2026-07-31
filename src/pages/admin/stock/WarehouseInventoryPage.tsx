// src/pages/admin/stock/WarehouseInventoryPage.tsx
//
// Built from GET /api/Stock/warehouses/{warehouseId} — a single call,
// same simplicity as ProductStockDetailsPage. Reuses StockOverviewTable
// directly (showWarehouseColumn={false}, since every row here is
// already scoped to this one warehouse) rather than building a second,
// nearly-identical table — the design spec calls this out explicitly as
// a deliberate reuse decision.

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Search } from "lucide-react";
import {
  StockOverviewTable,
  type StockOverviewRow,
} from "../../../components/admin/stock/StockOverviewTable";
import { StockRowActionMenu } from "../../../components/admin/stock/StockRowActionMenu";
import { useWarehouseStock } from "../../../hooks/useStock";

export function WarehouseInventoryPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { warehouseId } = useParams<{ warehouseId: string }>();

  const [searchText, setSearchText] = useState("");
  const [sortColumnId, setSortColumnId] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null);

  const { data: stockLevels, isLoading, isError, refetch } = useWarehouseStock(warehouseId);

  const warehouseName = stockLevels?.[0]?.warehouseName ?? "";
  const totalQuantity = useMemo(
    () => (stockLevels ?? []).reduce((sum, level) => sum + level.quantityOnHand, 0),
    [stockLevels],
  );

  const isFiltered = searchText.trim().length > 0;

  const filteredRows: StockOverviewRow[] = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    return (stockLevels ?? []).filter(
      (row) =>
        !query ||
        row.productName.toLowerCase().includes(query) ||
        row.productSku.toLowerCase().includes(query),
    );
  }, [stockLevels, searchText]);

  const sortedRows = useMemo(() => {
    if (!sortColumnId || !sortDirection) return filteredRows;
    const factor = sortDirection === "asc" ? 1 : -1;
    return [...filteredRows].sort((a, b) => {
      switch (sortColumnId) {
        case "product":
          return a.productName.localeCompare(b.productName) * factor;
        case "quantity":
          return (a.quantityOnHand - b.quantityOnHand) * factor;
        default:
          return 0;
      }
    });
  }, [filteredRows, sortColumnId, sortDirection]);

  function renderRowActions(row: StockOverviewRow) {
    return (
      <StockRowActionMenu
        productId={row.productId}
        productName={row.productName}
        warehouseId={row.warehouseId}
        warehouseName={row.warehouseName}
        onRecordMovement={(productId, whId) =>
          navigate(`/inventory/movements/new?productId=${productId}&warehouseId=${whId}`)
        }
        onTransfer={(productId, whId) =>
          navigate(`/inventory/transfer?productId=${productId}&fromWarehouseId=${whId}`)
        }
        onViewProduct={(productId) => navigate(`/inventory/products/${productId}`)}
        hideViewWarehouse
      />
    );
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

  return (
    <div className="flex flex-col gap-4 md:px-6 px-2 py-6">
      <button
        type="button"
        onClick={() => navigate("/inventory/stock")}
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]"
      >
        <ArrowLeft size={15} className="rtl:rotate-180" />
        {t("stock.product.backToOverview")}
      </button>

      {isLoading ? (
        <div className="h-16 animate-pulse rounded-[16px] bg-[var(--sunken)]" />
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-[16px] border border-[var(--hairline)] bg-[var(--panel)] p-5">
          <h1 className="text-xl font-semibold text-[var(--ink-primary)]">{warehouseName}</h1>
          <div className="text-end">
            <p className="text-2xl font-semibold text-[var(--ink-primary)]">
              {totalQuantity.toLocaleString()}
            </p>
            <p className="text-xs text-[var(--ink-tertiary)]">{t("stock.warehouse.totalUnits")}</p>
          </div>
        </div>
      )}

      <div className="relative w-full max-w-sm">
        <Search
          size={15}
          className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[var(--ink-tertiary)]"
        />
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder={t("stock.warehouse.search.placeholder")}
          className="w-full rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] py-2 ps-9 pe-3 text-sm text-[var(--ink-primary)] placeholder:text-[var(--ink-tertiary)] focus:border-[var(--signal)] focus:outline-none focus:ring-2 focus:ring-[var(--synapse)]/30"
        />
      </div>

      <StockOverviewTable
        rows={sortedRows}
        isLoading={isLoading}
        isFiltered={isFiltered}
        onClearFilters={() => setSearchText("")}
        showWarehouseColumn={false}
        sortColumnId={sortColumnId}
        sortDirection={sortDirection}
        onSortChange={(columnId, direction) => {
          setSortColumnId(direction ? columnId : null);
          setSortDirection(direction);
        }}
        renderRowActions={renderRowActions}
      />
    </div>
  );
}
