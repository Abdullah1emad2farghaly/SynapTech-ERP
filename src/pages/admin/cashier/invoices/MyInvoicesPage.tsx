// Project path: src/pages/cashier/invoices/MyInvoicesPage.tsx

import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/common/PageHeader';
import { InvoiceHistory } from '@/components/admin/cashier/invoices/InvoiceHistory';
import { useMyInvoices } from '@/hooks/useCashierInvoices';

export function MyInvoicesPage() {
  const { t } = useTranslation('');
  const { data, isLoading, isError, refetch } = useMyInvoices();

  return (
    <div className="flex flex-col gap-6 py-6 md:px-4 px-2">
      <PageHeader
        title={t('invoices.myInvoices.title')}
        description={t('invoices.myInvoices.description')}
      />

      <InvoiceHistory
        invoices={data}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        emptyLabel={t('invoices.myInvoices.empty')}
      />
    </div>
  );
}
