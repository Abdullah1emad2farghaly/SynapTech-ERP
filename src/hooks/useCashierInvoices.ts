// Project path: src/hooks/useCashierInvoices.ts

import { useQuery } from '@tanstack/react-query';
import { cashierInvoicesApi } from '../services/api/cashierInvoices.api';

export const cashierInvoicesKeys = {
  myInvoices: () => ['cashier-invoices', 'my-invoices'] as const,
  byUser: (userId: string) => ['cashier-invoices', 'by-user', userId] as const,
  detail: (invoiceId: string) => ['cashier-invoices', 'detail', invoiceId] as const,
};

export function useMyInvoices() {
  return useQuery({
    queryKey: cashierInvoicesKeys.myInvoices(),
    queryFn: cashierInvoicesApi.getMyInvoices,
  });
}

export function useInvoicesByUser(userId: string | null) {
  return useQuery({
    queryKey: cashierInvoicesKeys.byUser(userId ?? ''),
    queryFn: () => cashierInvoicesApi.getInvoicesByUser(userId as string),
    enabled: Boolean(userId),
  });
}

// Loaded on demand (invoice details drawer), not prefetched per row —
// per the brief's performance requirement.
export function useCashierInvoiceDetails(invoiceId: string | null) {
  return useQuery({
    queryKey: cashierInvoicesKeys.detail(invoiceId ?? ''),
    queryFn: () => cashierInvoicesApi.getInvoiceById(invoiceId as string),
    enabled: Boolean(invoiceId),
  });
}
