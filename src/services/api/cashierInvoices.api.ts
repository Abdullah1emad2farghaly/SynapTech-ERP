// Project path: src/services/api/cashierInvoices.api.ts
//
// ASSUMPTION: import path for the shared axios instance follows the same
// convention used across the rest of the project's api/ files
// (`./axiosClient`, exporting `apiClient`). If the cashier module's
// existing services import it from a different path, update the import
// below to match — do not create a second client.
//
// getInvoiceById wraps the EXISTING GET /api/cashier/invoices/{id} endpoint
// (per the brief, reuse — not reimplement). If a cashierInvoices.api.ts (or
// similarly named service) already exports this call, delete the
// getInvoiceById function here and import the existing one instead in
// useCashierInvoices.ts, so there's only one implementation.

import { apiClient } from './axiosClient';
import type { CashierInvoiceResponse } from '../../types/cashier-invoice.types';

export const cashierInvoicesApi = {
  getMyInvoices: async (): Promise<CashierInvoiceResponse[]> => {
    const { data } = await apiClient.get<CashierInvoiceResponse[]>(
      '/cashier/invoices/my-invoices',
    );
    return data;
  },

  getInvoicesByUser: async (userId: string): Promise<CashierInvoiceResponse[]> => {
    const { data } = await apiClient.get<CashierInvoiceResponse[]>(
      `/cashier/invoices/by-user/${userId}`,
    );
    return data;
  },

  // Existing endpoint — included here only so this file is self-contained.
  // Remove if already implemented elsewhere and import that instead.
  getInvoiceById: async (invoiceId: string): Promise<CashierInvoiceResponse> => {
    const { data } = await apiClient.get<CashierInvoiceResponse>(
      `/cashier/invoices/${invoiceId}`,
    );
    return data;
  },
};
