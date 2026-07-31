// src/components/admin/categories/CategoriesTable.tsx
//
// The toggled Table view — composes the generic DataTable directly,
// same reasoning as DepartmentsFlatTable: a flat sortable table fits
// DataTable's model, unlike the tree. Hierarchy Level is derived client-
// side (depth in the tree, computed by the page and passed in as a
// plain field on each row) since there's no such field on the API.
//
// Row selection here powers BulkStatusToolbar (Activate/Deactivate
// selected only — no Bulk Delete, per the design doc's stance that
// destructive bulk actions need a stronger safety net than a checkbox
// list provides).

import { useTranslation } from "react-i18next";
import { StatusBadge } from "../../common/StatusBadge";
import { DataTable, type DataTableColumn, type SortDirection } from "../../common/DataTable";

export interface CategoryFlatRow {
  id: string;
  name: string;
  parentName: string | null;
  hierarchyLevel: number;
  isActive: boolean;
  childrenCount: number;
}

export interface CategoriesTableProps {
  rows: CategoryFlatRow[];
  isLoading?: boolean;
  hasError?: boolean;
  onRetry?: () => void;
  onClearFilters?: () => void;
  isFiltered?: boolean;
  sortColumnId?: string | null;
  sortDirection?: SortDirection;
  onSortChange?: (columnId: string, direction: SortDirection) => void;
  selectedIds?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;
  onRowClick?: (row: CategoryFlatRow) => void;
  renderRowActions?: (row: CategoryFlatRow) => React.ReactNode;
}

export function CategoriesTable({
  rows,
  isLoading,
  hasError,
  onRetry,
  onClearFilters,
  isFiltered,
  sortColumnId,
  sortDirection,
  onSortChange,
  selectedIds,
  onSelectionChange,
  onRowClick,
  renderRowActions,
}: CategoriesTableProps) {
  const { t } = useTranslation();

  const columns: DataTableColumn<CategoryFlatRow>[] = [
    {
      id: "name",
      header: t("categories.column.category"),
      sortable: true,
      cell: (row) => <span className="font-medium text-[var(--ink-primary)]">{row.name}</span>,
    },
    {
      id: "parent",
      header: t("categories.column.parent"),
      cell: (row) =>
        row.parentName ?? (
          <span className="italic text-[var(--ink-tertiary)]">
            {t("categories.create.fields.parentCategoryNone")}
          </span>
        ),
    },
    {
      id: "hierarchyLevel",
      header: t("categories.column.hierarchyLevel"),
      sortable: true,
      cell: (row) => row.hierarchyLevel,
    },
    {
      id: "status",
      header: t("categories.column.status"),
      sortable: true,
      cell: (row) => (
        <StatusBadge
          status={row.isActive ? "active" : "inactive"}
          label={row.isActive ? t("users.status.active") : t("users.status.inactive")}
        />
      ),
    },
    {
      id: "childrenCount",
      header: t("categories.column.childrenCount"),
      cell: (row) => row.childrenCount,
    },
    ...(renderRowActions
      ? [
          {
            id: "actions",
            header: "",
            widthClass: "w-12",
            cell: (row: CategoryFlatRow) => (
              <div onClick={(e) => e.stopPropagation()}>{renderRowActions(row)}</div>
            ),
          } as DataTableColumn<CategoryFlatRow>,
        ]
      : []),
  ];

  const emptyState = (
    <div className="flex flex-col items-center gap-2 text-center">
      <p className="font-medium text-[var(--ink-primary)]">
        {isFiltered ? t("categories.list.empty.noMatches") : t("categories.list.empty.noCategories")}
      </p>
      {isFiltered && onClearFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="text-sm text-[var(--signal)] hover:text-[var(--signal-hover)]"
        >
          {t("categories.list.empty.clearFilters")}
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
    <DataTable<CategoryFlatRow>
      columns={columns}
      rows={rows}
      getRowId={(row) => row.id}
      isLoading={isLoading}
      emptyState={emptyState}
      errorState={hasError ? errorState : undefined}
      sortColumnId={sortColumnId}
      sortDirection={sortDirection}
      onSortChange={onSortChange}
      selectedIds={selectedIds}
      onSelectionChange={onSelectionChange}
      onRowClick={onRowClick}
    />
  );
}
