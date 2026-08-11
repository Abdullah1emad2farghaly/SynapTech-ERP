// Intended path: src/components/admin/sales/SalesKpiCards.tsx

import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '../../common/Skeleton';
import type { SalesOverviewStats } from '../../../hooks/useSalesOverviewStats';

interface Props {
  stats: SalesOverviewStats | null;
  isLoading: boolean;
}

function formatCurrency(value: number) {
  // ASSUMPTION: EGP hardcoded, matching the precedent already set on the
  // Employees module's salary formatting (flagged there too — swap for a
  // global currency setting if/when one exists, e.g. from AccountingSettings).
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 0,
  }).format(value);
}

export function SalesKpiCards({ stats, isLoading }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const cards = [
    {
      key: 'totalOrders',
      value: stats?.totalOrders ?? 0,
      caption: t('sales.overview.kpi.totalOrdersCaption'),
      onClick: () => navigate('/sales/sales-orders'),
    },
    {
      key: 'totalOrderValue',
      value: formatCurrency(stats?.totalOrderValue ?? 0),
      caption: t('sales.overview.kpi.totalOrderValueCaption'),
      onClick: () => navigate('/sales/sales-orders'),
    },
    {
      key: 'totalCustomers',
      value: stats?.totalCustomers ?? 0,
      caption: t('sales.overview.kpi.totalCustomersCaption'),
      onClick: () => navigate('/sales/customers'),
    },
    {
      key: 'activeCustomers',
      value: stats?.activeCustomers ?? 0,
      caption: t('sales.overview.kpi.activeCustomersCaption'),
      onClick: () => navigate('/sales/customers'),
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(card => (
        <button
          key={card.key}
          onClick={card.onClick}
          className="text-start bg-panel border border-hairline rounded-lg p-4 shadow-elevation-1 hover:border-signal/40 transition-colors"
        >
          <p className="text-xs font-medium text-ink-tertiary">{t(`sales.overview.kpi.${card.key}`)}</p>
          {isLoading ? (
            <Skeleton className="h-7 w-20 mt-2" />
          ) : (
            <p className="text-2xl font-display font-semibold text-ink-primary mt-1">{card.value}</p>
          )}
          <p className="text-xs text-ink-tertiary mt-1">{card.caption}</p>
        </button>
      ))}
    </div>
  );
}
