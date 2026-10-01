// Project path: src/hooks/useAccountingSettings.ts

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { accountingSettingsApi } from '../services/api/accountingSettings.api';
import type { UpdateAccountingSettingsRequest } from '../types/accounting-settings.types';

const ACCOUNTING_SETTINGS_KEY = ['accounting-settings'] as const;

export function useAccountingSettings() {
  return useQuery({
    queryKey: ACCOUNTING_SETTINGS_KEY,
    queryFn: accountingSettingsApi.get,
  });
}

export function useUpdateAccountingSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateAccountingSettingsRequest) =>
      accountingSettingsApi.update(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(ACCOUNTING_SETTINGS_KEY, data);
      toast.success('accountingSettings:toast.updated');
    },
    onError: () => {
      toast.error('accountingSettings:toast.updateFailed');
    },
  });
}
