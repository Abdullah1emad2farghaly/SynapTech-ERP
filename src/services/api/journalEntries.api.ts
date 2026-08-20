// Project path: src/services/api/journalEntries.api.ts
//
// ASSUMPTION: imports apiClient from "./client" — existence/shape unconfirmed,
// same standing caveat as every other module's service file.

import { apiClient } from "./axiosClient";
import type {
  JournalEntryResponse,
  CreateJournalEntryPayload,
} from "../../types/journalEntries.types";

export async function getJournalEntries(): Promise<JournalEntryResponse[]> {
  const { data } = await apiClient.get<JournalEntryResponse[]>(
    "/JournalEntries"
  );
  return data;
}

export async function getJournalEntryById(
  id: string
): Promise<JournalEntryResponse> {
  const { data } = await apiClient.get<JournalEntryResponse>(
    `/JournalEntries/${id}`
  );
  return data;
}

export async function createJournalEntry(
  payload: CreateJournalEntryPayload
): Promise<JournalEntryResponse> {
  const { data } = await apiClient.post<JournalEntryResponse>(
    "/JournalEntries",
    payload
  );
  return data;
}

export async function deleteJournalEntry(id: string): Promise<void> {
  await apiClient.delete(`/JournalEntries/${id}`);
}

export async function postJournalEntry(
  id: string
): Promise<JournalEntryResponse> {
  const { data } = await apiClient.post<JournalEntryResponse>(
    `/JournalEntries/${id}/post`
  );
  return data;
}

export async function reverseJournalEntry(
  id: string
): Promise<JournalEntryResponse> {
  const { data } = await apiClient.post<JournalEntryResponse>(
    `/JournalEntries/${id}/reverse`
  );
  return data;
}
