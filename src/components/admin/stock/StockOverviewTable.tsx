// src/components/admin/stock/StockOverviewTable.tsx
//
// Composes the existing generic DataTable — client-side sort only (the
// caller sorts `rows` itself before passing them in; DataTable just
// renders columns and reports which column/direction was clicked, same
// as every other module's table). Deliberately the SAME component for
// both Stock Overview (fed the composed multi-warehouse dataset from
// useStockOverview) and Warehouse Inventory (fed a single warehouse's
// StockLevel[] directly) — the design spec explicitly calls out reusing
// one table here rather than building two nearly-identical ones.
//
// No StatusBadge-equivalent column exists — stock rows have no active/
// inactive concept, only a quantity. No "Low Stock" indicator either,
// since there's no reorder-level field to compare against.
//
// A stock row's real identity is the (productId, warehouseId) PAIR —
// neither field alone is unique in the composed dataset, so getRowId
// concatenates both.

import { useTranslation } from "react-i18next";
import { DataTable, type DataTableColumn, type SortDirection } from "../../common/DataTable";

export interface StockOverviewRow {
  productId: string;
  productSku: string;
  productName: string;
  warehouseId: string;
  warehouseName: string;
  quantityOnHand: number;
}

export interface StockOverviewTableProps {
  rows: StockOverviewRow[];
  isLoading?: boolean;
  hasError?: boolean;
  onRetry?: () => void;
  onClearFilters?: () => void;
  isFiltered?: boolean;
  sortColumnId?: string | null;
  sortDirection?: SortDirection;
  onSortChange?: (columnId: string, direction: SortDirection) => void;
  onRowClick?: (row: StockOverviewRow) => void;
  renderRowActions?: (row: StockOverviewRow) => React.ReactNode;
  /** Hide the Warehouse column when this table is scoped to a single warehouse already (Warehouse Inventory page). */
  showWarehouseColumn?: boolean;
}

export function StockOverviewTable({
  rows,
  isLoading,
  hasError,
  onRetry,
  onClearFilters,
  isFiltered,
  sortColumnId,
  sortDirection,
  onSortChange,
  onRowClick,
  renderRowActions,
  showWarehouseColumn = true,
}: StockOverviewTableProps) {
  const { t } = useTranslation();

  const columns: DataTableColumn<StockOverviewRow>[] = [
    {
      id: "product",
      header: t("stock.column.product"),
      sortable: true,
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-[var(--ink-primary)]">{row.productName}</span>
          <span className="font-mono text-xs text-[var(--ink-tertiary)]">{row.productSku}</span>
        </div>
      ),
    },
    ...(showWarehouseColumn
      ? [
          {
            id: "warehouse",
            header: t("stock.column.warehouse"),
            sortable: true,
            cell: (row: StockOverviewRow) => <span className="text-[var(--ink-secondary)]">{row.warehouseName}</span>,
          } as DataTableColumn<StockOverviewRow>,
        ]
      : []),
    {
      id: "quantity",
      header: t("stock.column.quantityOnHand"),
      sortable: true,
      widthClass: "w-32",
      cell: (row) => (
        <span className="font-medium text-[var(--success)]">
          {row.quantityOnHand.toLocaleString()}
        </span>
      ),
    },
    ...(renderRowActions
      ? [
          {
            id: "actions",
            header: "",
            widthClass: "w-24",
            cell: (row: StockOverviewRow) => (
              <div onClick={(e) => e.stopPropagation()}>{renderRowActions(row)}</div>
            ),
          } as DataTableColumn<StockOverviewRow>,
        ]
      : []),
  ];

  const emptyState = (
    <div className="flex flex-col items-center gap-2 text-center">
      <p className="font-medium text-[var(--ink-primary)]">
        {isFiltered ? t("stock.list.empty.noMatches") : t("stock.list.empty.noStock")}
      </p>
      {isFiltered && onClearFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="text-sm text-[var(--signal)] hover:text-[var(--signal-hover)]"
        >
          {t("stock.list.empty.clearFilters")}
        </button>
      )}
    </div>
  );

  const errorState = (
    <div className="flex flex-col items-center gap-2 text-center">
      <p className="font-medium text-[var(--error)]">{t("common.errors.loadFailed")}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="text-sm text-[var(--signal)] hover:text-[var(--signal-hover)]"
        >
          {t("common.actions.retry")}
        </button>
      )}
    </div>
  );

  return (
    <DataTable<StockOverviewRow>
      columns={columns}
      rows={rows}
      getRowId={(row) => `${row.productId}:${row.warehouseId}`}
      isLoading={isLoading}
      emptyState={emptyState}
      errorState={hasError ? errorState : undefined}
      sortColumnId={sortColumnId}
      sortDirection={sortDirection}
      onSortChange={onSortChange}
      onRowClick={onRowClick}
    />
  );
}
