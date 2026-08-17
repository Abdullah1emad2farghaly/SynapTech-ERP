// Intended path: src/components/admin/hr/RecentLeaveRequestsList.tsx
// Mirrors the recent-activity pattern from the other Overview pages.
// ASSUMPTION: path/name of an existing LeaveRequestStatusBadge component —
// verify against the actual Leave Requests module folder (Module 11).

import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Skeleton } from '../../common/Skeleton';
import { EmptyState } from '../../common/EmptyState';
import { LeaveRequestStatusBadge } from '../leaveRequests/LeaveRequestStatusBadge';
import type { LeaveRequestResponse } from '../../../services/api/leaveRequests.api';

interface Props {
  data: LeaveRequestResponse[] | undefined;
  isLoading: boolean;
}

export function RecentLeaveRequestsList({ data, isLoading }: Props) {
  const { t } = useTranslation();

  return (
    <div className="bg-panel border border-hairline rounded-lg p-4 shadow-elevation-1">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-ink-primary">{t('hr.overview.recentLeave.title')}</h3>
        <Link to="leave-requests" className="text-xs font-medium text-signal hover:text-signal-hover">
          {t('hr.overview.recentLeave.viewAll')}
        </Link>
      </div>
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <EmptyState
          title={t('hr.overview.recentLeave.emptyTitle')}
          description={t('hr.overview.recentLeave.emptyDescription')}
        />
      ) : (
        <ul className="divide-y divide-hairline">
          {data.map(request => (
            <li key={request.id}>
              <Link
                to={`leave-requests/${request.id}`}
                className="flex items-center justify-between py-3 hover:bg-sunken/40 -mx-2 px-2 rounded-md transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm text-ink-primary truncate">{request.employeeName}</p>
                  <p className="text-xs text-ink-tertiary truncate">
                    {request.leaveType} · {new Date(request.startDate).toLocaleDateString()} –{' '}
                    {new Date(request.endDate).toLocaleDateString()}
                  </p>
                </div>
                <LeaveRequestStatusBadge status={request.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
