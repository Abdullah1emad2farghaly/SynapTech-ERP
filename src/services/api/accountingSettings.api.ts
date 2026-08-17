// Intended path: src/services/api/accountingSettings.api.ts
// NEW FILE. Only GET is used by the Overview page; PUT exists on the
// confirmed contract too but there's no settings-editing UI being built
// here — that's a separate task from this statistics page.

import {apiClient} from './axiosClient';

export interface AccountingSettingsResponse {
  inventoryAccountId: string | null;
  accountsPayableAccountId: string | null;
  accountsReceivableAccountId: string | null;
  revenueAccountId: string | null;
  costOfGoodsSoldAccountId: string | null;
}

export const accountingSettingsApi = {
  get: () => apiClient.get<AccountingSettingsResponse>('/AccountingSettings').then(r => r.data),
};
