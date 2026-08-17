// Intended path: src/components/admin/inventory/InventoryKpiCards.tsx
// REPLACES the previous version. Same 4 metrics, same data — visual upgrade
// only: icons, subtle icon-chip backgrounds, slightly larger touch targets.
// Total Inventory Value now lives in its own hero card (InventoryValueHeroCard)
// rather than here, since it deserves more visual weight than a same-size grid tile.

import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Package, PackageCheck, FolderTree, Warehouse as WarehouseIcon } from 'lucide-react';
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
      icon: Package,
      onClick: () => navigate('products'),
    },
    {
      key: 'activeProducts',
      value: stats?.activeProducts ?? 0,
      caption: t('inventory.overview.kpi.activeProductsCaption'),
      icon: PackageCheck,
      onClick: () => navigate('products'),
    },
    {
      key: 'totalCategories',
      value: stats?.totalCategories ?? 0,
      caption: t('inventory.overview.kpi.totalCategoriesCaption'),
      icon: FolderTree,
      onClick: () => navigate('categories'),
    },
    {
      key: 'totalWarehouses',
      value: stats?.totalWarehouses ?? 0,
      caption: t('inventory.overview.kpi.totalWarehousesCaption'),
      icon: WarehouseIcon,
      onClick: () => navigate('warehouses'),
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
              <p className="text-xs font-medium text-ink-tertiary">{t(`inventory.overview.kpi.${card.key}`)}</p>
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
