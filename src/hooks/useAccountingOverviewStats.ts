// Intended path: src/hooks/useAccountingOverviewStats.ts
// Unlike Inventory, this domain has a genuinely well-shaped backend: the
// trial-balance endpoint returns pre-aggregated debit/credit balances per
// account in a single GET. No looping, no N+1 — the richest data this
// series of Overview pages has had to work with so far.
// ASSUMPTION: imports useJournalEntries from './useJournalEntries' — Module
// 5's actual hook name/path is unverified, check before merging.
// ASSUMPTION: JournalEntryResponse.status values are assumed to be
// "Draft" / "Posted" / "Reversed" (inferred from the /post and /reverse
// action endpoints existing) — not directly confirmed against the backend
// enum. Verify exact casing before merging.

import { useMemo } from 'react';
import { useAccounts, useTrialBalance } from './useAccounts';
import { useJournalEntries } from './useJournalEntries';
import type { JournalEntryResponse } from '@/types/journalEntries.types';
import type { TrialBalanceLineResponse } from '../services/api/accounts.api';

export interface AccountTypeCount {
  accountType: string;
  count: number;
}

export interface AccountTypeBalance {
  accountType: string;
  netBalance: number;
}

export interface TopAccountBalance {
  accountId: string;
  code: string;
  name: string;
  balance: number;
}

export interface StatusCount {
  status: string;
  count: number;
}

export interface MonthlyEntryCount {
  monthKey: string; // YYYY-MM, sortable as a string
  monthLabel: string; // localized short label for the chart axis
  count: number;
}

export interface AccountingOverviewStats {
  totalAccounts: number;
  activeAccounts: number;
  totalJournalEntries: number;
  postedJournalEntries: number;
  totalDebitBalances: number;
  totalCreditBalances: number;
  isBalanced: boolean;
  accountsByType: AccountTypeCount[];
  balanceByType: AccountTypeBalance[];
  topAccountsByBalance: TopAccountBalance[];
  journalEntriesByStatus: StatusCount[];
  entriesOverTime: MonthlyEntryCount[];
  recentEntries: JournalEntryResponse[];
  latestEntry: JournalEntryResponse | null;
}

export function useAccountingOverviewStats() {
  const accountsQuery = useAccounts();
  const trialBalanceQuery = useTrialBalance();
  const entriesQuery = useJournalEntries();

  const stats = useMemo<AccountingOverviewStats | null>(() => {
    if (!accountsQuery.data || !entriesQuery.data) return null;
    const accounts = accountsQuery.data;
    const entries = entriesQuery.data;
    // Trial balance is allowed to lag behind the other two without
    // blocking the page — the cards that depend on it render their own
    // independent loading state.
    const trialBalance = trialBalanceQuery.data;
    const tbLines: TrialBalanceLineResponse[] = trialBalance?.lines ?? [];

    const totalAccounts = accounts.length;
    const activeAccounts = accounts.filter(a => a.isActive).length;
    const totalJournalEntries = entries.length;
    const postedJournalEntries = entries.filter(e => e.status === 'Posted').length;

    // --- structural: accounts by type (from the Accounts list, not trial balance) ---
    const typeCountMap = new Map<string, number>();
    for (const a of accounts) {
      const key = a.accountType ?? 'Unknown';
      typeCountMap.set(key, (typeCountMap.get(key) ?? 0) + 1);
    }
    const accountsByType: AccountTypeCount[] = Array.from(typeCountMap.entries()).map(
      ([accountType, count]) => ({ accountType, count }),
    );

    // --- financial: net balance by type (from trial balance) ---
    const typeBalanceMap = new Map<string, number>();
    for (const line of tbLines) {
      const key = line.accountType ?? 'Unknown';
      const net = (line.debitBalance ?? 0) - (line.creditBalance ?? 0);
      typeBalanceMap.set(key, (typeBalanceMap.get(key) ?? 0) + net);
    }
    const balanceByType: AccountTypeBalance[] = Array.from(typeBalanceMap.entries()).map(
      ([accountType, netBalance]) => ({ accountType, netBalance }),
    );

    // --- top accounts by |balance| ---
    const topAccountsByBalance: TopAccountBalance[] = [...tbLines]
      .map(line => ({
        accountId: line.accountId,
        code: line.code ?? '—',
        name: line.name ?? '—',
        balance: (line.debitBalance ?? 0) - (line.creditBalance ?? 0),
      }))
      .sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance))
      .slice(0, 8);

    // --- journal entries by status ---
    const statusMap = new Map<string, number>();
    for (const e of entries) {
      const key = e.status ?? 'Unknown';
      statusMap.set(key, (statusMap.get(key) ?? 0) + 1);
    }
    const journalEntriesByStatus: StatusCount[] = Array.from(statusMap.entries()).map(
      ([status, count]) => ({ status, count }),
    );

    // --- entries over time (real trend, not invented: a straightforward
    // month-bucket count of entries that were actually fetched, using the
    // real entryDate field. No deltas/percentages are derived from it —
    // just "how many entries were created each month," which is the one
    // trend line this dataset genuinely supports). ---
    const monthMap = new Map<string, number>();
    for (const e of entries) {
      const d = new Date(e.entryDate);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthMap.set(monthKey, (monthMap.get(monthKey) ?? 0) + 1);
    }
    const entriesOverTime: MonthlyEntryCount[] = Array.from(monthMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([monthKey, count]) => {
        const [year, month] = monthKey.split('-').map(Number);
        const label = new Date(year, month - 1, 1).toLocaleDateString(undefined, {
          month: 'short',
          year: '2-digit',
        });
        return { monthKey, monthLabel: label, count };
      });

    // --- recency ---
    const sortedByDate = [...entries].sort(
      (a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime(),
    );
    const recentEntries = sortedByDate.slice(0, 8);
    const latestEntry = sortedByDate[0] ?? null;

    return {
      totalAccounts,
      activeAccounts,
      totalJournalEntries,
      postedJournalEntries,
      totalDebitBalances: trialBalance?.totalDebitBalances ?? 0,
      totalCreditBalances: trialBalance?.totalCreditBalances ?? 0,
      isBalanced: trialBalance?.isBalanced ?? true,
      accountsByType,
      balanceByType,
      topAccountsByBalance,
      journalEntriesByStatus,
      entriesOverTime,
      recentEntries,
      latestEntry,
    };
  }, [accountsQuery.data, entriesQuery.data, trialBalanceQuery.data]);

  return {
    stats,
    isLoading: accountsQuery.isLoading || entriesQuery.isLoading,
    isTrialBalanceLoading: trialBalanceQuery.isLoading,
    isError: accountsQuery.isError || entriesQuery.isError,
    isTrialBalanceError: trialBalanceQuery.isError,
    refetch: () => {
      accountsQuery.refetch();
      entriesQuery.refetch();
      trialBalanceQuery.refetch();
    },
  };
}
