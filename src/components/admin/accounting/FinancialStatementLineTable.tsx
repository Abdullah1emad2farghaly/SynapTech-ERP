
// Project path:
// src/components/admin/accounting/FinancialStatementLineTable.tsx
//
// Renders a section's lines (Assets / Liabilities / Equity / Revenue /
// Expenses) as Code / Name / Balance.
//
// Reused by both the Balance Sheet and the Income Statement because
// FinancialStatementLineResponse has the same data shape in both contracts.

import { useTranslation } from "react-i18next";
import { DataTable } from "../../common/DataTable";
import { EmptyState } from "../../common/EmptyState";
import { formatCurrency } from "../../../utils/formatters";
import type { FinancialStatementLineResponse } from "../../../types/financial-statements.types";

interface FinancialStatementLineTableProps {
  lines: FinancialStatementLineResponse[] | null;
  emptyLabel: string;
}

export function FinancialStatementLineTable({
  lines,
  emptyLabel,
}: FinancialStatementLineTableProps) {
  const { t } = useTranslation();

  return (
    <DataTable<FinancialStatementLineResponse>
      columns={[
        {
          id: "code",
          header: t("reports.columns.code"),
          cell: (row) => (
            <span className="font-mono text-[var(--ink-secondary)]">
              {row.code ?? "—"}
            </span>
          ),
          widthClass: "w-32",
        },
        {
          id: "name",
          header: t("reports.columns.name"),
          cell: (row) => (
            <span className="text-[var(--ink-primary)]">
              {row.name ?? "—"}
            </span>
          ),
        },
        {
          id: "balance",
          header: t("reports.columns.balance"),
          cell: (row) => (
            <span className="block text-end font-medium tabular-nums text-[var(--ink-primary)]">
              {formatCurrency(row.balance)}
            </span>
          ),
          widthClass: "w-48",
        },
      ]}
      rows={lines ?? []}
      getRowId={(row) => String(row.accountId)}
      emptyState={<EmptyState title={emptyLabel} />}
    />
  );
}

