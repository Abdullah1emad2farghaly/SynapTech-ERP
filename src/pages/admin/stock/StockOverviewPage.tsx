// src/pages/admin/stock/StockOverviewPage.tsx
//
// Wires useStockOverview (the composed N+1 dataset), StockSummaryRow,
// StockCompositionStatus (progressive-loading / partial-failure UI),
// the toolbar (client-side search + Warehouse/Product filters, per the
// design spec's explicit "client-side only" instruction), and
// StockOverviewTable together. No pagination controls — the design spec
// treats this as full-set client-side, same assumption class as
// Departments/Categories' unpaginated trees, though here the dataset is
// composed rather than a single list call.
//
// Row actions navigate to Record Movement / Transfer pre-filled with
// that row's product+warehouse, or to that product's/warehouse's own
// page — never Edit/Delete, since stock has no CRUD identity.

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { Plus, RefreshCw, Search } from "lucide-react";
import { StockSummaryRow } from "../../../components/admin/stock/StockSummaryRow";
import { StockCompositionStatus } from "../../../components/admin/stock/StockCompositionStatus";
import {
  StockOverviewTable,
  type StockOverviewRow,
} from "../../../components/admin/stock/StockOverviewTable";
import { StockRowActionMenu } from "../../../components/admin/stock/StockRowActionMenu";

import { useStockOverview } from "../../../hooks/useStockOverview";
import { useProducts } from "../../../hooks/useProducts";
import { useWarehouses } from "../../../hooks/useWarehouses";

export function StockOverviewPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [searchText, setSearchText] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState<string | null>(null);
  const [productFilter, setProductFilter] = useState<string | null>(null);
  const [sortColumnId, setSortColumnId] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null);

  const {
    rows,
    isLoadingWarehouseList,
    isWarehouseListError,
    warehouseStates,
    retryWarehouse,
    refetchAll,
  } = useStockOverview();

  const { data: products = [] } = useProducts();
  const { data: warehouses = [] } = useWarehouses();

  const isFiltered =
    searchText.trim().length > 0 || warehouseFilter !== null || productFilter !== null;

  const filteredRows = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    return rows.filter((row) => {
      if (
        query &&
        !row.productName.toLowerCase().includes(query) &&
        !row.productSku.toLowerCase().includes(query) &&
        !row.warehouseName.toLowerCase().includes(query)
      ) {
        return false;
      }
      if (warehouseFilter && row.warehouseId !== warehouseFilter) return false;
      if (productFilter && row.productId !== productFilter) return false;
      return true;
    });
  }, [rows, searchText, warehouseFilter, productFilter]);

  const sortedRows = useMemo(() => {
    if (!sortColumnId || !sortDirection) return filteredRows;
    const factor = sortDirection === "asc" ? 1 : -1;
    return [...filteredRows].sort((a, b) => {
      switch (sortColumnId) {
        case "product":
          return a.productName.localeCompare(b.productName) * factor;
        case "warehouse":
          return a.warehouseName.localeCompare(b.warehouseName) * factor;
        case "quantity":
          return (a.quantityOnHand - b.quantityOnHand) * factor;
        default:
          return 0;
      }
    });
  }, [filteredRows, sortColumnId, sortDirection]);

  const kpis = useMemo(() => {
    const distinctProducts = new Set(rows.map((r) => r.productId));
    const distinctWarehouses = new Set(rows.map((r) => r.warehouseId));
    const totalUnits = rows.reduce((sum, r) => sum + r.quantityOnHand, 0);
    return {
      totalProducts: distinctProducts.size,
      totalWarehouses: distinctWarehouses.size,
      totalUnitsOnHand: totalUnits,
    };
  }, [rows]);

  function handleClearFilters() {
    setSearchText("");
    setWarehouseFilter(null);
    setProductFilter(null);
  }

  function renderRowActions(row: StockOverviewRow) {
    return (
      <StockRowActionMenu
        productId={row.productId}
        productName={row.productName}
        warehouseId={row.warehouseId}
        warehouseName={row.warehouseName}
        onRecordMovement={(productId, warehouseId) =>
          navigate(`/inventory/movements/new?productId=${productId}&warehouseId=${warehouseId}`)
        }
        onTransfer={(productId, warehouseId) =>
          navigate(`/inventory/stock/transfer?productId=${productId}&fromWarehouseId=${warehouseId}`)
        }
        onViewProduct={(productId) => navigate(`/inventory/products/${productId}`)}
        onViewWarehouse={(warehouseId) => navigate(`/inventory/warehouses/${warehouseId}`)}
      />
    );
  }

  if (isWarehouseListError) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <p className="font-medium text-[var(--error)]">{t("common.errors.loadFailed")}</p>
        <button
          type="button"
          onClick={() => refetchAll()}
          className="text-sm text-[var(--signal)] hover:text-[var(--signal-hover)]"
        >
          {t("common.actions.retry")}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 md:px-6 px-2 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--ink-primary)]">
            {t("stock.overview.title")}
          </h1>
          <p className="text-sm text-[var(--ink-tertiary)]">
            {t("stock.overview.subtitleCount", { count: rows.length })}
          </p>
        </div>
        <button
          type="button"
          onClick={() => refetchAll()}
          aria-label={t("common.actions.retry")}
          className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] text-[var(--ink-secondary)] hover:bg-[var(--sunken)]"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      <StockSummaryRow
        totalProducts={kpis.totalProducts}
        totalWarehouses={kpis.totalWarehouses}
        totalUnitsOnHand={kpis.totalUnitsOnHand}
      />

      <StockCompositionStatus warehouseStates={warehouseStates} onRetryWarehouse={retryWarehouse} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search
            size={15}
            className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[var(--ink-tertiary)]"
          />
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder={t("stock.overview.search.placeholder")}
            className="w-full rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] py-2 ps-9 pe-3 text-sm text-[var(--ink-primary)] placeholder:text-[var(--ink-tertiary)] focus:border-[var(--signal)] focus:outline-none focus:ring-2 focus:ring-[var(--synapse)]/30"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={warehouseFilter ?? ""}
            onChange={(e) => setWarehouseFilter(e.target.value || null)}
            className="rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--ink-primary)]"
          >
            <option value="">{t("stock.overview.filters.warehouse")}</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>

          <select
            value={productFilter ?? ""}
            onChange={(e) => setProductFilter(e.target.value || null)}
            className="rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--ink-primary)]"
          >
            <option value="">{t("stock.overview.filters.product")}</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => navigate('new-movement')}
            className="flex h-10 items-center gap-2 rounded-md bg-[var(--signal)] px-4 text-sm font-medium text-white transition-colors duration-150 ease-out hover:bg-[var(--signal-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--synapse)]/40"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">
              {t("stock.new-movement")}
            </span>
          </button>
        </div>
      </div>

      <StockOverviewTable
        rows={sortedRows}
        isLoading={isLoadingWarehouseList}
        isFiltered={isFiltered}
        onClearFilters={handleClearFilters}
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
