// Project path: src/components/admin/accounting/CashFlowMovementsTable.tsx

import { useTranslation } from "react-i18next";
import { DataTable } from "../../common/DataTable";
import { EmptyState } from "../../common/EmptyState";
import { formatCurrency, formatDate } from "../../../utils/formatters";
import type { CashFlowLineResponse } from "../../../types/financial-statements.types";

interface CashFlowMovementsTableProps {
  movements: CashFlowLineResponse[] | null;
}

export function CashFlowMovementsTable({
  movements,
}: CashFlowMovementsTableProps) {
  const { t } = useTranslation();

  return (
    <DataTable<CashFlowLineResponse>
      columns={[
        {
          id: "date",
          header: t("reports.columns.date"),
          cell: (row) => (
            <span className="whitespace-nowrap text-[var(--ink-primary)]">
              {formatDate(row.date)}
            </span>
          ),
          widthClass: "w-36",
        },
        {
          id: "description",
          header: t("reports.columns.description"),
          cell: (row) => (
            <span className="text-[var(--ink-primary)]">
              {row.description ?? "—"}
            </span>
          ),
        },
        {
          id: "debit",
          header: t("reports.columns.debit"),
          cell: (row) => (
            <span className="block text-end tabular-nums text-[var(--ink-primary)]">
              {formatCurrency(row.debit)}
            </span>
          ),
          widthClass: "w-40",
        },
        {
          id: "credit",
          header: t("reports.columns.credit"),
          cell: (row) => (
            <span className="block text-end tabular-nums text-[var(--ink-primary)]">
              {formatCurrency(row.credit)}
            </span>
          ),
          widthClass: "w-40",
        },
        {
          id: "runningBalance",
          header: t("cashFlow.runningBalance"),
          cell: (row) => (
            <span className="block text-end font-medium tabular-nums text-[var(--ink-primary)]">
              {formatCurrency(row.runningBalance)}
            </span>
          ),
          widthClass: "w-44",
        },
      ]}
      rows={movements ?? []}
      getRowId={(row) => `${row.date}-${row.description ?? ""}-${row.runningBalance}`}
      emptyState={<EmptyState title={t("cashFlow.noMovements")} />}
    />
  );
}
