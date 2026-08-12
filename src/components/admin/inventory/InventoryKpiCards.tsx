// Intended path: src/components/admin/inventory/InventoryKpiCards.tsx

import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '../../common/Skeleton';
import type { InventoryOverviewStats } from '../../../hooks/useInventoryOverviewStats';

interface Props {
  stats: InventoryOverviewStats | null;
  isLoading: boolean;
}

export function InventoryKpiCards({ stats, isLoading }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const cards = [
    {
      key: 'totalProducts',
      value: stats?.totalProducts ?? 0,
      caption: t('inventory.overview.kpi.totalProductsCaption'),
      onClick: () => navigate('products'),
    },
    {
      key: 'activeProducts',
      value: stats?.activeProducts ?? 0,
      caption: t('inventory.overview.kpi.activeProductsCaption'),
      onClick: () => navigate('products'),
    },
    {
      key: 'totalCategories',
      value: stats?.totalCategories ?? 0,
      caption: t('inventory.overview.kpi.totalCategoriesCaption'),
      onClick: () => navigate('categories'),
    },
    {
      key: 'totalWarehouses',
      value: stats?.totalWarehouses ?? 0,
      caption: t('inventory.overview.kpi.totalWarehousesCaption'),
      onClick: () => navigate('warehouses'),
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
            {t(`inventory.overview.kpi.${card.key}`)}
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
