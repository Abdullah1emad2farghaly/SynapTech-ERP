// Project path: src/components/cashier/invoices/InvoiceFilters.tsx
//
// Purely client-side — both endpoints return the full collection, so
// filtering happens on the already-fetched array (see useFilteredInvoices
// in InvoiceHistory.tsx). No backend query params are sent for this.
// Status options are derived from the distinct values actually present in
// the loaded invoices, never a hardcoded enum list.

import { useTranslation } from 'react-i18next';

export interface InvoiceFiltersValue {
  search: string;
  status: string | null;
  dateFrom: string;
  dateTo: string;
}

interface InvoiceFiltersProps {
  value: InvoiceFiltersValue;
  onChange: (value: InvoiceFiltersValue) => void;
  statusOptions: string[];
}

export const EMPTY_INVOICE_FILTERS: InvoiceFiltersValue = {
  search: '',
  status: null,
  dateFrom: '',
  dateTo: '',
};

export function InvoiceFilters({ value, onChange, statusOptions }: InvoiceFiltersProps) {
  const { t } = useTranslation('');

  const hasActiveFilters =
    value.search || value.status || value.dateFrom || value.dateTo;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <input
        type="text"
        value={value.search}
        onChange={(e) => onChange({ ...value, search: e.target.value })}
        placeholder={t('invoices.filters.searchPlaceholder')}
        className="min-w-[200px] flex-1 rounded-[6px] border border-[var(--hairline)] bg-[var(--panel)] px-3 py-1.5 text-sm text-[var(--ink-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--signal)]"
      />

      {statusOptions.length > 0 && (
        <select
          value={value.status ?? ''}
          onChange={(e) => onChange({ ...value, status: e.target.value || null })}
          className="rounded-[6px] border border-[var(--hairline)] bg-[var(--panel)] px-3 py-1.5 text-sm text-[var(--ink-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--signal)]"
        >
          <option value="">{t('invoices.filters.allStatuses')}</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      )}

      <input
        type="date"
        value={value.dateFrom}
        onChange={(e) => onChange({ ...value, dateFrom: e.target.value })}
        className="rounded-[6px] border border-[var(--hairline)] bg-[var(--panel)] px-3 py-1.5 text-sm text-[var(--ink-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--signal)]"
      />
      <input
        type="date"
        value={value.dateTo}
        min={value.dateFrom || undefined}
        onChange={(e) => onChange({ ...value, dateTo: e.target.value })}
        className="rounded-[6px] border border-[var(--hairline)] bg-[var(--panel)] px-3 py-1.5 text-sm text-[var(--ink-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--signal)]"
      />

      {hasActiveFilters && (
        <button
          type="button"
          onClick={() => onChange(EMPTY_INVOICE_FILTERS)}
          className="text-sm text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] underline underline-offset-2"
        >
          {t('invoices.filters.clear')}
        </button>
      )}
    </div>
  );
}
