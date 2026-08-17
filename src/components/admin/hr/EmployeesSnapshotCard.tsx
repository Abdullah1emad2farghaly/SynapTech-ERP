// Intended path: src/components/admin/hr/EmployeesSnapshotCard.tsx
// NOT flagged — Employees (Module 10) is already a fully built module, so
// "Manage Employees" is a real, working link.
// ASSUMPTION: "inactive" here is computed as total minus active (status ===
// 'Active'), so it silently folds together any other status values
// (OnLeave, Terminated, etc. if they exist) into one bucket — acceptable
// for a snapshot card, but worth knowing if the real enum has more states.

import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Skeleton } from '../../common/Skeleton';
import type { HrOverviewStats } from '../../../hooks/useHrOverviewStats';

interface Props {
  stats: HrOverviewStats | null;
  isLoading: boolean;
}

export function EmployeesSnapshotCard({ stats, isLoading }: Props) {
  const { t } = useTranslation();
  const otherStatus = stats ? stats.totalEmployees - stats.activeEmployees : 0;

  return (
    <div className="bg-panel border border-hairline rounded-lg p-4 shadow-elevation-1">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-ink-primary">{t('hr.overview.employeesSnapshot.title')}</h3>
        <Link to="employees" className="text-xs font-medium text-signal hover:text-signal-hover">
          {t('hr.overview.employeesSnapshot.manage')}
        </Link>
      </div>
      {isLoading ? (
        <Skeleton className="h-16 w-full" />
      ) : (
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-lg font-semibold text-ink-primary">{stats?.totalEmployees ?? 0}</p>
            <p className="text-xs text-ink-tertiary">{t('hr.overview.employeesSnapshot.total')}</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-success">{stats?.activeEmployees ?? 0}</p>
            <p className="text-xs text-ink-tertiary">{t('hr.overview.employeesSnapshot.active')}</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-ink-tertiary">{otherStatus}</p>
            <p className="text-xs text-ink-tertiary">{t('hr.overview.employeesSnapshot.other')}</p>
          </div>
        </div>
      )}
    </div>
  );
}
