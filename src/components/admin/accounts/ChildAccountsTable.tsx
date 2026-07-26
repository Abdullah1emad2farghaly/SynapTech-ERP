// src/components/admin/accounts/ChildAccountsTable.tsx
//
// Composes the generic DataTable directly (flat, sortable list of one
// account's direct children — not the whole tree, so DataTable's model
// fits here, unlike AccountsTree). Row click navigates to that child's
// own Details page. No "Move here" / "add child" action — creating a
// child is just Create with this account pre-selected as parent, since
// the API has no reparenting capability to build a dedicated action for.

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { StatusBadge } from "../../common/StatusBadge";
import { AccountTypeBadge } from "../../common/AccountTypeBadge";
import { DataTable, type DataTableColumn } from "../../common/DataTable";

export interface ChildAccountRow {
  id: string;
  code: string;
  name: string;
  accountType: string;
  isActive: boolean;
}

export interface ChildAccountsTableProps {
  rows: ChildAccountRow[];
}

export function ChildAccountsTable({ rows }: ChildAccountsTableProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const columns: DataTableColumn<ChildAccountRow>[] = [
    {
      id: "name",
      header: t("accounts.column.account"),
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-[var(--ink-primary)]">{row.name}</span>
          <span className="font-mono text-xs text-[var(--ink-tertiary)]">{row.code}</span>
        </div>
      ),
    },
    {
      id: "type",
      header: t("accounts.column.type"),
      cell: (row) => <AccountTypeBadge accountType={row.accountType} />,
    },
    {
      id: "status",
      header: t("accounts.column.status"),
      cell: (row) => (
        <StatusBadge
          status={row.isActive ? "active" : "inactive"}
          label={row.isActive ? t("users.status.active") : t("users.status.inactive")}
        />
      ),
    },
  ];

  const emptyState = (
    <p className="text-sm text-[var(--ink-tertiary)]">{t("accounts.details.noChildAccounts")}</p>
  );

  return (
    <DataTable<ChildAccountRow>
      columns={columns}
      rows={rows}
      getRowId={(row) => row.id}
      emptyState={emptyState}
      onRowClick={(row) => navigate(`/accounting/accounts/${row.id}`)}
    />
  );
}
