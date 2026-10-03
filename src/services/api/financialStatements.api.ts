// Project path: src/services/api/financialStatements.api.ts
//
// ASSUMPTION (flag before merging): endpoint paths below follow the same
// convention as the already-confirmed GET /api/Accounts/trial-balance
// (i.e. nested under /api/Accounts/, query-string params for the date
// range). The exact paths for Balance Sheet / Income Statement / Cash Flow
// were not part of the interfaces you supplied — verify against the real
// OpenAPI spec and adjust the three URL strings below if they differ.
// Nothing about the response shapes is guessed — those come straight from
// your contract.

import { apiClient } from './axiosClient';
import type {
  BalanceSheetResponse,
  IncomeStatementResponse,
  CashFlowSummaryResponse,
} from '../../types/financial-statements.types';

export const financialStatementsApi = {
  getBalanceSheet: async (asOfDate: string): Promise<BalanceSheetResponse> => {
    const { data } = await apiClient.get<BalanceSheetResponse>(
      '/Accounts/balance-sheet',
      { params: { asOfDate } },
    );
    return data;
  },

  getIncomeStatement: async (
    periodStart: string,
    periodEnd: string,
  ): Promise<IncomeStatementResponse> => {
    const { data } = await apiClient.get<IncomeStatementResponse>(
      '/Accounts/income-statement',
      { params: { periodStart, periodEnd } },
    );
    return data;
  },

  getCashFlow: async (
    periodStart: string,
    periodEnd: string,
  ): Promise<CashFlowSummaryResponse> => {
    const { data } = await apiClient.get<CashFlowSummaryResponse>(
      '/Accounts/cash-flow-summary',
      { params: { periodStart, periodEnd } },
    );
    return data;
  },
};
