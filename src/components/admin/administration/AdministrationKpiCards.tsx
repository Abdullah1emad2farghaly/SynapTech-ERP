// Intended path: src/components/admin/administration/AdministrationKpiCards.tsx

import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Users, UserCheck, ShieldCheck, KeyRound } from 'lucide-react';
import { Skeleton } from '../../common/Skeleton';
import type { AdministrationOverviewStats } from '../../../hooks/useAdministrationOverviewStats';

interface Props {
  stats: AdministrationOverviewStats | null;
  isLoading: boolean;
}

export function AdministrationKpiCards({ stats, isLoading }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const cards = [
    {
      key: 'totalUsers',
      value: stats?.totalUsers ?? 0,
      caption: t('administration.overview.kpi.totalUsersCaption'),
      icon: Users,
      onClick: () => navigate('users'),
    },
    {
      key: 'activeUsers',
      value: stats?.activeUsers ?? 0,
      caption: t('administration.overview.kpi.activeUsersCaption'),
      icon: UserCheck,
      onClick: () => navigate('users'),
    },
    {
      key: 'totalRoles',
      value: stats?.totalRoles ?? 0,
      caption: t('administration.overview.kpi.totalRolesCaption'),
      icon: ShieldCheck,
      onClick: () => navigate('roles'),
    },
    {
      key: 'totalPermissions',
      value: stats?.totalPermissions ?? 0,
      caption: t('administration.overview.kpi.totalPermissionsCaption'),
      icon: KeyRound,
      onClick: () => navigate('roles'),
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
              <p className="text-xs font-medium text-ink-tertiary">
                {t(`administration.overview.kpi.${card.key}`)}
              </p>
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
