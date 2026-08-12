// Intended path: src/components/admin/inventory/CategoriesSnapshotCard.tsx
// FLAG: "Manage Categories" links to /categories, which does not exist —
// the Categories module was explicitly cancelled mid-build previously
// (spec + types/utils/schema/API/hooks were started, no components/pages
// were ever written). This card and the Categories tab on
// InventoryCategoryNav are both honest placeholders until that module is
// actually (re)built.

import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Skeleton } from '../../common/Skeleton';
import type { InventoryOverviewStats } from '../../../hooks/useInventoryOverviewStats';

interface Props {
  stats: InventoryOverviewStats | null;
  isLoading: boolean;
}

export function CategoriesSnapshotCard({ stats, isLoading }: Props) {
  const { t } = useTranslation();
  const inactiveCategories = stats ? stats.totalCategories - stats.activeCategories : 0;

  return (
    <div className="bg-panel border border-hairline rounded-lg p-4 shadow-elevation-1">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-ink-primary">
          {t('inventory.overview.categoriesSnapshot.title')}
        </h3>
        <Link to="categories" className="text-xs font-medium text-signal hover:text-signal-hover">
          {t('inventory.overview.categoriesSnapshot.manage')}
        </Link>
      </div>
      {isLoading ? (
        <Skeleton className="h-16 w-full" />
      ) : (
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-lg font-semibold text-ink-primary">{stats?.totalCategories ?? 0}</p>
            <p className="text-xs text-ink-tertiary">{t('inventory.overview.categoriesSnapshot.total')}</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-success">{stats?.activeCategories ?? 0}</p>
            <p className="text-xs text-ink-tertiary">{t('inventory.overview.categoriesSnapshot.active')}</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-ink-tertiary">{inactiveCategories}</p>
            <p className="text-xs text-ink-tertiary">{t('inventory.overview.categoriesSnapshot.inactive')}</p>
          </div>
        </div>
      )}
    </div>
  );
}
