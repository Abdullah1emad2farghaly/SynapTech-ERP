// Intended path: src/components/admin/organization/BranchesSnapshotCard.tsx
// NOT flagged — Branches (Module 3) is already fully built, so "Manage
// Branches" is a real, working link. Also surfaces the Main branch, since
// BranchResponse.isMain is a real, distinctive field worth calling out.

import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Skeleton } from '../../common/Skeleton';
import type { OrganizationOverviewStats } from '../../../hooks/useOrganizationOverviewStats';

interface Props {
  stats: OrganizationOverviewStats | null;
  isLoading: boolean;
}

export function BranchesSnapshotCard({ stats, isLoading }: Props) {
  const { t } = useTranslation();
  const inactiveBranches = stats ? stats.totalBranches - stats.activeBranches : 0;

  return (
    <div className="bg-panel border border-hairline rounded-lg p-4 shadow-elevation-1">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-ink-primary">{t('organization.overview.branchesSnapshot.title')}</h3>
        <Link to="branches" className="text-xs font-medium text-signal hover:text-signal-hover">
          {t('organization.overview.branchesSnapshot.manage')}
        </Link>
      </div>
      {isLoading ? (
        <Skeleton className="h-16 w-full" />
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-lg font-semibold text-ink-primary">{stats?.totalBranches ?? 0}</p>
              <p className="text-xs text-ink-tertiary">{t('organization.overview.branchesSnapshot.total')}</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-success">{stats?.activeBranches ?? 0}</p>
              <p className="text-xs text-ink-tertiary">{t('organization.overview.branchesSnapshot.active')}</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-ink-tertiary">{inactiveBranches}</p>
              <p className="text-xs text-ink-tertiary">{t('organization.overview.branchesSnapshot.inactive')}</p>
            </div>
          </div>
          {stats?.mainBranch && (
            <p className="text-xs text-ink-tertiary mt-3 pt-3 border-t border-hairline">
              {t('organization.overview.branchesSnapshot.mainBranch')}:{' '}
              <span className="font-medium text-ink-primary">{stats.mainBranch.name}</span>
            </p>
          )}
        </>
      )}
    </div>
  );
}
