// Intended path: src/services/api/customers.api.ts
// NEW FILE — no full-CRUD Customers API wrapper existed before this; only a
// lightweight customers.lookup.api.ts (id/name pairs) was built for the
// Sales Order line-item customer picker. This file wraps the full
// CustomerResponse contract confirmed in the OpenAPI spec, needed for the
// Sales Overview's Customers KPI/snapshot cards (isActive is not present on
// the lookup-only shape).
// ASSUMPTION: imports apiClient from './client' — unverified in this
// project's context, per the standing flag already on every other service
// file in this codebase.

import {apiClient} from './axiosClient';

export interface CustomerResponse {
  id: string;
  name: string | null;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  taxNumber: string | null;
  isActive: boolean;
}

export interface CreateCustomerRequest {
  name?: string | null;
  contactName?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  taxNumber?: string | null;
}

export type UpdateCustomerRequest = CreateCustomerRequest & { isActive?: boolean };

export const customersApi = {
  list: () => apiClient.get<CustomerResponse[]>('/Customers').then(r => r.data),
  getById: (id: string) => apiClient.get<CustomerResponse>(`/Customers/${id}`).then(r => r.data),
  create: (body: CreateCustomerRequest) =>
    apiClient.post<CustomerResponse>('/Customers', body).then(r => r.data),
  update: (id: string, body: UpdateCustomerRequest) =>
    apiClient.put<CustomerResponse>(`/Customers/${id}`, body).then(r => r.data),
  remove: (id: string) => apiClient.delete<void>(`/Customers/${id}`).then(r => r.data),
};
