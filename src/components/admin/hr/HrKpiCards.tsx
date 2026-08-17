// Intended path: src/components/admin/hr/HrKpiCards.tsx

import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Users, UserCheck, CalendarDays, Clock } from 'lucide-react';
import { Skeleton } from '../../common/Skeleton';
import type { HrOverviewStats } from '../../../hooks/useHrOverviewStats';

interface Props {
  stats: HrOverviewStats | null;
  isLoading: boolean;
}

export function HrKpiCards({ stats, isLoading }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const cards = [
    {
      key: 'totalEmployees',
      value: stats?.totalEmployees ?? 0,
      caption: t('hr.overview.kpi.totalEmployeesCaption'),
      icon: Users,
      onClick: () => navigate('employees'),
    },
    {
      key: 'activeEmployees',
      value: stats?.activeEmployees ?? 0,
      caption: t('hr.overview.kpi.activeEmployeesCaption'),
      icon: UserCheck,
      onClick: () => navigate('employees'),
    },
    {
      key: 'totalLeaveRequests',
      value: stats?.totalLeaveRequests ?? 0,
      caption: t('hr.overview.kpi.totalLeaveRequestsCaption'),
      icon: CalendarDays,
      onClick: () => navigate('leave-requests'),
    },
    {
      key: 'pendingLeaveRequests',
      value: stats?.pendingLeaveRequests ?? 0,
      caption: t('hr.overview.kpi.pendingLeaveRequestsCaption'),
      icon: Clock,
      onClick: () => navigate('leave-requests'),
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(card => {
        const Icon = card.icon;
        return (
          <button
            key={card.key}
            onClick={card.onClick}
            className="text-start bg-panel border border-hairline rounded-lg p-4 shadow-elevation-1 hover:border-signal/40 hover:shadow-elevation-2 transition-all"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-ink-tertiary">{t(`hr.overview.kpi.${card.key}`)}</p>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-signal/10 text-signal">
                <Icon size={16} strokeWidth={2} />
              </div>
            </div>
            {isLoading ? (
              <Skeleton className="h-7 w-16 mt-2" />
            ) : (
              <p className="text-2xl font-display font-semibold text-ink-primary mt-2 tabular-nums">{card.value}</p>
            )}
            <p className="text-xs text-ink-tertiary mt-1">{card.caption}</p>
          </button>
        );
      })}
    </div>
  );
}
