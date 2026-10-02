// Project path: src/components/cashier/invoices/InvoiceCard.tsx

import { useTranslation } from 'react-i18next';
import { InvoiceStatusBadge } from './InvoiceStatusBadge';
import { formatCurrency, formatDate } from '@/utils/formatters';
import type { CashierInvoiceResponse } from '@/types/cashier-invoice.types';

interface InvoiceCardProps {
  invoice: CashierInvoiceResponse;
  onView: (invoice: CashierInvoiceResponse) => void;
  onPrint: (invoice: CashierInvoiceResponse) => void;
}

export function InvoiceCard({ invoice, onView, onPrint }: InvoiceCardProps) {
  const { t } = useTranslation('');

  const customerLabel =
    invoice.walkInCustomerName ??
    (invoice.customerId ? t('invoices.registeredCustomer') : t('invoices.walkInCustomer'));

  return (
    <button
      type="button"
      onClick={() => onView(invoice)}
      className="w-full rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] p-4 text-start active:bg-[var(--sunken)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--ink-primary)]">
            {invoice.invoiceNumber ?? t('invoices.unnumbered')}
          </p>
          <p className="mt-0.5 text-xs text-[var(--ink-tertiary)]">
            {formatDate(invoice.invoiceDate)}
          </p>
        </div>
        <InvoiceStatusBadge status={invoice.status} />
      </div>

      <p className="mt-2 text-sm text-[var(--ink-secondary)]">{customerLabel}</p>
      {invoice.walkInCustomerPhone && (
        <p className="text-xs text-[var(--ink-tertiary)]" dir="ltr">
          {invoice.walkInCustomerPhone}
        </p>
      )}

      <div className="mt-3 flex items-end justify-between border-t border-[var(--hairline)] pt-3">
        <div>
          <p className="text-xs text-[var(--ink-tertiary)]">{t('invoices.columns.total')}</p>
          <p className="text-base font-semibold tabular-nums text-[var(--ink-primary)]">
            {formatCurrency(invoice.totalAmount)}
          </p>
        </div>
        <div className="text-end">
          <p className="text-xs text-[var(--ink-tertiary)]">
            {t('invoices.columns.amountPaid')}
          </p>
          <p className="text-sm tabular-nums text-[var(--ink-secondary)]">
            {formatCurrency(invoice.amountPaid)}
          </p>
        </div>
      </div>

      <div className="mt-3 flex justify-end">
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            onPrint(invoice);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.stopPropagation();
              onPrint(invoice);
            }
          }}
          className="rounded-[6px] px-3 py-1.5 text-xs font-medium text-[var(--ink-secondary)] hover:bg-[var(--sunken)]"
        >
          {t('invoices.actions.print')}
        </span>
      </div>
    </button>
  );
}
