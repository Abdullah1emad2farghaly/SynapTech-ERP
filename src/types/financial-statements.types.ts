// Project path: src/types/financial-statements.types.ts
//
// Types mirror the confirmed API contract 1:1. Do NOT add fields here that
// aren't in the contract (currency, tax, comparisons to prior period, etc.)
// unless the backend actually returns them.

// ---------------------------------------------------------------------------
// Shared line shape used by both Balance Sheet and Income Statement
// ---------------------------------------------------------------------------
export interface FinancialStatementLineResponse {
  accountId: string;
  code: string | null;
  name: string | null;
  balance: number;
}

// ---------------------------------------------------------------------------
// Balance Sheet
// ---------------------------------------------------------------------------
export interface BalanceSheetResponse {
  asOfDate: string;
  assets: FinancialStatementLineResponse[] | null;
  totalAssets: number;
  liabilities: FinancialStatementLineResponse[] | null;
  totalLiabilities: number;
  equity: FinancialStatementLineResponse[] | null;
  currentEarnings: number;
  totalEquity: number;
  isBalanced: boolean;
}

// ---------------------------------------------------------------------------
// Income Statement
// ---------------------------------------------------------------------------
export interface IncomeStatementResponse {
  periodStart: string;
  periodEnd: string;
  revenues: FinancialStatementLineResponse[] | null;
  totalRevenue: number;
  expenses: FinancialStatementLineResponse[] | null;
  totalExpenses: number;
  netIncome: number;
}

// ---------------------------------------------------------------------------
// Cash Flow
// ---------------------------------------------------------------------------
export interface CashFlowLineResponse {
  date: string;
  description: string | null;
  debit: number;
  credit: number;
  runningBalance: number;
}

export interface CashFlowSummaryResponse {
  periodStart: string;
  periodEnd: string;
  openingCashBalance: number;
  closingCashBalance: number;
  netChange: number;
  movements: CashFlowLineResponse[] | null;
}
