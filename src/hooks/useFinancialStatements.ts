// Project path: src/hooks/useFinancialStatements.ts

import { useQuery } from '@tanstack/react-query';
import { financialStatementsApi } from '../services/api/financialStatements.api';

export const financialStatementsKeys = {
  balanceSheet: (asOfDate: string) => ['balance-sheet', asOfDate] as const,
  incomeStatement: (start: string, end: string) =>
    ['income-statement', start, end] as const,
  cashFlow: (start: string, end: string) => ['cash-flow', start, end] as const,
};

export function useBalanceSheet(asOfDate: string) {
  return useQuery({
    queryKey: financialStatementsKeys.balanceSheet(asOfDate),
    queryFn: () => financialStatementsApi.getBalanceSheet(asOfDate),
    enabled: Boolean(asOfDate),
  });
}

export function useIncomeStatement(periodStart: string, periodEnd: string) {
  return useQuery({
    queryKey: financialStatementsKeys.incomeStatement(periodStart, periodEnd),
    queryFn: () => financialStatementsApi.getIncomeStatement(periodStart, periodEnd),
    enabled: Boolean(periodStart) && Boolean(periodEnd),
  });
}

export function useCashFlow(periodStart: string, periodEnd: string) {
  return useQuery({
    queryKey: financialStatementsKeys.cashFlow(periodStart, periodEnd),
    queryFn: () => financialStatementsApi.getCashFlow(periodStart, periodEnd),
    enabled: Boolean(periodStart) && Boolean(periodEnd),
  });
}
