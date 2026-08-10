// Intended path: src/services/api/company.api.ts
//
// ASSUMPTION: imports `apiClient` as a named export from `./client`, matching
// the shape referenced by every other module's *.api.ts file. Verify this
// against the real services/api/client.ts before wiring in.
//
// Only the two operations the backend actually exposes. Do NOT add
// getCompanies / createCompany / deleteCompany / getCompanyById — none exist.

import { apiClient } from './axiosClient';
import type { CompanyResponse, UpdateCompanyRequest } from '../../types/company.types';

export const companyApi = {
  getMyCompany: async (): Promise<CompanyResponse> => {
    const { data } = await apiClient.get<CompanyResponse>('/Companies/me');
    return data;
  },

  updateMyCompany: async (payload: UpdateCompanyRequest): Promise<CompanyResponse> => {
    const { data } = await apiClient.put<CompanyResponse>('/Companies/me', payload);
    return data;
  },
};
