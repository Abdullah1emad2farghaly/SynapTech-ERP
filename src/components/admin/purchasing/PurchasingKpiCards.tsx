// Intended path: src/components/admin/purchasing/PurchasingKpiCards.tsx

import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '../../common/Skeleton';
import type { PurchasingOverviewStats } from '../../../hooks/usePurchasingOverviewStats';

interface Props {
  stats: PurchasingOverviewStats | null;
  isLoading: boolean;
}

function formatCurrency(value: number) {
  // ASSUMPTION: EGP hardcoded, same precedent as Sales Overview/Employees —
  // swap for a global currency setting if/when one exists.
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 0,
  }).format(value);
}

export function PurchasingKpiCards({ stats, isLoading }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const cards = [
    {
      key: 'totalOrders',
      value: stats?.totalOrders ?? 0,
      caption: t('purchasing.overview.kpi.totalOrdersCaption'),
      onClick: () => navigate('purchase-orders'),
    },
    {
      key: 'totalOrderValue',
      value: formatCurrency(stats?.totalOrderValue ?? 0),
      caption: t('purchasing.overview.kpi.totalOrderValueCaption'),
      onClick: () => navigate('purchase-orders'),
    },
    {
      key: 'totalSuppliers',
      value: stats?.totalSuppliers ?? 0,
      caption: t('purchasing.overview.kpi.totalSuppliersCaption'),
      onClick: () => navigate('suppliers'),
    },
    {
      key: 'activeSuppliers',
      value: stats?.activeSuppliers ?? 0,
      caption: t('purchasing.overview.kpi.activeSuppliersCaption'),
      onClick: () => navigate('suppliers'),
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
          <p className="text-xs font-medium text-ink-tertiary">
            {t(`purchasing.overview.kpi.${card.key}`)}
          </p>
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
