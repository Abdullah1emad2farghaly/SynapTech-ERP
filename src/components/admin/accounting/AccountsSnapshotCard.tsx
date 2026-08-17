// Intended path: src/components/admin/accounting/AccountsSnapshotCard.tsx
// FLAG: "Manage Accounts" links to /accounts, which is not yet a built
// module — same gap category as Sales' Customers and Inventory's Products.
// Accounts has so far, at most, only existed as a lookup for the Journal
// Entries line-item account picker.

import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Skeleton } from '../../common/Skeleton';
import type { AccountingOverviewStats } from '../../../hooks/useAccountingOverviewStats';

interface Props {
  stats: AccountingOverviewStats | null;
  isLoading: boolean;
}

export function AccountsSnapshotCard({ stats, isLoading }: Props) {
  const { t } = useTranslation();
  const inactiveAccounts = stats ? stats.totalAccounts - stats.activeAccounts : 0;

  return (
    <div className="bg-panel border border-hairline rounded-lg p-4 shadow-elevation-1">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-ink-primary">{t('accounting.overview.accountsSnapshot.title')}</h3>
        <Link to="accounts" className="text-xs font-medium text-signal hover:text-signal-hover">
          {t('accounting.overview.accountsSnapshot.manage')}
        </Link>
      </div>
      {isLoading ? (
        <Skeleton className="h-16 w-full" />
      ) : (
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-lg font-semibold text-ink-primary">{stats?.totalAccounts ?? 0}</p>
            <p className="text-xs text-ink-tertiary">{t('accounting.overview.accountsSnapshot.total')}</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-success">{stats?.activeAccounts ?? 0}</p>
            <p className="text-xs text-ink-tertiary">{t('accounting.overview.accountsSnapshot.active')}</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-ink-tertiary">{inactiveAccounts}</p>
            <p className="text-xs text-ink-tertiary">{t('accounting.overview.accountsSnapshot.inactive')}</p>
          </div>
        </div>
      )}
    </div>
  );
}
