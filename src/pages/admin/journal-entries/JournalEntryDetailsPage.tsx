// Project path: src/pages/admin/journal-entries/JournalEntryDetailsPage.tsx
// Route: /accounting/journal-entries/:id

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Send, RotateCcw, Trash2, Printer, Clock } from "lucide-react";
import { useJournalEntry } from "../../../hooks/useJournalEntries";
import { JournalEntryStatusBadge } from "../../../components/admin/journal-entries/JournalEntryStatusBadge";
import { BalanceIndicator } from "../../../components/admin/journal-entries/BalanceIndicator";
import { JournalLinesTable } from "../../../components/admin/journal-entries/JournalLinesTable";
import { PostJournalDialog } from "../../../components/admin/journal-entries/PostJournalDialog";
import { ReverseJournalDialog } from "../../../components/admin/journal-entries/ReverseJournalDialog";
import { DeleteJournalDialog } from "../../../components/admin/journal-entries/DeleteJournalDialog";

export function JournalEntryDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: entry, isLoading } = useJournalEntry(id);

  const [postOpen, setPostOpen] = useState(false);
  const [reverseOpen, setReverseOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <div className="h-8 w-64 animate-pulse rounded bg-[--sunken]" />
        <div className="h-40 animate-pulse rounded-lg bg-[--sunken]" />
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="p-6 text-center text-sm text-[--ink-secondary]">
        {t("journalEntries.details.notFound")}
      </div>
    );
  }

  const totalDebit = entry.lines.reduce((s, l) => s + l.debit, 0);
  const totalCredit = entry.lines.reduce((s, l) => s + l.credit, 0);
  const canPost = entry.status === "Draft";
  const canReverse = entry.status === "Posted";
  const canDelete = entry.status === "Draft";

  return (
    <div className="flex flex-col gap-6 p-6">
      <button
        type="button"
        onClick={() => navigate("/accounting/journal-entries")}
        className="flex w-fit items-center gap-1.5 text-sm text-[--ink-secondary] hover:text-[--ink-primary]"
      >
        <ArrowLeft size={16} className="rtl:rotate-180" />
        {t("journalEntries.details.back")}
      </button>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-mono text-2xl font-semibold text-[--ink-primary]">
              {entry.entryNumber}
            </h1>
            <JournalEntryStatusBadge status={entry.status} />
          </div>
          <p className="mt-1 text-sm text-[--ink-secondary]">
            {new Date(entry.entryDate).toLocaleDateString()}
          </p>
          {entry.description && (
            <p className="mt-2 max-w-xl text-sm text-[--ink-secondary]">
              {entry.description}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canPost && (
            <button
              type="button"
              onClick={() => setPostOpen(true)}
              className="inline-flex items-center gap-2 rounded-md bg-[--signal] px-3 py-2 text-sm font-medium text-white hover:bg-[--signal-hover]"
            >
              <Send size={15} />
              {t("journalEntries.actions.post")}
            </button>
          )}
          {canReverse && (
            <button
              type="button"
              onClick={() => setReverseOpen(true)}
              className="inline-flex items-center gap-2 rounded-md border border-[--hairline] px-3 py-2 text-sm font-medium text-[--ink-primary] hover:bg-[--sunken]"
            >
              <RotateCcw size={15} />
              {t("journalEntries.actions.reverse")}
            </button>
          )}
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-md border border-[--hairline] px-3 py-2 text-sm font-medium text-[--ink-primary] hover:bg-[--sunken]"
          >
            <Printer size={15} />
            {t("journalEntries.actions.print")}
          </button>
          {canDelete && (
            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              className="inline-flex items-center gap-2 rounded-md border border-[--hairline] px-3 py-2 text-sm font-medium text-[--error] hover:bg-[--error]/5"
            >
              <Trash2 size={15} />
              {t("journalEntries.actions.delete")}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-[--hairline] bg-[--panel] p-4">
          <p className="text-xs text-[--ink-tertiary]">{t("journalEntries.totals.debit")}</p>
          <p className="text-lg font-semibold text-[--ink-primary]">{totalDebit.toFixed(2)}</p>
        </div>
        <div className="rounded-lg border border-[--hairline] bg-[--panel] p-4">
          <p className="text-xs text-[--ink-tertiary]">{t("journalEntries.totals.credit")}</p>
          <p className="text-lg font-semibold text-[--ink-primary]">{totalCredit.toFixed(2)}</p>
        </div>
        <div className="rounded-lg border border-[--hairline] bg-[--panel] p-4">
          <p className="text-xs text-[--ink-tertiary]">{t("journalEntries.totals.difference")}</p>
          <p className="text-lg font-semibold text-[--ink-primary]">
            {(totalDebit - totalCredit).toFixed(2)}
          </p>
        </div>
        <div className="rounded-lg border border-[--hairline] bg-[--panel] p-4">
          <p className="text-xs text-[--ink-tertiary]">{t("journalEntries.details.lineCount")}</p>
          <p className="text-lg font-semibold text-[--ink-primary]">{entry.lines.length}</p>
        </div>
      </div>

      <BalanceIndicator totalDebit={totalDebit} totalCredit={totalCredit} />

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-[--ink-primary]">
          {t("journalEntries.details.lines")}
        </h2>
        <JournalLinesTable lines={entry.lines} />
      </div>

      {/* Timeline is explicitly a placeholder per the brief — no audit/history endpoint exists yet. */}
      <div className="flex items-center gap-2 rounded-lg border border-dashed border-[--hairline] p-4 text-sm text-[--ink-tertiary]">
        <Clock size={16} />
        {t("journalEntries.details.timelineComingSoon")}
      </div>

      <PostJournalDialog entry={entry} open={postOpen} onClose={() => setPostOpen(false)} />
      <ReverseJournalDialog
        entry={entry}
        open={reverseOpen}
        onClose={() => setReverseOpen(false)}
      />
      <DeleteJournalDialog
        entry={entry}
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          navigate("/accounting/journal-entries");
        }}
      />
    </div>
  );
}
