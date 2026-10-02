// Project path: src/components/cashier/invoices/InvoiceLinesTable.tsx

import { useTranslation } from 'react-i18next';
import { formatCurrency } from '@/utils/formatters';
import type { CashierInvoiceLineResponse } from '@/types/cashier-invoice.types';

interface InvoiceLinesTableProps {
  lines: CashierInvoiceLineResponse[] | null;
}

export function InvoiceLinesTable({ lines }: InvoiceLinesTableProps) {
  const { t } = useTranslation('');

  if (!lines || lines.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-[var(--ink-tertiary)]">
        {t('invoices.details.noLines')}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--hairline)] text-start text-xs text-[var(--ink-tertiary)]">
            <th className="px-3 py-2 text-start">{t('invoices.details.product')}</th>
            <th className="px-3 py-2 text-start">{t('invoices.details.sku')}</th>
            <th className="px-3 py-2 text-end">{t('invoices.details.quantity')}</th>
            <th className="px-3 py-2 text-end">{t('invoices.details.unitPrice')}</th>
            <th className="px-3 py-2 text-end">{t('invoices.details.discount')}</th>
            <th className="px-3 py-2 text-end">{t('invoices.details.lineTotal')}</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line, index) => (
            <tr
              key={`${line.productId}-${index}`}
              className="border-b border-[var(--hairline)] last:border-b-0"
            >
              <td className="px-3 py-2 text-[var(--ink-primary)]">
                {line.productName ?? '—'}
              </td>
              <td className="px-3 py-2 text-[var(--ink-tertiary)]">{line.sku ?? '—'}</td>
              <td className="px-3 py-2 text-end tabular-nums">{line.quantity}</td>
              <td className="px-3 py-2 text-end tabular-nums">
                {formatCurrency(line.unitPrice)}
              </td>
              <td className="px-3 py-2 text-end tabular-nums">
                {formatCurrency(line.discountAmount)}
              </td>
              <td className="px-3 py-2 text-end font-medium tabular-nums">
                {formatCurrency(line.lineTotal)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
