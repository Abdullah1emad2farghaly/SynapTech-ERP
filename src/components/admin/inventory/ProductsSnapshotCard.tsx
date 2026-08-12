// Intended path: src/components/admin/inventory/ProductsSnapshotCard.tsx
// FLAG: "Manage Products" links to /products, which is not yet a built
// module in this project — same situation as Sales Overview's Customers
// snapshot. Products has so far only existed as a lookup for PO/SO
// line-item pickers, never as a full List/Create/Edit module.

import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Skeleton } from '../../common/Skeleton';
import type { InventoryOverviewStats } from '../../../hooks/useInventoryOverviewStats';

interface Props {
  stats: InventoryOverviewStats | null;
  isLoading: boolean;
}

export function ProductsSnapshotCard({ stats, isLoading }: Props) {
  const { t } = useTranslation();
  const inactiveProducts = stats ? stats.totalProducts - stats.activeProducts : 0;

  return (
    <div className="bg-panel border border-hairline rounded-lg p-4 shadow-elevation-1">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-ink-primary">{t('inventory.overview.productsSnapshot.title')}</h3>
        <Link to="products" className="text-xs font-medium text-signal hover:text-signal-hover">
          {t('inventory.overview.productsSnapshot.manage')}
        </Link>
      </div>
      {isLoading ? (
        <Skeleton className="h-16 w-full" />
      ) : (
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-lg font-semibold text-ink-primary">{stats?.totalProducts ?? 0}</p>
            <p className="text-xs text-ink-tertiary">{t('inventory.overview.productsSnapshot.total')}</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-success">{stats?.activeProducts ?? 0}</p>
            <p className="text-xs text-ink-tertiary">{t('inventory.overview.productsSnapshot.active')}</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-ink-tertiary">{inactiveProducts}</p>
            <p className="text-xs text-ink-tertiary">{t('inventory.overview.productsSnapshot.inactive')}</p>
          </div>
        </div>
      )}
    </div>
  );
}
