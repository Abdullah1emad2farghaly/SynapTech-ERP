// Intended path: src/services/api/accounts.api.ts
// NEW FILE — same gap category as Customers/Products/Categories: Accounts
// has, at most, only ever existed as a lookup for the Journal Entries
// line-item account picker, never as a full Chart of Accounts management
// module. This wraps the full confirmed contract, including the two
// endpoints that make the Accounting Overview possible without any N+1
// fetching: /account-types and /trial-balance (both single GETs that
// return pre-aggregated data — a much better shape than Inventory's
// per-warehouse stock loop).

import {apiClient} from './axiosClient';

export interface AccountResponse {
  id: string;
  code: string | null;
  name: string | null;
  accountType: string | null;
  parentAccountId: string | null;
  isActive: boolean;
}

export interface AccountTypeResponse {
  value: string | null;
  normalBalance: string | null;
}

export interface AccountBalanceResponse {
  accountId: string;
  code: string | null;
  name: string | null;
  totalDebit: number;
  totalCredit: number;
  balance: number;
}

export interface TrialBalanceLineResponse {
  accountId: string;
  code: string | null;
  name: string | null;
  accountType: string | null;
  totalDebit: number;
  totalCredit: number;
  debitBalance: number;
  creditBalance: number;
}

export interface TrialBalanceResponse {
  lines: TrialBalanceLineResponse[] | null;
  totalDebitBalances: number;
  totalCreditBalances: number;
  isBalanced: boolean;
}

export interface CreateAccountRequest {
  code?: string | null;
  name?: string | null;
  accountType?: string | null;
  parentAccountId?: string | null;
}

export interface UpdateAccountRequest {
  code?: string | null;
  name?: string | null;
  isActive?: boolean;
}

export const accountsApi = {
  list: () => apiClient.get<AccountResponse[]>('/Accounts').then(r => r.data),

  getById: (id: string) => apiClient.get<AccountResponse>(`/Accounts/${id}`).then(r => r.data),

  create: (body: CreateAccountRequest) =>
    apiClient.post<AccountResponse>('/Accounts', body).then(r => r.data),

  update: (id: string, body: UpdateAccountRequest) =>
    apiClient.put<AccountResponse>(`/Accounts?id=${id}`, body).then(r => r.data),

  remove: (id: string) => apiClient.delete<void>(`/Accounts/${id}`).then(r => r.data),

  getBalance: (id: string) =>
    apiClient.get<AccountBalanceResponse>(`/Accounts/${id}/balance`).then(r => r.data),

  getAccountTypes: () =>
    apiClient.get<AccountTypeResponse[]>('/Accounts/account-types').then(r => r.data),

  getTrialBalance: () =>
    apiClient.get<TrialBalanceResponse>('/Accounts/trial-balance').then(r => r.data),
  
};
