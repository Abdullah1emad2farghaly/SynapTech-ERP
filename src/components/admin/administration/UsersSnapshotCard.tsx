// Intended path: src/components/admin/administration/UsersSnapshotCard.tsx
// NOT flagged — Users (Module 1) is already fully built, so "Manage Users"
// is a real, working link.

import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Skeleton } from '../../common/Skeleton';
import type { AdministrationOverviewStats } from '../../../hooks/useAdministrationOverviewStats';

interface Props {
  stats: AdministrationOverviewStats | null;
  isLoading: boolean;
}

export function UsersSnapshotCard({ stats, isLoading }: Props) {
  const { t } = useTranslation();
  const inactiveUsers = stats ? stats.totalUsers - stats.activeUsers : 0;

  return (
    <div className="bg-panel border border-hairline rounded-lg p-4 shadow-elevation-1">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-ink-primary">{t('administration.overview.usersSnapshot.title')}</h3>
        <Link to="users" className="text-xs font-medium text-signal hover:text-signal-hover">
          {t('administration.overview.usersSnapshot.manage')}
        </Link>
      </div>
      {isLoading ? (
        <Skeleton className="h-16 w-full" />
      ) : (
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-lg font-semibold text-ink-primary">{stats?.totalUsers ?? 0}</p>
            <p className="text-xs text-ink-tertiary">{t('administration.overview.usersSnapshot.total')}</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-success">{stats?.activeUsers ?? 0}</p>
            <p className="text-xs text-ink-tertiary">{t('administration.overview.usersSnapshot.active')}</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-ink-tertiary">{inactiveUsers}</p>
            <p className="text-xs text-ink-tertiary">{t('administration.overview.usersSnapshot.inactive')}</p>
          </div>
        </div>
      )}
    </div>
  );
}
