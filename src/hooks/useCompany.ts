// src/hooks/useCompany.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { getCompany, updateCompany } from '../services/api/company.api';
import type { UpdateCompanyPayload } from '../types/company.types';

export const COMPANY_QUERY_KEY = ['company', 'me'] as const;

export function useCompany() {
  return useQuery({
    queryKey: COMPANY_QUERY_KEY,
    queryFn: getCompany,
    staleTime: 60_000,
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (payload: UpdateCompanyPayload) => updateCompany(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(COMPANY_QUERY_KEY, data);
      toast.success(t('company.toast.updateSuccess'));
    },
    onError: () => {
      toast.error(t('company.toast.updateError'));
    },
  });
}
