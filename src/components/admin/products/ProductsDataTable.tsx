// src/components/admin/products/ProductsDataTable.tsx
//
// Composes the shared DataTable shell (src/components/common/DataTable.tsx) rather
// than hand-rolling a table, per the "always reuse existing shared components" rule
// and the DataTable prop shape documented in handoff Section 4. Presentation-only —
// no API calls, no business logic; all data/handlers come from ProductsListPage.
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { DataTable, type DataTableColumn } from "../../common/DataTable";
import { StatusBadge } from "../../common/StatusBadge";
import { ProductActionMenu } from "./ProductActionMenu";
import type { Product } from "../../../services/api/products.api";

export interface ProductsDataTableProps {
  products: Product[];
  isLoading?: boolean;
  hasError?: boolean;
  onRetry?: () => void;
  sortColumnId?: string;
  sortDirection?: "asc" | "desc";
  onSortChange?: (columnId: string, direction: "asc" | "desc") => void;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  onEdit: (product: Product) => void;
  onDuplicate: (product: Product) => void;
  onDelete: (product: Product) => void;
  className?: string;
  canManageAccess: boolean;
}

function formatCurrency(value: number): string {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function ProductsDataTable({
  products,
  isLoading = false,
  hasError = false,
  onRetry,
  sortColumnId,
  sortDirection,
  // onSortChange,
  // selectedIds,
  // onSelectionChange,
  onEdit,
  onDuplicate,
  onDelete,
  className = "",
  canManageAccess
}: ProductsDataTableProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const columns: DataTableColumn<Product>[] = [
    {
      id: "sku",
      header: t("products.table.sku"),
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-xs text-[var(--ink-secondary)]">
          {row.sku}
        </span>
      ),
    },
    {
      id: "name",
      header: t("products.table.name"),
      sortable: true,
      cell: (row) => (
        <span className="font-medium text-[var(--ink-primary)]">
          {row.name}
        </span>
      ),
    },
    {
      id: "category",
      header: t("products.table.category"),
      sortable: true,
      cell: (row) => (
        <span className="text-[var(--ink-secondary)]">{row.categoryId || "__"}</span>
      ),
    },
    {
      id: "unitOfMeasure",
      header: t("products.table.unit"),
      cell: (row) => (
        <span className="text-[var(--ink-secondary)]">
          {row.unitOfMeasure}
        </span>
      ),
    },
    {
      id: "costPrice",
      header: t("products.table.costPrice"),
      sortable: true,
      cell: (row) => (
        <span className="tabular-nums text-[var(--ink-secondary)]">
          {formatCurrency(row.costPrice)}
        </span>
      ),
    },
    {
      id: "salePrice",
      header: t("products.table.salePrice"),
      sortable: true,
      cell: (row) => (
        <span className="tabular-nums font-medium text-[var(--accent-emerald)]">
          {formatCurrency(row.salePrice)}
        </span>
      ),
    },
    {
      id: "status",
      header: t("products.table.status"),
      cell: (row) => (
        <StatusBadge
          status={row.isActive ? "active" : "inactive"}
          label={t(row.isActive ? "common.status.active" : "common.status.inactive")}
          size="sm"
        />
      ),
    },
    {
      id: "actions",
      header: "",
      cell: (row) => (
        canManageAccess && (
          <ProductActionMenu
            product={row}
            onEdit={() => onEdit(row)}
            onDuplicate={() => onDuplicate(row)}
            onDelete={() => onDelete(row)}
            onViewDetails={() => navigate(`${row.id}`)}
          />
        )
      ),
    },
  ];

  return (
    <DataTable<Product>
      columns={columns}
      rows={products}
      getRowId={(row) => row.id}
      isLoading={isLoading}
      onRowClick={(row) => navigate(`${row.id}`)}
      sortColumnId={sortColumnId}
      sortDirection={sortDirection}
      // onSortChange={onSortChange}
      // selectedIds={selectedIds}
      // onSelectionChange={onSelectionChange}
      skeletonRowCount={8}
      emptyState={
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <p className="text-sm font-medium text-[var(--ink-primary)]">
            {t("products.table.emptyTitle")}
          </p>
          <p className="text-sm text-[var(--ink-tertiary)]">
            {t("products.table.emptyBody")}
          </p>
        </div>
      }
      errorState={
        hasError ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <p className="text-sm font-medium text-[var(--ink-primary)]">
              {t("products.table.errorTitle")}
            </p>
            <p className="text-sm text-[var(--ink-tertiary)]">
              {t("products.table.errorBody")}
            </p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="mt-1 rounded-md bg-[var(--signal)] px-4 py-2 text-sm font-medium text-white transition-colors duration-150 ease-out hover:bg-[var(--signal-hover)]"
              >
                {t("common.actions.retry")}
              </button>
            )}
          </div>
        ) : undefined
      }
      className={className}
    />
  );
}
