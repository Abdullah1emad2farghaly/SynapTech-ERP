// Project path: src/hooks/useJournalEntries.ts

import { useQuery } from "@tanstack/react-query";
import {
  getJournalEntries,
  getJournalEntryById,
} from "../services/api/journalEntries.api";
import { getAccountsLookup } from "../services/api/accounts.lookup.api";

export const journalEntriesQueryKeys = {
  all: ["journalEntries"] as const,
  detail: (id: string) => ["journalEntries", id] as const,
  accountsLookup: ["accounts", "lookup"] as const,
};

/** Fetches the full list with embedded lines — needed for KPI sums and
 *  client-side filtering, since GET /api/JournalEntries has no confirmed
 *  query-param contract. Flagged as a scalability concern for large ledgers,
 *  same category as the Departments/Branches full-list precedent. */
export function useJournalEntries() {
  return useQuery({
    queryKey: journalEntriesQueryKeys.all,
    queryFn: getJournalEntries,
  });
}

export function useJournalEntry(id: string | undefined) {
  return useQuery({
    queryKey: journalEntriesQueryKeys.detail(id ?? ""),
    queryFn: () => getJournalEntryById(id as string),
    enabled: Boolean(id),
  });
}

export function useAccountsLookup() {
  return useQuery({
    queryKey: journalEntriesQueryKeys.accountsLookup,
    queryFn: getAccountsLookup,
    staleTime: 5 * 60 * 1000,
  });
}
