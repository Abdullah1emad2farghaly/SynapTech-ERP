// Project path: src/types/journalEntries.types.ts

export type JournalEntryStatus = "Draft" | "Posted" | "Reversed";

/** ASSUMPTION: the brief references JournalEntryLineResponse without defining it.
 *  Assumed to mirror the create-line shape plus an id and the parent entry's
 *  reference — verify against the real backend before merging. */
export interface JournalEntryLineResponse {
  id: string;
  accountId: string;
  debit: number;
  credit: number;
  description?: string;
}

/** Matches confirmed GET /api/JournalEntries and GET /api/JournalEntries/{id} */
export interface JournalEntryResponse {
  id: string;
  entryNumber: string;
  entryDate: string;
  description: string;
  status: JournalEntryStatus | string;
  reversalOfEntryId?: string;
  lines: JournalEntryLineResponse[];
}

/** Body for POST /api/JournalEntries */
export interface CreateJournalEntryLinePayload {
  accountId: string;
  debit: number;
  credit: number;
  description?: string;
}

export interface CreateJournalEntryPayload {
  entryDate: string;
  description?: string;
  lines: CreateJournalEntryLinePayload[];
}

/** ASSUMPTION: no Accounts API was provided anywhere in this project's briefs.
 *  Assumed lookup shape — verify endpoint + fields before merging. */
export interface AccountLookupResponse {
  id: string;
  code: string;
  name: string;
}
