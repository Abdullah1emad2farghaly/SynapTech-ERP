// Intended path: src/components/admin/inventory/WarehousesSnapshotCard.tsx
// Unlike Products/Categories, this one is NOT flagged — Warehouses (Module
// 6) is already fully built, so "Manage Warehouses" is a real, working link.

import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Skeleton } from '../../common/Skeleton';
import type { InventoryOverviewStats } from '../../../hooks/useInventoryOverviewStats';

interface Props {
  stats: InventoryOverviewStats | null;
  isLoading: boolean;
}

export function WarehousesSnapshotCard({ stats, isLoading }: Props) {
  const { t } = useTranslation();
  const inactiveWarehouses = stats ? stats.totalWarehouses - stats.activeWarehouses : 0;

  return (
    <div className="bg-panel border border-hairline rounded-lg p-4 shadow-elevation-1">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-ink-primary">
          {t('inventory.overview.warehousesSnapshot.title')}
        </h3>
        <Link to="warehouses" className="text-xs font-medium text-signal hover:text-signal-hover">
          {t('inventory.overview.warehousesSnapshot.manage')}
        </Link>
      </div>
      {isLoading ? (
        <Skeleton className="h-16 w-full" />
      ) : (
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-lg font-semibold text-ink-primary">{stats?.totalWarehouses ?? 0}</p>
            <p className="text-xs text-ink-tertiary">{t('inventory.overview.warehousesSnapshot.total')}</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-success">{stats?.activeWarehouses ?? 0}</p>
            <p className="text-xs text-ink-tertiary">{t('inventory.overview.warehousesSnapshot.active')}</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-ink-tertiary">{inactiveWarehouses}</p>
            <p className="text-xs text-ink-tertiary">{t('inventory.overview.warehousesSnapshot.inactive')}</p>
          </div>
        </div>
      )}
    </div>
  );
}
