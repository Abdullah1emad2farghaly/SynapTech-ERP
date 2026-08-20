// src/components/admin/customers/CustomersTable.tsx
//
// Composes the generic DataTable directly — flat data, no hierarchy.
// Address is deliberately NOT a column (too long to scan usefully in a
// table; it lives on Details/the form instead, per the design doc).
// Tax Number is monospace, matching the established code-formatting
// convention from Branches/Accounts.

import { useTranslation } from "react-i18next";
import { StatusBadge } from "../../common/StatusBadge";
import {
  DataTable,
  type DataTableColumn,
  type SortDirection,
} from "../../common/DataTable";
import { hasAnyPermission } from "@/utils/permissions";

export interface CustomerRow {
  id: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  taxNumber: string;
  isActive: boolean;
}

export interface CustomersTableProps {
  rows: CustomerRow[];
  isLoading?: boolean;
  hasError?: boolean;
  onRetry?: () => void;
  onClearFilters?: () => void;
  isFiltered?: boolean;
  sortColumnId?: string | null;
  sortDirection?: SortDirection;
  onSortChange?: (
    columnId: string,
    direction: SortDirection,
  ) => void;
  onRowClick?: (row: CustomerRow) => void;
  renderRowActions?: (row: CustomerRow) => React.ReactNode;
}

export function CustomersTable({
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
}: CustomersTableProps) {
  const { t } = useTranslation();

  /**
   * Check whether the current user can manage customers.
   *
   * useHasAnyPermission internally gets the current user's
   * permissions from useMyPermissions().
   */
  const canManageCustomers = hasAnyPermission([
    "sales.customers.manage",
  ]);

  const columns: DataTableColumn<CustomerRow>[] = [
    {
      id: "name",
      header: t("customers.column.name"),
      sortable: true,
      cell: (row) => (
        <span className="font-medium text-[var(--ink-primary)]">
          {row.name}
        </span>
      ),
    },

    {
      id: "contactName",
      header: t("customers.column.contactName"),
      sortable: true,
      cell: (row) => (
        <span className="text-[var(--ink-secondary)]">
          {row.contactName || "—"}
        </span>
      ),
    },

    {
      id: "phone",
      header: t("customers.column.phone"),
      cell: (row) => (
        <span
          dir="ltr"
          className="inline-block text-start text-[var(--ink-secondary)]"
        >
          {row.phone || "—"}
        </span>
      ),
    },

    {
      id: "email",
      header: t("customers.column.email"),
      cell: (row) => (
        <span
          dir="ltr"
          className="inline-block text-start text-[var(--ink-secondary)]"
        >
          {row.email || "—"}
        </span>
      ),
    },

    {
      id: "taxNumber",
      header: t("customers.column.taxNumber"),
      cell: (row) => (
        <span className="font-mono text-xs text-[var(--ink-tertiary)]">
          {row.taxNumber || "—"}
        </span>
      ),
    },

    {
      id: "status",
      header: t("customers.column.status"),
      sortable: true,
      cell: (row) => (
        <StatusBadge
          status={row.isActive ? "active" : "inactive"}
          label={
            row.isActive
              ? t("users.status.active")
              : t("users.status.inactive")
          }
        />
      ),
    },

    // Show row actions only when:
    // 1. The user has sales.customers.manage permission.
    // 2. renderRowActions was actually provided.
    ...(canManageCustomers && renderRowActions
      ? [
          {
            id: "actions",
            header: "",
            widthClass: "w-12",
            cell: (row: CustomerRow) => (
              <div onClick={(e) => e.stopPropagation()}>
                {renderRowActions(row)}
              </div>
            ),
          } as DataTableColumn<CustomerRow>,
        ]
      : []),
  ];

  const emptyState = (
    <div className="flex flex-col items-center gap-2 text-center">
      <p className="font-medium text-[var(--ink-primary)]">
        {isFiltered
          ? t("customers.list.empty.noMatches")
          : t("customers.list.empty.noCustomers")}
      </p>

      {isFiltered && onClearFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="text-sm text-[var(--signal)] hover:text-[var(--signal-hover)]"
        >
          {t("customers.list.empty.clearFilters")}
        </button>
      )}
    </div>
  );

  const errorState = (
    <div className="flex flex-col items-center gap-2 text-center">
      <p className="font-medium text-[var(--error)]">
        {t("common.errors.loadFailed")}
      </p>

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
    <DataTable<CustomerRow>
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
