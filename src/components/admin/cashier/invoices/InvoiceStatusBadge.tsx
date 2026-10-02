// Project path: src/components/cashier/invoices/InvoiceStatusBadge.tsx
//
// `status` is an untyped `string | null` in the contract — no confirmed
// enum values were given, so this intentionally does NOT color-code by
// status text (that would mean guessing which strings mean "paid" vs
// "void" vs "pending"). It renders whatever the backend sends, in a
// single consistent neutral badge style. If the project already has a
// confirmed CashierInvoiceStatus enum with known values, swap this for a
// proper per-status color mapping.

import { useTranslation } from 'react-i18next';

interface InvoiceStatusBadgeProps {
  status: string | null;
}

export function InvoiceStatusBadge({ status }: InvoiceStatusBadgeProps) {
  const { t } = useTranslation('');

  return (
    <span className="inline-flex items-center rounded-full border border-[var(--hairline)] bg-[var(--sunken)] px-2.5 py-0.5 text-xs font-medium text-[var(--ink-secondary)]">
      {status ?? t('invoices.statusUnknown')}
    </span>
  );
}
