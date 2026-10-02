// Project path: src/pages/admin/accounting/AccountingSettingsPage.tsx

import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../../components/common/PageHeader';
import { ErrorState } from '../../../components/common/ErrorState';
import { AccountingSettingsForm } from '../../../components/admin/accounting/AccountingSettingsForm';
import {
  useAccountingSettings,
  useUpdateAccountingSettings,
} from '../../../hooks/useAccountingSettings';

export function AccountingSettingsPage() {
  const { t } = useTranslation('');
  const { data, isLoading, isError, refetch } = useAccountingSettings();
  const updateSettings = useUpdateAccountingSettings();

  return (
    <div className="flex flex-col gap-6 py-6 md:px-4 px-2">
      <PageHeader
        title={t('accountingSettings.title')}
        description={t('accountingSettings.description')}
      />

      {isError && <ErrorState onRetry={refetch} title='' />}

      {!isError && isLoading && (
        <div className="h-64 animate-pulse rounded-[10px] bg-[var(--sunken)]" />
      )}

      {!isError && !isLoading && data && (
        <AccountingSettingsForm
          initialValues={data}
          isSaving={updateSettings.isPending}
          onSubmit={(values) => updateSettings.mutate(values)}
        />
      )}
    </div>
  );
}
