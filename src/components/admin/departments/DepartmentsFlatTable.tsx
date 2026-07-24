// src/components/admin/departments/DepartmentsFlatTable.tsx
//
// The toggled "Flat" view — composes the existing generic DataTable
// (unlike DepartmentsTreeTable, which is bespoke, since a flat sortable
// table fits DataTable's model exactly). Shows a "Parent Department"
// text column instead of relying on indentation, since there's no tree
// structure to lean on here — this view exists specifically for tasks
// where flat scanning/sorting beats structural browsing.

import { useTranslation } from "react-i18next";
import { StatusBadge } from "../../common/StatusBadge";
import { DataTable, type DataTableColumn, type SortDirection } from "../../common/DataTable";

export interface DepartmentFlatRow {
  id: string;
  name: string;
  branchName: string;
  parentDepartmentName: string | null;
  isActive: boolean;
}

export interface DepartmentsFlatTableProps {
  rows: DepartmentFlatRow[];
  isLoading?: boolean;
  hasError?: boolean;
  onRetry?: () => void;
  onClearFilters?: () => void;
  isFiltered?: boolean;
  sortColumnId?: string | null;
  sortDirection?: SortDirection;
  onSortChange?: (columnId: string, direction: SortDirection) => void;
  onRowClick?: (row: DepartmentFlatRow) => void;
  renderRowActions?: (row: DepartmentFlatRow) => React.ReactNode;
}

export function DepartmentsFlatTable({
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
}: DepartmentsFlatTableProps) {
  const { t } = useTranslation();

  const columns: DataTableColumn<DepartmentFlatRow>[] = [
    {
      id: "name",
      header: t("departments.column.department"),
      sortable: true,
      cell: (row) => <span className="font-medium text-[var(--ink-primary)]">{row.name}</span>,
    },
    {
      id: "branch",
      header: t("departments.column.branch"),
      sortable: true,
      cell: (row) => row.branchName,
    },
    {
      id: "parentDepartment",
      header: t("departments.column.parentDepartment"),
      sortable: true,
      cell: (row) =>
        row.parentDepartmentName ?? (
          <span className="italic text-[var(--ink-tertiary)]">
            {t("departments.create.fields.parentDepartmentNone")}
          </span>
        ),
    },
    {
      id: "status",
      header: t("departments.column.status"),
      sortable: true,
      cell: (row) => (
        <StatusBadge
          status={row.isActive ? "active" : "inactive"}
          label={row.isActive ? t("users.status.active") : t("users.status.inactive")}
        />
      ),
    },
    ...(renderRowActions
      ? [
          {
            id: "actions",
            header: "",
            widthClass: "w-12",
            cell: (row: DepartmentFlatRow) => (
              <div onClick={(e) => e.stopPropagation()}>{renderRowActions(row)}</div>
            ),
          } as DataTableColumn<DepartmentFlatRow>,
        ]
      : []),
  ];

  const emptyState = (
    <div className="flex flex-col items-center gap-2 text-center">
      <p className="font-medium text-[var(--ink-primary)]">
        {isFiltered ? t("departments.list.empty.noMatches") : t("departments.list.empty.noDepartments")}
      </p>
      {isFiltered && onClearFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="text-sm text-[var(--signal)] hover:text-[var(--signal-hover)]"
        >
          {t("departments.list.empty.clearFilters")}
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
    <DataTable<DepartmentFlatRow>
      columns={columns}
      rows={rows}
      getRowId={(row) => row.id}
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
