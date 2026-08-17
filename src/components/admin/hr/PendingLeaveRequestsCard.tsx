// Intended path: src/components/admin/hr/PendingLeaveRequestsCard.tsx
// Same "action item, not passive stat" treatment as Purchasing Overview's
// OverdueOrdersCard and Inventory's OutOfStockProductsCard — shown above
// the fold only when non-empty.
// ASSUMPTION: "Pending" as the exact status string is unconfirmed — see
// useHrOverviewStats.ts's header comment.

import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { Skeleton } from '../../common/Skeleton';
import type { LeaveRequestResponse } from '../../../services/api/leaveRequests.api';

interface Props {
  data: LeaveRequestResponse[] | undefined;
  totalCount: number | undefined;
  isLoading: boolean;
}

export function PendingLeaveRequestsCard({ data, totalCount, isLoading }: Props) {
  const { t } = useTranslation();
  const hasPending = (totalCount ?? 0) > 0;

  return (
    <div
      className={[
        'bg-panel border rounded-lg p-4 shadow-elevation-1',
        hasPending ? 'border-warning/40' : 'border-hairline',
      ].join(' ')}
    >
      <div className="flex items-center gap-2 mb-3">
        <Clock size={16} className={hasPending ? 'text-warning' : 'text-ink-tertiary'} />
        <h3 className="text-sm font-medium text-ink-primary">{t('hr.overview.pendingLeave.title')}</h3>
        {hasPending && (
          <span className="ms-auto text-xs font-medium px-2 py-0.5 rounded-full bg-warning/15 text-warning">
            {t('hr.overview.pendingLeave.badge', { count: totalCount })}
          </span>
        )}
      </div>
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : !hasPending ? (
        <p className="text-sm text-ink-tertiary">{t('hr.overview.pendingLeave.emptyDescription')}</p>
      ) : (
        <>
          <ul className="space-y-2">
            {(data ?? []).map(request => (
              <li key={request.id}>
                <Link
                  to={`leave-requests/${request.id}`}
                  className="flex items-center justify-between py-1 px-2 -mx-2 rounded-md hover:bg-sunken/40 transition-colors"
                >
                  <div className="min-w-0">
                    <span className="text-sm text-ink-primary truncate">{request.employeeName}</span>
                    <span className="ms-2 text-xs text-ink-tertiary">{request.leaveType}</span>
                  </div>
                  <span className="text-xs text-ink-tertiary whitespace-nowrap">
                    {new Date(request.startDate).toLocaleDateString()}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {(totalCount ?? 0) > (data?.length ?? 0) && (
            <Link
              to="leave-requests"
              className="text-xs font-medium text-signal hover:text-signal-hover mt-2 inline-block"
            >
              {t('hr.overview.pendingLeave.viewAll', { count: totalCount })}
            </Link>
          )}
        </>
      )}
    </div>
  );
}
