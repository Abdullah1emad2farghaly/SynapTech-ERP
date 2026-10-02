// Project path: src/pages/cashier/invoices/InvoicesByUserPage.tsx

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { UserInvoiceSelector } from '@/components/admin/cashier/invoices/UserInvoiceSelector';
import { InvoiceHistory } from '@/components/admin/cashier/invoices/InvoiceHistory';
import { useInvoicesByUser } from '@/hooks/useCashierInvoices';

export function InvoicesByUserPage() {
  const { t } = useTranslation('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useInvoicesByUser(selectedUserId);

  return (
    <div className="flex flex-col gap-6 py-6 md:px-4 px-2">
      <PageHeader
        title={t('invoices.byUser.title')}
        description={t('invoices.byUser.description')}
        actions={
          <UserInvoiceSelector value={selectedUserId} onChange={setSelectedUserId} />
        }
      />

      {!selectedUserId ? (
        <EmptyState title={t('invoices.byUser.selectUserPrompt')} />
      ) : (
        <InvoiceHistory
          invoices={data}
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
          emptyLabel={t('invoices.byUser.empty')}
        />
      )}
    </div>
  );
}
