// Intended path: src/pages/admin/organization/OrganizationOverviewPage.tsx
// NOTE: deliberately no "Recent Activity" section — Branches, Departments,
// and Companies all lack any date/createdAt field, so there's nothing to
// order by recency anywhere in this domain (see
// useOrganizationOverviewStats.ts's header comment). The
// DepartmentsTreemapChart exists specifically to give this page a second,
// genuinely distinct "detailed chart" despite that constraint, rather than
// padding the page with a re-skinned duplicate of the bar chart.

import { useTranslation } from 'react-i18next';
import { OrganizationCategoryNav } from '../../../components/admin/organization/OrganizationCategoryNav';
import { CompanyHeroCard } from '../../../components/admin/organization/CompanyHeroCard';
import { OrganizationKpiCards } from '../../../components/admin/organization/OrganizationKpiCards';
import { BranchesByStatusChart } from '../../../components/admin/organization/BranchesByStatusChart';
import { DepartmentHierarchyChart } from '../../../components/admin/organization/DepartmentHierarchyChart';
import { DepartmentsByBranchChart } from '../../../components/admin/organization/DepartmentsByBranchChart';
import { DepartmentsTreemapChart } from '../../../components/admin/organization/DepartmentsTreemapChart';
import { BranchesSnapshotCard } from '../../../components/admin/organization/BranchesSnapshotCard';
import { DepartmentsSnapshotCard } from '../../../components/admin/organization/DepartmentsSnapshotCard';
import { EmptyState } from '../../../components/common/EmptyState';
import { useOrganizationOverviewStats } from '../../../hooks/useOrganizationOverviewStats';

export default function OrganizationOverviewPage() {
  const { t } = useTranslation();
  const { stats, isLoading, isError, company, isCompanyLoading, isCompanyError, refetch } =
    useOrganizationOverviewStats();

  const isFullyEmpty = !isLoading && stats && stats.totalBranches === 0 && stats.totalDepartments === 0;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-1">
        <h1 className="text-2xl font-display font-semibold text-ink-primary">
          {t('organization.overview.pageTitle')}
        </h1>
        <p className="text-sm text-ink-tertiary mt-1">{t('organization.overview.pageSubtitle')}</p>
      </div>

      <OrganizationCategoryNav />

      {isError ? (
        <div className="bg-panel border border-error/30 rounded-lg p-6 text-center">
          <p className="text-sm text-error mb-3">{t('organization.overview.errorTitle')}</p>
          <button onClick={refetch} className="text-sm font-medium text-signal hover:text-signal-hover">
            {t('organization.overview.retry')}
          </button>
        </div>
      ) : isFullyEmpty ? (
        <EmptyState
          title={t('organization.overview.emptyTitle')}
          description={t('organization.overview.emptyDescription')}
        />
      ) : (
        <div className="space-y-6">
          <CompanyHeroCard company={company} isLoading={isCompanyLoading} isError={isCompanyError} />

          <OrganizationKpiCards stats={stats} isLoading={isLoading} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BranchesByStatusChart data={stats?.branchesByStatus} isLoading={isLoading} />
            <DepartmentHierarchyChart data={stats?.departmentHierarchy} isLoading={isLoading} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DepartmentsByBranchChart data={stats?.departmentsByBranch} isLoading={isLoading} />
            <DepartmentsTreemapChart data={stats?.departmentsTreemap} isLoading={isLoading} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BranchesSnapshotCard stats={stats} isLoading={isLoading} />
            <DepartmentsSnapshotCard stats={stats} isLoading={isLoading} />
          </div>
        </div>
      )}
    </div>
  );
}
