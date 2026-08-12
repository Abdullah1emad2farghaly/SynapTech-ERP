// Intended path: src/components/admin/purchasing/SuppliersSnapshotCard.tsx
// Mirrors Sales Overview's CustomersSnapshotCard, but WITHOUT the 404 flag
// that one carries — Suppliers (Module 7) is already a fully built
// List/Create/Edit module in this project, so the "Manage Suppliers" link
// below is real and functional as written.

import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Skeleton } from '../../common/Skeleton';
import type { PurchasingOverviewStats } from '../../../hooks/usePurchasingOverviewStats';

interface Props {
  stats: PurchasingOverviewStats | null;
  isLoading: boolean;
}

export function SuppliersSnapshotCard({ stats, isLoading }: Props) {
  const { t } = useTranslation();
  const inactiveSuppliers = stats ? stats.totalSuppliers - stats.activeSuppliers : 0;

  return (
    <div className="bg-panel border border-hairline rounded-lg p-4 shadow-elevation-1">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-ink-primary">
          {t('purchasing.overview.suppliersSnapshot.title')}
        </h3>
        <Link to="suppliers" className="text-xs font-medium text-signal hover:text-signal-hover">
          {t('purchasing.overview.suppliersSnapshot.manage')}
        </Link>
      </div>
      {isLoading ? (
        <Skeleton className="h-16 w-full" />
      ) : (
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-lg font-semibold text-ink-primary">{stats?.totalSuppliers ?? 0}</p>
            <p className="text-xs text-ink-tertiary">{t('purchasing.overview.suppliersSnapshot.total')}</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-success">{stats?.activeSuppliers ?? 0}</p>
            <p className="text-xs text-ink-tertiary">{t('purchasing.overview.suppliersSnapshot.active')}</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-ink-tertiary">{inactiveSuppliers}</p>
            <p className="text-xs text-ink-tertiary">{t('purchasing.overview.suppliersSnapshot.inactive')}</p>
          </div>
        </div>
      )}
    </div>
  );
}
