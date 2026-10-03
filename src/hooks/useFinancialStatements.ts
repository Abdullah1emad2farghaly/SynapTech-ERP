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

import { useEffect } from 'react';
import axios from 'axios';
import { handleErrors } from '@/utils/HandleErrors'; // عدّل المسار حسب مكان الدالة عندك

// سيب الـ imports الموجودة عندك لـ financialStatementsKeys و financialStatementsApi زي ما هي

export function useCashFlow(periodStart: string, periodEnd: string) {
  const query = useQuery({
    queryKey: financialStatementsKeys.cashFlow(periodStart, periodEnd),
    queryFn: () => financialStatementsApi.getCashFlow(periodStart, periodEnd),
    enabled: Boolean(periodStart) && Boolean(periodEnd),
    // مفيش فايدة من إعادة المحاولة مع أخطاء 4xx
    retry: (failureCount, error) => {
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;
      if (status && status >= 400 && status < 500) return false;
      return failureCount < 2;
    },
  });

  useEffect(() => {
    const error = query.error;
    if (!error) return;

    if (axios.isAxiosError(error)) {
      // الـ interceptor بيعرض toast للـ 403 بالفعل، فنتجنب التكرار
      if (error.response?.status === 403) return;

      const errors = error.response?.data?.errors;
      if (Array.isArray(errors) && errors.length > 0) {
        handleErrors(errors); // ["Account.CashAccountNotConfigured", "Cash account is not configured..."]
        return;
      }

      handleErrors([error.response?.data?.title ?? error.message]);
      return;
    }

    handleErrors([error instanceof Error ? error.message : 'Something went wrong']);
  }, [query.error]);

  return query;
}
