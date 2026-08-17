// Intended path: src/pages/admin/hr/HrOverviewPage.tsx
// Deliberately structured in two visually distinct sections:
//   1. Workforce & Leave — fully grounded in already-built modules
//      (Employees, Departments, Branches, Leave Requests). 6 charts.
//   2. Attendance — its own bordered/labeled section, kept visually
//      separate because every metric in it rests on attendance.api.ts's
//      unconfirmed "unfiltered list returns company-wide data" assumption.
//      If that assumption turns out to be wrong, this section is the only
//      thing that needs to change or be hidden — it doesn't entangle with
//      section 1's logic or layout.

import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { HrCategoryNav } from '../../../components/admin/hr/HrCategoryNav';
import { PayrollHeroCard } from '../../../components/admin/hr/PayrollHeroCard';
import { PendingLeaveRequestsCard } from '../../../components/admin/hr/PendingLeaveRequestsCard';
import { HrKpiCards } from '../../../components/admin/hr/HrKpiCards';
import { EmployeesByDepartmentChart } from '../../../components/admin/hr/EmployeesByDepartmentChart';
import { EmployeesByBranchChart } from '../../../components/admin/hr/EmployeesByBranchChart';
import { HeadcountGrowthChart } from '../../../components/admin/hr/HeadcountGrowthChart';
import { LeaveRequestsByTypeChart } from '../../../components/admin/hr/LeaveRequestsByTypeChart';
import { LeaveRequestsByStatusChart } from '../../../components/admin/hr/LeaveRequestsByStatusChart';
import { LeaveRequestsOverTimeChart } from '../../../components/admin/hr/LeaveRequestsOverTimeChart';
import { RecentLeaveRequestsList } from '../../../components/admin/hr/RecentLeaveRequestsList';
import { EmployeesSnapshotCard } from '../../../components/admin/hr/EmployeesSnapshotCard';
import { AttendanceByStatusChart } from '../../../components/admin/hr/AttendanceByStatusChart';
import { CheckInsOverTimeChart } from '../../../components/admin/hr/CheckInsOverTimeChart';
import { EmptyState } from '../../../components/common/EmptyState';
import { useHrOverviewStats } from '../../../hooks/useHrOverviewStats';

export default function HrOverviewPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { stats, isLoading, isError, attendanceStats, isAttendanceLoading, isAttendanceError, refetch } =
    useHrOverviewStats();

  const isFullyEmpty = !isLoading && stats && stats.totalEmployees === 0 && stats.totalLeaveRequests === 0;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-1">
        <div>
          <h1 className="text-2xl font-display font-semibold text-ink-primary">{t('hr.overview.pageTitle')}</h1>
          <p className="text-sm text-ink-tertiary mt-1">{t('hr.overview.pageSubtitle')}</p>
        </div>
        <button
          onClick={() => navigate('employees/create')}
          className="bg-signal hover:bg-signal-hover text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
        >
          {t('hr.overview.newEmployee')}
        </button>
      </div>

      <HrCategoryNav />

      {isError ? (
        <div className="bg-panel border border-error/30 rounded-lg p-6 text-center">
          <p className="text-sm text-error mb-3">{t('hr.overview.errorTitle')}</p>
          <button onClick={refetch} className="text-sm font-medium text-signal hover:text-signal-hover">
            {t('hr.overview.retry')}
          </button>
        </div>
      ) : isFullyEmpty ? (
        <EmptyState title={t('hr.overview.emptyTitle')} description={t('hr.overview.emptyDescription')} />
      ) : (
        <div className="space-y-8">
          {/* --- Section 1: Workforce & Leave --- */}
          <div className="space-y-6">
            <PayrollHeroCard
              totalPayroll={stats?.totalMonthlyPayroll}
              activeEmployees={stats?.activeEmployees}
              isLoading={isLoading}
            />

            {(isLoading || (stats?.pendingLeaveRequests ?? 0) > 0) && (
              <PendingLeaveRequestsCard
                data={stats?.pendingLeaveRequestsList}
                totalCount={stats?.pendingLeaveRequests}
                isLoading={isLoading}
              />
            )}

            <HrKpiCards stats={stats} isLoading={isLoading} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <EmployeesByDepartmentChart data={stats?.employeesByDepartment} isLoading={isLoading} />
              <EmployeesByBranchChart data={stats?.employeesByBranch} isLoading={isLoading} />
            </div>

            <HeadcountGrowthChart data={stats?.headcountGrowth} isLoading={isLoading} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <LeaveRequestsByTypeChart data={stats?.leaveRequestsByType} isLoading={isLoading} />
              <LeaveRequestsByStatusChart data={stats?.leaveRequestsByStatus} isLoading={isLoading} />
              <LeaveRequestsOverTimeChart data={stats?.leaveRequestsOverTime} isLoading={isLoading} />
            </div>

            <RecentLeaveRequestsList data={stats?.recentLeaveRequests} isLoading={isLoading} />

            <EmployeesSnapshotCard stats={stats} isLoading={isLoading} />
          </div>

          {/* --- Section 2: Attendance (see file header — isolated on
              purpose because of the unconfirmed unfiltered-list assumption) --- */}
          <div className="border-t border-hairline pt-6">
            <h2 className="text-lg font-display font-semibold text-ink-primary mb-1">
              {t('hr.overview.attendanceSectionTitle')}
            </h2>
            <p className="text-xs text-ink-tertiary mb-4">{t('hr.overview.attendanceSectionCaption')}</p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AttendanceByStatusChart
                data={attendanceStats?.attendanceByStatus}
                isLoading={isAttendanceLoading}
                isError={isAttendanceError}
              />
              <CheckInsOverTimeChart
                data={attendanceStats?.checkInsOverTime}
                isLoading={isAttendanceLoading}
                isError={isAttendanceError}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate('employees/create')}
              className="text-sm font-medium px-4 py-2 rounded-md border border-hairline hover:border-signal/40 text-ink-primary transition-colors"
            >
              {t('hr.overview.quickActions.newEmployee')}
            </button>
            <button
              onClick={() => navigate('leave-requests')}
              className="text-sm font-medium px-4 py-2 rounded-md border border-hairline hover:border-signal/40 text-ink-primary transition-colors"
            >
              {t('hr.overview.quickActions.viewLeaveRequests')}
            </button>
            <button
              onClick={() => navigate('employees')}
              className="text-sm font-medium px-4 py-2 rounded-md border border-hairline hover:border-signal/40 text-ink-primary transition-colors"
            >
              {t('hr.overview.quickActions.viewEmployees')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
