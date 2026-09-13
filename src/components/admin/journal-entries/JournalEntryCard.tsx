// src/components/admin/journal-entries/JournalEntryCard.tsx
//
// Mobile counterpart to JournalEntriesTable's rows — entryNumber as title,
// Date/Description/Lines count/Debit/Credit/Diff as the body, mirroring
// the table's stacked totals block and its balanced/unbalanced diff color
// exactly.

import { useTranslation } from "react-i18next";
import { EntityCard, type EntityCardField } from "../../common/EntityCard";
import { JournalEntryStatusBadge } from "./JournalEntryStatusBadge";
// import { lineTotals } from "../../../utils/journalEntryTotals"; // ASSUMPTION: confirm real import path
import type { JournalEntryResponse } from "../../../types/journalEntries.types";
import { lineTotals } from "./JournalEntriesTable";

export interface JournalEntryCardProps {
  entry: JournalEntryResponse;
  onClick: (id: string) => void;
  renderActions: () => React.ReactNode;
}

export function JournalEntryCard({ entry, onClick, renderActions }: JournalEntryCardProps) {
  const { t } = useTranslation();
  const { debit, credit, difference } = lineTotals(entry);
  const balanced = Math.abs(difference) < 0.005;

  const fields: EntityCardField[] = [
    {
      key: "entryDate",
      label: t("journalEntries.table.date"),
      value: new Date(entry.entryDate).toLocaleDateString(),
      dir: "ltr",
    },
    {
      key: "description",
      label: t("journalEntries.table.description"),
      value: entry.description || "—",
    },
    {
      key: "lines",
      label: t("journalEntries.table.lines"),
      value: entry.lines.length,
      dir: "ltr",
    },
    {
      key: "debit",
      label: t("journalEntries.table.debitShort"),
      value: <span className="text-[--success]">{debit.toFixed(2)}</span>,
      dir: "ltr",
    },
    {
      key: "credit",
      label: t("journalEntries.table.creditShort"),
      value: <span className="text-[--error]">{credit.toFixed(2)}</span>,
      dir: "ltr",
    },
    {
      key: "diff",
      label: t("journalEntries.table.diffShort"),
      value: (
        <span className={balanced ? "text-[--warning]" : "text-[--error]"}>{difference.toFixed(2)}</span>
      ),
      dir: "ltr",
    },
  ];

  return (
    <EntityCard
      id={entry.id}
      title={entry.entryNumber}
      badge={<JournalEntryStatusBadge status={entry.status} />}
      fields={fields}
      onClick={onClick}
      renderActions={renderActions}
    />
  );
  // Note: the table renders entryNumber in a mono font (via a button), but
  // EntityCard's title is plain font-medium with no mono option. Flag if
  // you want a `titleClassName` prop added to EntityCard for cases like
  // this, or if plain is fine for the card.
}
