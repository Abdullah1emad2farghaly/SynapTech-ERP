// Project path: src/services/api/accounts.lookup.api.ts
//
// UNCONFIRMED: no Accounts API was provided in any brief so far. This endpoint,
// path, and response shape are assumed so the Account Selector has something to
// query — verify against the real backend before merging. If the real endpoint
// differs, only this file and AccountLookupResponse (journalEntries.types.ts)
// need to change; nothing else in the module depends on the exact shape.

import { apiClient } from "./axiosClient";
import type { AccountLookupResponse } from "../../types/journalEntries.types";

export async function getAccountsLookup(): Promise<AccountLookupResponse[]> {
  const { data } = await apiClient.get<AccountLookupResponse[]>(
    "/Accounts"
  );
  return data;
}
