// Intended path: src/services/api/companies.api.ts
// NEW FILE. IMPORTANT: unlike every other "Overview" domain built so far,
// Companies is NOT a list resource — the confirmed contract is exactly
// GET/PUT /api/Companies/me and nothing else (no POST, no DELETE, no list
// endpoint). It's the single tenant-scoped settings record for the logged-
// in user's company, closer in shape to AccountingSettings than to
// Suppliers/Customers. This file deliberately has no `list()` — there is
// nothing to list.

import {apiClient} from './axiosClient';

export interface CompanyResponse {
  id: string;
  name: string | null;
  legalName: string | null;
  taxNumber: string | null;
  currency: string | null;
  country: string | null;
  isActive: boolean;
}

export interface UpdateCompanyRequest {
  name?: string | null;
  legalName?: string | null;
  taxNumber?: string | null;
  currency?: string | null;
  country?: string | null;
  isActive?: boolean;
}

export const companiesApi = {
  getMe: () => apiClient.get<CompanyResponse>('/api/Companies/me').then(r => r.data),
  updateMe: (body: UpdateCompanyRequest) =>
    apiClient.put<CompanyResponse>('/api/Companies/me', body).then(r => r.data),
};
