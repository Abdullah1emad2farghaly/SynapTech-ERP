// src/hooks/useAccounts.crud.ts
//
// No naming-collision risk here (unlike Departments/Branches) since no
// earlier module built a lookup-only useAccounts() — this is the first
// and only Accounts hook file.
//
// useAccountBalance is deliberately its own hook, not bundled into
// useAccount, so callers (AccountPreviewPanel, AccountDetailsPage) can
// fetch balance only when they actually need it — the design doc's rule
// that balance is never fetched for every tree row, only on-demand for
// one selected/viewed account at a time.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAllAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  deleteAccount,
  getAccountBalance,
  type CreateAccountPayload,
  type UpdateAccountPayload,
  getAccountTypes,
  AccountTypes,
} from "../services/api/accounts.crud.api";

export const accountsQueryKeys = {
  all: ["accounts-crud"] as const,
  detail: (id: string) => ["accounts-crud", "detail", id] as const,
  balance: (id: string) => ["accounts-crud", "balance", id] as const,
  types: () => [...accountsQueryKeys.all, "types"] as const,
};

export function useAccountsList() {
  return useQuery({
    queryKey: accountsQueryKeys.all,
    queryFn: getAllAccounts,
  });
}

export function useAccountTypes() {
  return useQuery<AccountTypes[]>({
    queryKey: accountsQueryKeys.types(),
    queryFn: getAccountTypes,
  });
}

export function useAccount(id: string | undefined) {
  return useQuery({
    queryKey: accountsQueryKeys.detail(id ?? ""),
    queryFn: () => getAccountById(id!),
    enabled: !!id,
  });
}

// enabled defaults to true so AccountDetailsPage (which always wants
// balance once it has an id) doesn't need to pass anything extra; the
// Preview Panel passes enabled explicitly tied to "is this account
// currently selected."
export function useAccountBalance(id: string | undefined, enabled: boolean = true) {
  return useQuery({
    queryKey: accountsQueryKeys.balance(id ?? ""),
    queryFn: () => getAccountBalance(id!),
    enabled: enabled && !!id,
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAccountPayload) => createAccount(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountsQueryKeys.all });
    }
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateAccountPayload) => updateAccount(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: accountsQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: accountsQueryKeys.detail(variables.id) });
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountsQueryKeys.all });
    },
  });
}

