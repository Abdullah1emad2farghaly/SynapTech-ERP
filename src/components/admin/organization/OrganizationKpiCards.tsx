// Intended path: src/components/admin/organization/OrganizationKpiCards.tsx

import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Building, CheckCircle2, Network, Layers } from 'lucide-react';
import { Skeleton } from '../../common/Skeleton';
import type { OrganizationOverviewStats } from '../../../hooks/useOrganizationOverviewStats';

interface Props {
  stats: OrganizationOverviewStats | null;
  isLoading: boolean;
}

export function OrganizationKpiCards({ stats, isLoading }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const cards = [
    {
      key: 'totalBranches',
      value: stats?.totalBranches ?? 0,
      caption: t('organization.overview.kpi.totalBranchesCaption'),
      icon: Building,
      onClick: () => navigate('branches'),
    },
    {
      key: 'activeBranches',
      value: stats?.activeBranches ?? 0,
      caption: t('organization.overview.kpi.activeBranchesCaption'),
      icon: CheckCircle2,
      onClick: () => navigate('branches'),
    },
    {
      key: 'totalDepartments',
      value: stats?.totalDepartments ?? 0,
      caption: t('organization.overview.kpi.totalDepartmentsCaption'),
      icon: Network,
      onClick: () => navigate('departments'),
    },
    {
      key: 'topLevelDepartments',
      value: stats?.topLevelDepartments ?? 0,
      caption: t('organization.overview.kpi.topLevelDepartmentsCaption'),
      icon: Layers,
      onClick: () => navigate('departments'),
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
                {t(`organization.overview.kpi.${card.key}`)}
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
