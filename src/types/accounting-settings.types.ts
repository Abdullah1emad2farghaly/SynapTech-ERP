// Project path: src/types/accounting-settings.types.ts

export interface AccountingSettingsResponse {
  inventoryAccountId: string | null;
  accountsPayableAccountId: string | null;
  accountsReceivableAccountId: string | null;
  revenueAccountId: string | null;
  costOfGoodsSoldAccountId: string | null;
  cashAccountId: string | null;
}

// ASSUMPTION: the request shape mirrors the response 1:1 (singleton config,
// PUT with the same six nullable account-id fields). Not separately
// confirmed in the contract you provided — verify before wiring the mutation
// if a distinct UpdateAccountingSettingsRequest exists.
export type UpdateAccountingSettingsRequest = AccountingSettingsResponse;

export const ACCOUNTING_SETTINGS_FIELDS = [
  'inventoryAccountId',
  'accountsPayableAccountId',
  'accountsReceivableAccountId',
  'revenueAccountId',
  'costOfGoodsSoldAccountId',
  'cashAccountId',
] as const;

export type AccountingSettingsField = (typeof ACCOUNTING_SETTINGS_FIELDS)[number];
