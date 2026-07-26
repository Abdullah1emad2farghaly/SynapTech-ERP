// Project path: src/components/admin/journal-entries/JournalEntriesTable.tsx
//
// Columns match the confirmed fields: Entry Number, Date, Description, Status,
// Line count, Total Debit/Credit/Difference (derived from lines[]). "Created
// By" is omitted — the brief itself marks it future-ready/no field exists.

import { useTranslation } from "react-i18next";
import { FileText, MoreVertical, Eye, Send, RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import { DataTable, type DataTableColumn } from "../../common/DataTable";
import { JournalEntryStatusBadge } from "./JournalEntryStatusBadge";
import type { JournalEntryResponse } from "../../../types/journalEntries.types";

interface JournalEntriesTableProps {
  entries: JournalEntryResponse[];
  isLoading: boolean;
  onView: (entry: JournalEntryResponse) => void;
  onPost: (entry: JournalEntryResponse) => void;
  onReverse: (entry: JournalEntryResponse) => void;
  onDelete: (entry: JournalEntryResponse) => void;
}

function lineTotals(entry: JournalEntryResponse) {
  const debit = entry.lines.reduce((s, l) => s + l.debit, 0);
  const credit = entry.lines.reduce((s, l) => s + l.credit, 0);
  return { debit, credit, difference: debit - credit };
}

interface RowActionsProps {
  entry: JournalEntryResponse;
  onView: JournalEntriesTableProps["onView"];
  onPost: JournalEntriesTableProps["onPost"];
  onReverse: JournalEntriesTableProps["onReverse"];
  onDelete: JournalEntriesTableProps["onDelete"];
}

function RowActions({
  entry,
  onView,
  onPost,
  onReverse,
  onDelete,
}: RowActionsProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const canPost = entry.status === "Draft";
  const canReverse = entry.status === "Posted";
  const canDelete = entry.status === "Draft";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        className="inline-flex items-center justify-center rounded-md p-1.5 text-[--ink-secondary] hover:bg-[--sunken]"
      >
        <MoreVertical size={16} />
      </button>
      {open && (
        <div className="absolute end-0 z-10 mt-1 w-44 overflow-hidden rounded-md border border-[--hairline] bg-[--panel] py-1 shadow-[var(--elevation-1)]">
          <button
            type="button"
            onClick={() => onView(entry)}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[--ink-primary] hover:bg-[--sunken]"
          >
            <Eye size={15} /> {t("journalEntries.actions.viewDetails")}
          </button>
          {canPost && (
            <button
              type="button"
              onClick={() => onPost(entry)}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[--ink-primary] hover:bg-[--sunken]"
            >
              <Send size={15} /> {t("journalEntries.actions.post")}
            </button>
          )}
          {canReverse && (
            <button
              type="button"
              onClick={() => onReverse(entry)}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[--ink-primary] hover:bg-[--sunken]"
            >
              <RotateCcw size={15} /> {t("journalEntries.actions.reverse")}
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              onClick={() => onDelete(entry)}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[--error] hover:bg-[--sunken]"
            >
              <Trash2 size={15} /> {t("journalEntries.actions.delete")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function JournalEntriesTable({
  entries,
  isLoading,
  onView,
  onPost,
  onReverse,
  onDelete,
}: JournalEntriesTableProps) {
  const { t } = useTranslation();

  const columns: DataTableColumn<JournalEntryResponse>[] = [
    {
      id: "entryNumber",
      header: t("journalEntries.table.entryNumber"),
      cell: (entry) => (
        <button
          type="button"
          onClick={() => onView(entry)}
          className="font-mono text-sm font-medium text-[--ink-primary] hover:text-[--signal]"
        >
          {entry.entryNumber}
        </button>
      ),
    },
    {
      id: "entryDate",
      header: t("journalEntries.table.date"),
      cell: (entry) => (
        <span className="text-sm text-[--ink-secondary]">
          {new Date(entry.entryDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: "description",
      header: t("journalEntries.table.description"),
      cell: (entry) => (
        <span className="line-clamp-1 text-sm text-[--ink-secondary]">
          {entry.description || "—"}
        </span>
      ),
    },
    {
      id: "status",
      header: t("journalEntries.table.status"),
      cell: (entry) => <JournalEntryStatusBadge status={entry.status} />,
    },
    {
      id: "lines",
      header: t("journalEntries.table.lines"),
      cell: (entry) => (
        <span className="text-sm text-[--ink-secondary]">{entry.lines.length}</span>
      ),
    },
    {
      id: "totals",
      header: t("journalEntries.table.debitCreditDiff"),
      cell: (entry) => {
        const { debit, credit, difference } = lineTotals(entry);
        const balanced = Math.abs(difference) < 0.005;
        return (
          <div className="flex flex-col text-xs">
            <span className="text-[--ink-secondary]">
              {t("journalEntries.table.debitShort")} {debit.toFixed(2)}
            </span>
            <span className="text-[--ink-secondary]">
              {t("journalEntries.table.creditShort")} {credit.toFixed(2)}
            </span>
            <span className={balanced ? "text-[--success]" : "text-[--error]"}>
              {t("journalEntries.table.diffShort")} {difference.toFixed(2)}
            </span>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: (entry) => (
        <RowActions
          entry={entry}
          onView={onView}
          onPost={onPost}
          onReverse={onReverse}
          onDelete={onDelete}
        />
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={entries}
      getRowId={(entry) => entry.id}
      isLoading={isLoading}
      skeletonRowCount={6}
      emptyState={
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <FileText size={32} className="text-[--ink-tertiary]" />
          <p className="font-medium text-[--ink-primary]">
            {t("journalEntries.empty.title")}
          </p>
          <p className="max-w-sm text-sm text-[--ink-secondary]">
            {t("journalEntries.empty.description")}
          </p>
        </div>
      }
    />
  );
}
