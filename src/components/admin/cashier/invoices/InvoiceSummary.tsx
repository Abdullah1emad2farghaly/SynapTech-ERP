// Project path: src/components/cashier/invoices/InvoiceSummary.tsx

import { useTranslation } from 'react-i18next';
import { formatCurrency } from '@/utils/formatters';
import type { CashierInvoiceResponse } from '@/types/cashier-invoice.types';

interface InvoiceSummaryProps {
  invoice: CashierInvoiceResponse;
}

export function InvoiceSummary({ invoice }: InvoiceSummaryProps) {
  const { t } = useTranslation('');

  const rows: Array<{ label: string; value: number; emphasize?: boolean }> = [
    { label: t('invoices.details.subTotal'), value: invoice.subTotal },
    { label: t('invoices.details.discount'), value: invoice.discountAmount },
    { label: t('invoices.details.tax'), value: invoice.taxAmount },
    { label: t('invoices.details.total'), value: invoice.totalAmount, emphasize: true },
    { label: t('invoices.details.amountPaid'), value: invoice.amountPaid },
    { label: t('invoices.details.changeDue'), value: invoice.changeDue },
  ];

  return (
    <div className="rounded-[10px] border border-[var(--hairline)] bg-[var(--sunken)] p-4">
      <dl className="flex flex-col gap-2">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between text-sm">
            <dt className={row.emphasize ? 'font-medium text-[var(--ink-primary)]' : 'text-[var(--ink-secondary)]'}>
              {row.label}
            </dt>
            <dd
              className={`tabular-nums ${
                row.emphasize
                  ? 'text-base font-semibold text-[var(--ink-primary)]'
                  : 'text-[var(--ink-primary)]'
              }`}
            >
              {formatCurrency(row.value)}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
