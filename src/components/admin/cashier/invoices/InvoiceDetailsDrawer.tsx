// Project path: src/components/cashier/invoices/InvoiceDetailsDrawer.tsx
//
// Loads invoice details on demand via GET /api/cashier/invoices/{id}
// (useCashierInvoiceDetails) only when a row is selected — not prefetched
// per row in the list, per the brief's performance requirement.
//
// ASSUMPTION: Drawer prop shape (open/onClose/title/children) follows the
// shell rebuilt for the Accounts module — verify against the real
// component.

import { useTranslation } from 'react-i18next';
import { Drawer } from '@/components/common/Drawer';
import { InvoiceStatusBadge } from './InvoiceStatusBadge';
import { InvoiceLinesTable } from './InvoiceLinesTable';
import { InvoiceSummary } from './InvoiceSummary';
import { useCashierInvoiceDetails } from '@/hooks/useCashierInvoices';
import { formatDate } from '@/utils/formatters';
import { printInvoice } from './InvoicePrintView';
import { InvoiceView } from '../InvoiceView';

interface InvoiceDetailsDrawerProps {
  invoiceId: string | null;
  onClose: () => void;
}

export function InvoiceDetailsDrawer({ invoiceId, onClose }: InvoiceDetailsDrawerProps) {
  const { t } = useTranslation('');
  const { data: invoice, isLoading, isError, refetch } = useCashierInvoiceDetails(invoiceId);

  return (
    <Drawer
      open={Boolean(invoiceId)}
      onClose={onClose}
      title={invoice?.invoiceNumber ?? t('invoices.details.title')}
    >
      {isLoading && (
        <div className="flex flex-col gap-3 p-4">
          <div className="h-6 w-1/2 animate-pulse rounded bg-[var(--sunken)]" />
          <div className="h-40 animate-pulse rounded-[10px] bg-[var(--sunken)]" />
        </div>
      )}

      {isError && (
        <div className="p-4">
          <button
            type="button"
            onClick={() => refetch()}
            className="text-sm font-medium text-[var(--signal)] hover:underline"
          >
            {t('common.retry')}
          </button>
        </div>
      )}

      
      {isLoading || !invoice ? (
        <div className="h-32 animate-pulse rounded-md bg-[var(--sunken)] m-4" />
      ) : (
        <InvoiceView invoice={invoice} />
      )}
    </Drawer>
  );
}
