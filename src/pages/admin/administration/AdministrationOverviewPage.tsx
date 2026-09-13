

import { useTranslation } from 'react-i18next';
import { AdministrationCategoryNav } from '../../../components/admin/administration/AdministrationCategoryNav';
import { UsersWithoutRolesCard } from '../../../components/admin/administration/UsersWithoutRolesCard';
import { RolesWithNoUsersCard } from '../../../components/admin/administration/RolesWithNoUsersCard';
import { AdministrationKpiCards } from '../../../components/admin/administration/AdministrationKpiCards';
import { UsersByRoleChart } from '../../../components/admin/administration/UsersByRoleChart';
import { UsersByStatusChart } from '../../../components/admin/administration/UsersByStatusChart';
import { UsersByBranchChart } from '../../../components/admin/administration/UsersByBranchChart';
import { UsersByDepartmentChart } from '../../../components/admin/administration/UsersByDepartmentChart';
import { RolesByPermissionCountChart } from '../../../components/admin/administration/RolesByPermissionCountChart';
import { PermissionsByModuleChart } from '../../../components/admin/administration/PermissionsByModuleChart';
import { UsersSnapshotCard } from '../../../components/admin/administration/UsersSnapshotCard';
import { RolesSnapshotCard } from '../../../components/admin/administration/RolesSnapshotCard';
import { EmptyState } from '../../../components/common/EmptyState';
import { useAdministrationOverviewStats } from '../../../hooks/useAdministrationOverviewStats';

export default function AdministrationOverviewPage() {
  const { t } = useTranslation();
  const { stats, isLoading, isError, isPermissionsCatalogLoading, isPermissionsCatalogError, refetch } =
    useAdministrationOverviewStats();

  const isFullyEmpty = !isLoading && stats && stats.totalUsers === 0 && stats.totalRoles === 0;
  const hasAlerts = (stats?.usersWithoutRolesCount ?? 0) > 0 || (stats?.rolesWithNoUsers.length ?? 0) > 0;

  return (
    <div className="py-6 md:px-6 px-2 max-w-7xl mx-auto">
      <div className="mb-1">
        <h1 className="text-2xl font-display font-semibold text-ink-primary">
          {t('administration.overview.pageTitle')}
        </h1>
        <p className="text-sm text-ink-tertiary mt-1">{t('administration.overview.pageSubtitle')}</p>
      </div>

      <AdministrationCategoryNav />

      {isError ? (
        <div className="bg-panel border border-error/30 rounded-lg p-6 text-center">
          <p className="text-sm text-error mb-3">{t('administration.overview.errorTitle')}</p>
          <button onClick={refetch} className="text-sm font-medium text-signal hover:text-signal-hover">
            {t('administration.overview.retry')}
          </button>
        </div>
      ) : isFullyEmpty ? (
        <EmptyState
          title={t('administration.overview.emptyTitle')}
          description={t('administration.overview.emptyDescription')}
        />
      ) : (
        <div className="space-y-6">
          {(isLoading || hasAlerts) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <UsersWithoutRolesCard
                data={stats?.usersWithoutRoles}
                totalCount={stats?.usersWithoutRolesCount}
                isLoading={isLoading}
              />
              <RolesWithNoUsersCard data={stats?.rolesWithNoUsers} isLoading={isLoading} />
            </div>
          )}

          <AdministrationKpiCards stats={stats} isLoading={isLoading} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <UsersByRoleChart data={stats?.usersByRole} isLoading={isLoading} />
            <UsersByStatusChart data={stats?.usersByStatus} isLoading={isLoading} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <UsersByBranchChart data={stats?.usersByBranch} isLoading={isLoading} />
            <UsersByDepartmentChart data={stats?.usersByDepartment} isLoading={isLoading} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RolesByPermissionCountChart data={stats?.rolesByPermissionCount} isLoading={isLoading} />
            <PermissionsByModuleChart
              data={stats?.permissionsByModule}
              isLoading={isPermissionsCatalogLoading}
              isError={isPermissionsCatalogError}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <UsersSnapshotCard stats={stats} isLoading={isLoading} />
            <RolesSnapshotCard stats={stats} isLoading={isLoading} />
          </div>
        </div>
      )}
    </div>
  );
}
