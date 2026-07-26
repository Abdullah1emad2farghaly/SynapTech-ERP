// Project path: src/hooks/useJournalEntryMutations.ts

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createJournalEntry,
  deleteJournalEntry,
  postJournalEntry,
  reverseJournalEntry,
} from "../services/api/journalEntries.api";
import { journalEntriesQueryKeys } from "./useJournalEntries";
import type { CreateJournalEntryPayload } from "../types/journalEntries.types";

export function useCreateJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateJournalEntryPayload) =>
      createJournalEntry(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: journalEntriesQueryKeys.all });
    },
  });
}

export function useDeleteJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteJournalEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: journalEntriesQueryKeys.all });
    },
  });
}

export function usePostJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => postJournalEntry(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: journalEntriesQueryKeys.all });
      queryClient.invalidateQueries({
        queryKey: journalEntriesQueryKeys.detail(id),
      });
    },
  });
}

export function useReverseJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reverseJournalEntry(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: journalEntriesQueryKeys.all });
      queryClient.invalidateQueries({
        queryKey: journalEntriesQueryKeys.detail(id),
      });
    },
  });
}
