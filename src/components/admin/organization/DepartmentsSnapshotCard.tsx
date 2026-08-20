// Intended path: src/components/admin/organization/DepartmentsSnapshotCard.tsx
// NOT flagged — Departments (Module 2) is already fully built, so "Manage
// Departments" is a real, working link.

import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Skeleton } from '../../common/Skeleton';
import type { OrganizationOverviewStats } from '../../../hooks/useOrganizationOverviewStats';

interface Props {
  stats: OrganizationOverviewStats | null;
  isLoading: boolean;
}

export function DepartmentsSnapshotCard({ stats, isLoading }: Props) {
  const { t } = useTranslation();
  const inactiveDepartments = stats ? stats.totalDepartments - stats.activeDepartments : 0;

  return (
    <div className="bg-panel border border-hairline rounded-lg p-4 shadow-elevation-1">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-ink-primary">
          {t('organization.overview.departmentsSnapshot.title')}
        </h3>
        <Link to="departments" className="text-xs font-medium text-signal hover:text-signal-hover">
          {t('organization.overview.departmentsSnapshot.manage')}
        </Link>
      </div>
      {isLoading ? (
        <Skeleton className="h-16 w-full" />
      ) : (
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-lg font-semibold text-ink-primary">{stats?.totalDepartments ?? 0}</p>
            <p className="text-xs text-ink-tertiary">{t('organization.overview.departmentsSnapshot.total')}</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-success">{stats?.activeDepartments ?? 0}</p>
            <p className="text-xs text-ink-tertiary">{t('organization.overview.departmentsSnapshot.active')}</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-ink-tertiary">{inactiveDepartments}</p>
            <p className="text-xs text-ink-tertiary">{t('organization.overview.departmentsSnapshot.inactive')}</p>
          </div>
        </div>
      )}
    </div>
  );
}
