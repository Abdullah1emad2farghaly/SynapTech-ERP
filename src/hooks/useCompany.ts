// Intended path: src/hooks/useCompany.ts

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { companyApi } from '../services/api/company.api';
import type { UpdateCompanyRequest } from '../types/company.types';

export const companyKeys = {
  all: ['company'] as const,
  me: () => [...companyKeys.all, 'me'] as const,
};

export function useCompany() {
  return useQuery({
    queryKey: companyKeys.me(),
    queryFn: companyApi.getMyCompany,
    staleTime: 60_000,
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateCompanyRequest) => companyApi.updateMyCompany(payload),
    onSuccess: (data) => {
      // The PUT response is the new source of truth — no refetch needed.
      queryClient.setQueryData(companyKeys.me(), data);
    },
  });
}
