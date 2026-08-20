// Intended path: src/components/admin/administration/RolesSnapshotCard.tsx
// NOT flagged — Roles (Module 4) is already fully built, so "Manage Roles"
// is a real, working link (at its actual path, /organization/roles).

import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Skeleton } from '../../common/Skeleton';
import type { AdministrationOverviewStats } from '../../../hooks/useAdministrationOverviewStats';

interface Props {
  stats: AdministrationOverviewStats | null;
  isLoading: boolean;
}

export function RolesSnapshotCard({ stats, isLoading }: Props) {
  const { t } = useTranslation();

  return (
    <div className="bg-panel border border-hairline rounded-lg p-4 shadow-elevation-1">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-ink-primary">{t('administration.overview.rolesSnapshot.title')}</h3>
        <Link to="roles" className="text-xs font-medium text-signal hover:text-signal-hover">
          {t('administration.overview.rolesSnapshot.manage')}
        </Link>
      </div>
      {isLoading ? (
        <Skeleton className="h-16 w-full" />
      ) : (
        <div className="grid grid-cols-2 gap-3 text-center">
          <div>
            <p className="text-lg font-semibold text-ink-primary">{stats?.totalRoles ?? 0}</p>
            <p className="text-xs text-ink-tertiary">{t('administration.overview.rolesSnapshot.totalRoles')}</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-ink-primary">{stats?.totalPermissions ?? 0}</p>
            <p className="text-xs text-ink-tertiary">{t('administration.overview.rolesSnapshot.totalPermissions')}</p>
          </div>
        </div>
      )}
    </div>
  );
}
