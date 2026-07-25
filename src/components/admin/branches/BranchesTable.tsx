// src/components/admin/branches/BranchesTable.tsx
//
// Composes the generic DataTable directly — Branches is flat data, no
// hierarchy the way Departments has, so unlike DepartmentsTreeTable this
// doesn't need a bespoke tree renderer.

import { useTranslation } from "react-i18next";
import { StatusBadge } from "../../common/StatusBadge";
import { MainBranchBadge } from "../../common/MainBranchBadge";
import { DataTable, type DataTableColumn, type SortDirection } from "../../common/DataTable";

export interface BranchRow {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  isMain: boolean;
  isActive: boolean;
}

export interface BranchesTableProps {
  rows: BranchRow[];
  isLoading?: boolean;
  hasError?: boolean;
  onRetry?: () => void;
  onClearFilters?: () => void;
  isFiltered?: boolean;
  sortColumnId?: string | null;
  sortDirection?: SortDirection;
  onSortChange?: (columnId: string, direction: SortDirection) => void;
  onRowClick?: (row: BranchRow) => void;
  renderRowActions?: (row: BranchRow) => React.ReactNode;
}

export function BranchesTable({
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
}: BranchesTableProps) {
  const { t } = useTranslation();

  const columns: DataTableColumn<BranchRow>[] = [
    {
      id: "name",
      header: t("branches.column.branch"),
      sortable: true,
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-[var(--ink-primary)]">{row.name}</span>
          <span className="font-mono text-xs text-[var(--ink-tertiary)]">{row.code}</span>
        </div>
      ),
    },
    {
      id: "address",
      header: t("branches.column.address"),
      cell: (row) => (
        <span className="block max-w-[220px] truncate" title={row.address} aria-label={row.address}>
          {row.address || "—"}
        </span>
      ),
    },
    {
      id: "phone",
      header: t("branches.column.phone"),
      cell: (row) => (
        <span dir="ltr" className="inline-block text-start">
          {row.phone || "—"}
        </span>
      ),
    },
    {
      id: "main",
      header: "",
      widthClass: "w-28",
      cell: (row) => (row.isMain ? <MainBranchBadge label={t("branches.badge.main")} /> : null),
    },
    {
      id: "status",
      header: t("branches.column.status"),
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
            cell: (row: BranchRow) => (
              <div onClick={(e) => e.stopPropagation()}>{renderRowActions(row)}</div>
            ),
          } as DataTableColumn<BranchRow>,
        ]
      : []),
  ];

  const emptyState = (
    <div className="flex flex-col items-center gap-2 text-center">
      <p className="font-medium text-[var(--ink-primary)]">
        {isFiltered ? t("branches.list.empty.noMatches") : t("branches.list.empty.noBranches")}
      </p>
      {isFiltered && onClearFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="text-sm text-[var(--signal)] hover:text-[var(--signal-hover)]"
        >
          {t("branches.list.empty.clearFilters")}
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
    <DataTable<BranchRow>
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
