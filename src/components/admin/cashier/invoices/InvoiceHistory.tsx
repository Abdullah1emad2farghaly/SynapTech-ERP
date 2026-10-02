// Project path: src/components/cashier/invoices/InvoiceHistory.tsx
//
// Single shared component that powers both "My Invoices" and "Invoices By
// User" — it only cares about the invoices array it's given, not where it
// came from. Desktop gets InvoiceTable, mobile gets a stacked InvoiceCard
// list (Tailwind `sm:` breakpoint — swap for the project's actual
// mobile/desktop convention if it uses a JS media-query hook instead).

import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';

import { InvoiceTable } from './InvoiceTable';
import { InvoiceCard } from './InvoiceCard';
import {
  InvoiceFilters,
  EMPTY_INVOICE_FILTERS,
  type InvoiceFiltersValue,
} from './InvoiceFilters';
import { InvoiceDetailsDrawer } from './InvoiceDetailsDrawer';
import { printInvoice } from './InvoicePrintView';
import type { CashierInvoiceResponse } from '@/types/cashier-invoice.types';

interface InvoiceHistoryProps {
  invoices: CashierInvoiceResponse[] | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  emptyLabel: string;
}

function matchesFilters(
  invoice: CashierInvoiceResponse,
  filters: InvoiceFiltersValue,
): boolean {
  if (filters.status && invoice.status !== filters.status) return false;

  if (filters.dateFrom && invoice.invoiceDate.slice(0, 10) < filters.dateFrom) {
    return false;
  }
  if (filters.dateTo && invoice.invoiceDate.slice(0, 10) > filters.dateTo) {
    return false;
  }

  if (filters.search) {
    const needle = filters.search.trim().toLowerCase();
    const haystack = [
      invoice.invoiceNumber,
      invoice.walkInCustomerName,
      invoice.walkInCustomerPhone,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    if (!haystack.includes(needle)) return false;
  }

  return true;
}

export function InvoiceHistory({
  invoices,
  isLoading,
  isError,
  onRetry,
  emptyLabel,
}: InvoiceHistoryProps) {
  const { t } = useTranslation('');
  const [filters, setFilters] = useState<InvoiceFiltersValue>(EMPTY_INVOICE_FILTERS);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

  const statusOptions = useMemo(() => {
    const values = new Set<string>();
    invoices?.forEach((inv) => {
      if (inv.status) values.add(inv.status);
    });
    return Array.from(values);
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    if (!invoices) return [];
    return invoices.filter((inv) => matchesFilters(inv, filters));
  }, [invoices, filters]);

  if (isError) {
    return <ErrorState onRetry={onRetry} title='' />;
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-14 animate-pulse rounded-[10px] bg-[var(--sunken)]" />
        ))}
      </div>
    );
  }

  if (!invoices || invoices.length === 0) {
    return <EmptyState title={emptyLabel} />;
  }

  return (
    <div className="flex flex-col gap-4">
      <InvoiceFilters value={filters} onChange={setFilters} statusOptions={statusOptions} />

      {filteredInvoices.length === 0 ? (
        <EmptyState title={t('invoices.noResultsForFilters')} />
      ) : (
        <>
          {/* Desktop */}
          <div className="hidden sm:block">
            <InvoiceTable
              invoices={filteredInvoices}
              onView={(inv) => setSelectedInvoiceId(inv.id)}
            />
          </div>

          {/* Mobile */}
          <div className="flex flex-col gap-3 sm:hidden">
            {filteredInvoices.map((inv) => (
              <InvoiceCard
                key={inv.id}
                invoice={inv}
                onView={(selected) => setSelectedInvoiceId(selected.id)}
                onPrint={(selected) => printInvoice(selected)}
              />
            ))}
          </div>
        </>
      )}

      <InvoiceDetailsDrawer
        invoiceId={selectedInvoiceId}
        onClose={() => setSelectedInvoiceId(null)}
      />
    </div>
  );
}
