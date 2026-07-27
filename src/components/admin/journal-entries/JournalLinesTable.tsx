// Project path: src/components/admin/journal-entries/JournalLinesTable.tsx
//
// Resolves accountId -> code/name via the (unconfirmed) accounts lookup, since
// JournalEntryLineResponse only carries accountId per the assumed shape.

import { useTranslation } from "react-i18next";
import { useAccountsLookup } from "../../../hooks/useJournalEntries";
import type { JournalEntryLineResponse } from "../../../types/journalEntries.types";

interface JournalLinesTableProps {
  lines: JournalEntryLineResponse[];
}

export function JournalLinesTable({ lines }: JournalLinesTableProps) {
  const { t } = useTranslation();
  const { data: accounts = [] } = useAccountsLookup();
  const accountById = new Map(accounts.map((a) => [a.id, a]));

  return (
    <div className="overflow-x-auto rounded-lg border border-[--hairline]">
      <table className="w-full min-w-max text-sm">
        <thead className="sticky top-0 bg-[--sunken] text-xs text-[--ink-secondary]">
          <tr>
            <th className="px-3 py-2 text-start">{t("journalEntries.lines.accountCode")}</th>
            <th className="px-3 py-2 text-start">{t("journalEntries.lines.accountName")}</th>
            <th className="px-3 py-2 text-start">{t("journalEntries.table.description")}</th>
            <th className="px-3 py-2 text-end">{t("journalEntries.lines.debit")}</th>
            <th className="px-3 py-2 text-end">{t("journalEntries.lines.credit")}</th>
            <th className="px-3 py-2 text-end">{t("journalEntries.lines.rowTotal")}</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line) => {
            const account = accountById.get(line.accountId);
            return (
              <tr key={line.id} className="border-t border-[--hairline] hover:bg-[--sunken]">
                <td className="px-3 py-2 font-mono text-xs text-[--ink-secondary]">
                  {account?.code ?? "—"}
                </td>
                <td className="px-3 py-2 text-[--ink-primary]">
                  {account?.name ?? line.accountId}
                </td>
                <td className="px-3 py-2 text-[--ink-secondary]">
                  {line.description || "—"}
                </td>
                <td className="px-3 py-2 text-end text-[--ink-primary]">
                  {line.debit ? line.debit.toFixed(2) : "—"}
                </td>
                <td className="px-3 py-2 text-end text-[--ink-primary]">
                  {line.credit ? line.credit.toFixed(2) : "—"}
                </td>
                <td className="px-3 py-2 text-end font-medium text-[--ink-primary]">
                  {(line.debit - line.credit).toFixed(2)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
