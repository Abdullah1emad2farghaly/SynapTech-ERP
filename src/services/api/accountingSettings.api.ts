// Project path: src/services/api/accountingSettings.api.ts

import { apiClient } from './axiosClient';
import type {
  AccountingSettingsResponse,
  UpdateAccountingSettingsRequest,
} from '../../types/accounting-settings.types';

export const accountingSettingsApi = {
  get: async (): Promise<AccountingSettingsResponse> => {
    const { data } = await apiClient.get<AccountingSettingsResponse>(
      '/AccountingSettings',
    );
    return data;
  },

  update: async (
    payload: UpdateAccountingSettingsRequest,
  ): Promise<AccountingSettingsResponse> => {
    const { data } = await apiClient.put<AccountingSettingsResponse>(
      '/AccountingSettings',
      payload,
    );
    return data;
  },
};
