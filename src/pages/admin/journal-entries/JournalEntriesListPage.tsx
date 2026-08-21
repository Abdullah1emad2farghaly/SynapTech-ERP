// Project path: src/pages/admin/journal-entries/JournalEntriesListPage.tsx
// Route: /accounting/journal-entries

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useJournalEntries } from "../../../hooks/useJournalEntries";
import { JournalEntriesStats } from "../../../components/admin/journal-entries/JournalEntriesStats";
import {
  JournalEntriesToolbar,
  type JournalEntriesFilters,
  type JournalEntriesSortOption,
} from "../../../components/admin/journal-entries/JournalEntriesToolbar";
import { JournalEntriesTable } from "../../../components/admin/journal-entries/JournalEntriesTable";
import { PostJournalDialog } from "../../../components/admin/journal-entries/PostJournalDialog";
import { ReverseJournalDialog } from "../../../components/admin/journal-entries/ReverseJournalDialog";
import { DeleteJournalDialog } from "../../../components/admin/journal-entries/DeleteJournalDialog";
import type { JournalEntryResponse } from "../../../types/journalEntries.types";

const DEFAULT_FILTERS: JournalEntriesFilters = {
  search: "",
  status: "all",
  dateFrom: "",
  dateTo: "",
  hasReversal: "all",
};

type DialogState =
  | { type: "post"; entry: JournalEntryResponse }
  | { type: "reverse"; entry: JournalEntryResponse }
  | { type: "delete"; entry: JournalEntryResponse }
  | null;

export function JournalEntriesListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: entries = [], isLoading, isFetching, refetch } = useJournalEntries();

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [sort, setSort] = useState<JournalEntriesSortOption>("dateNewest");
  const [dialog, setDialog] = useState<DialogState>(null);
  


  const visibleEntries = useMemo(() => {
    let result = entries;

    if (filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      result = result.filter(
        (e) =>
          e.entryNumber.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q)
      );
    }
    if (filters.status !== "all") {
      result = result.filter((e) => e.status === filters.status);
    }
    if (filters.dateFrom) {
      result = result.filter((e) => e.entryDate >= filters.dateFrom);
    }
    if (filters.dateTo) {
      result = result.filter((e) => e.entryDate <= filters.dateTo);
    }
    if (filters.hasReversal === "yes") {
      result = result.filter((e) => Boolean(e.reversalOfEntryId));
    } else if (filters.hasReversal === "no") {
      result = result.filter((e) => !e.reversalOfEntryId);
    }

    return [...result].sort((a, b) => {
      if (sort === "dateNewest") return b.entryDate.localeCompare(a.entryDate);
      if (sort === "dateOldest") return a.entryDate.localeCompare(b.entryDate);
      if (sort === "entryNumber") return a.entryNumber.localeCompare(b.entryNumber);
      return String(a.status).localeCompare(String(b.status));
    });
  }, [entries, filters, sort]);

  return (
    <div className="flex flex-col gap-6 px-2 py-6 md:p-6">
      <div>
        <h1 className="text-2xl font-semibold text-[--ink-primary]">
          {t("journalEntries.page.title")}
        </h1>
        <p className="mt-1 text-sm text-[--ink-secondary]">
          {t("journalEntries.page.description")}
        </p>
      </div>

      <JournalEntriesStats entries={entries} isLoading={isLoading} />

      <JournalEntriesToolbar
        filters={filters}
        onFiltersChange={setFilters}
        sortValue={sort}
        onSortChange={setSort}
        onRefresh={() => refetch()}
        isRefreshing={isFetching}
        onCreate={() => navigate("/accounting/journal-entries/create")}
      />

      <JournalEntriesTable
        entries={visibleEntries}
        isLoading={isLoading}
        onView={(entry) => navigate(`/accounting/journal-entries/${entry.id}`)}
        onPost={(entry) => setDialog({ type: "post", entry })}
        onReverse={(entry) => setDialog({ type: "reverse", entry })}
        onDelete={(entry) => setDialog({ type: "delete", entry })}
      />

      <PostJournalDialog
        entry={dialog?.type === "post" ? dialog.entry : null}
        open={dialog?.type === "post"}
        onClose={() => setDialog(null)}
      />
      <ReverseJournalDialog
        entry={dialog?.type === "reverse" ? dialog.entry : null}
        open={dialog?.type === "reverse"}
        onClose={() => setDialog(null)}
      />
      <DeleteJournalDialog
        entry={dialog?.type === "delete" ? dialog.entry : null}
        open={dialog?.type === "delete"}
        onClose={() => setDialog(null)}
      />
    </div>
  );
}
