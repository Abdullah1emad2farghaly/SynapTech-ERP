// src/components/admin/users/UsersDataTable.tsx
//
// Composes the generic DataTable with Users-specific columns. No business
// logic or fetching here — parent page owns data, sort/page state, and
// selection; this component only renders and reports interactions upward.
//
// Assumes a `User` shape matching the confirmed API response (Id, Full
// Name, Email, BranchId, DepartmentId, Roles, IsActive) plus resolved
// display names for Branch/Department, which the page-level hook is
// expected to attach via a lookup (see note in the module design doc).
// Adjust the import path below to match your actual types/users.types.ts.

import { useTranslation } from "react-i18next";
import { Avatar } from "../../common/Avatar";
import { StatusBadge } from "../../common/StatusBadge";
import { DataTable, type DataTableColumn, type SortDirection } from "../../common/DataTable";
import { RoleBadge, RoleOverflowChip } from "./RoleBadge";
import { User } from "@/types/users.types";

export interface UserRow {
  id: string;
  fullName: string;
  email: string;
  branchName: string;
  departmentName: string;
  roles: string[];
  isActive: boolean;
}

const MAX_INLINE_ROLES = 2;

export interface UsersDataTableProps {
  rows: User[];
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
  onRowClick?: (row: UserRow) => void;
  /** Rendered per row, typically the UserActionMenu kebab. */
  renderRowActions?: (row: User) => React.ReactNode;
  hiddenColumnIds?: string[];
}

export function UsersDataTable({
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
  hiddenColumnIds = [],
}: UsersDataTableProps) {
  const { t } = useTranslation();

  const columns: DataTableColumn<UserRow>[] = [
    {
      id: "user",
      header: t("users.list.column.user"),
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.fullName} size="sm" />
          <div className="flex flex-col">
            <span className="font-medium text-[var(--ink-primary)]">{row.fullName}</span>
            <span className="text-xs text-[var(--ink-tertiary)]">{row.email}</span>
          </div>
        </div>
      ),
    },
    {
      id: "branch",
      header: t("users.list.column.branch"),
      sortable: true,
      hidden: hiddenColumnIds.includes("branch"),
      cell: (row) => row.branchName,
    },
    {
      id: "department",
      header: t("users.list.column.department"),
      sortable: true,
      hidden: hiddenColumnIds.includes("department"),
      cell: (row) => row.departmentName,
    },
    {
      id: "roles",
      header: t("users.list.column.roles"),
      cell: (row) => {
        const shown = row.roles.slice(0, MAX_INLINE_ROLES);
        const overflow = row.roles.length - shown.length;
        return (
          <div className="flex flex-wrap items-center gap-1">
            {shown.map((role) => (
              <RoleBadge key={role} label={role} />
            ))}
            {overflow > 0 && <RoleOverflowChip count={overflow} />}
          </div>
        );
      },
    },
    {
      id: "status",
      header: t("users.list.column.status"),
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
            cell: (row: User) => (
              <div onClick={(e) => e.stopPropagation()}>{renderRowActions(row)}</div>
            ),
          } as DataTableColumn<UserRow>,
        ]
      : []),
  ];

  const emptyState = (
    <div className="flex flex-col items-center gap-2 text-center">
      <p className="font-medium text-[var(--ink-primary)]">
        {isFiltered ? t("users.list.empty.noMatches") : t("users.list.empty.noUsers")}
      </p>
      {isFiltered && onClearFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="text-sm text-[var(--signal)] hover:text-[var(--signal-hover)]"
        >
          {t("users.list.empty.clearFilters")}
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
    <DataTable<UserRow>
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
