// src/services/api/accounts.crud.api.ts
//
// Scoped strictly to the confirmed backend surface:
//   GET    /api/Accounts
//   GET    /api/Accounts/{id}
//   POST   /api/Accounts               { code, name, accountType, parentAccountId? }
//   PUT    /api/Accounts?id={id}       { code, name, isActive }   <- query param, not path param
//   DELETE /api/Accounts/{id}
//   GET    /api/Accounts/{id}/balance
//
// Update's payload is deliberately narrower than Create's in this
// interface — it's not a mistake, it matches the confirmed API exactly:
// accountType and parentAccountId cannot be changed after creation.

import { apiClient } from "./axiosClient";

export interface Account {
  id: string;
  code: string;
  name: string;
  accountType: string;
  parentAccountId: string | null;
  isActive: boolean;
}

export interface AccountBalance {
  accountId: string;
  code: string;
  name: string;
  totalDebit: number;
  totalCredit: number;
  balance: number;
}

export interface CreateAccountPayload {
  code: string;
  name: string;
  accountType: string;
  parentAccountId?: string | null;
}

// Intentionally does NOT include accountType or parentAccountId — the
// confirmed PUT payload only accepts these three fields.
export interface UpdateAccountPayload {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
}

export interface AccountTypes {
  value: string;
  normalBalance: string
}

export async function getAllAccounts(): Promise<Account[]> {
  const { data } = await apiClient.get<Account[]>("/Accounts");
  return data;
}

export async function getAccountTypes(): Promise<AccountTypes[]> {
  const { data } = await apiClient.get<AccountTypes[]>(`/Accounts/account-types`);
  return data;
}

export async function getAccountById(id: string): Promise<Account> {
  const { data } = await apiClient.get<Account>(`/Accounts/${id}`);
  return data;
}

export async function createAccount(payload: CreateAccountPayload) {  
  const { data } = await apiClient.post<Account>("/Accounts", payload);
  return data;
}

// NOTE: id goes in the query string here, not the path — this matches
// the confirmed spec (PUT /api/Accounts?id={id}) exactly. Worth
// double-checking with the backend that this isn't a documentation typo,
// since every other module's update endpoint uses a path param instead.
export async function updateAccount(payload: UpdateAccountPayload): Promise<Account> {
  const { id, ...body } = payload;
  const { data } = await apiClient.put<Account>("/Accounts", body, {
    params: { id },
  });
  return data;
}

export async function deleteAccount(id: string): Promise<void> {
  await apiClient.delete(`/Accounts/${id}`);
}

export async function getAccountBalance(id: string): Promise<AccountBalance> {
  const { data } = await apiClient.get<AccountBalance>(`/Accounts/${id}/balance`);
  return data;
}
