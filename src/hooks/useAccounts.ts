// Intended path: src/hooks/useAccounts.ts
// Two small hooks: useAccounts (structural — every account, active or not,
// used for counts/Accounts-by-Type) and useTrialBalance (financial —
// pre-aggregated debit/credit balances per account, a single GET, no
// looping required).

import { useQuery } from '@tanstack/react-query';
import { accountsApi } from '../services/api/accounts.api';

export const ACCOUNTS_QUERY_KEY = ['accounts'] as const;
export const TRIAL_BALANCE_QUERY_KEY = ['accounts', 'trial-balance'] as const;

export function useAccounts() {
  return useQuery({
    queryKey: ACCOUNTS_QUERY_KEY,
    queryFn: accountsApi.list,
  });
}

export function useTrialBalance() {
  return useQuery({
    queryKey: TRIAL_BALANCE_QUERY_KEY,
    queryFn: accountsApi.getTrialBalance,
  });
}
