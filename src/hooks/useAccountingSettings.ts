// Intended path: src/hooks/useAccountingSettings.ts

import { useQuery } from '@tanstack/react-query';
import { accountingSettingsApi } from '../services/api/accountingSettings.api';

export const ACCOUNTING_SETTINGS_QUERY_KEY = ['accountingSettings'] as const;

export function useAccountingSettings() {
  return useQuery({
    queryKey: ACCOUNTING_SETTINGS_QUERY_KEY,
    queryFn: accountingSettingsApi.get,
  });
}
