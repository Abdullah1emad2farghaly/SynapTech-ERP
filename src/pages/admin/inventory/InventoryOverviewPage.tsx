// Intended path: src/pages/admin/inventory/InventoryOverviewPage.tsx
// REPLACES the previous version. Layout upgrade over v1:
//   1. Added InventoryValueHeroCard at the top — the new headline metric.
//   2. Added OutOfStockProductsCard, shown above-the-fold only when
//      non-empty (same "action item, not passive stat" treatment as
//      Purchasing Overview's OverdueOrdersCard).
//   3. Chart row is now 3 columns on xl screens (Stock by Warehouse |
//      Products by Category | Top Products by Stock) instead of 2, since
//      there's a third real chart now.
// Still true from v1, unchanged: no Recent Activity section exists (Stock
// has no readable movement history — see useInventoryOverviewStats.ts).

import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { InventoryCategoryNav } from '../../../components/admin/inventory/InventoryCategoryNav';
import { InventoryValueHeroCard } from '../../../components/admin/inventory/InventoryValueHeroCard';
import { OutOfStockProductsCard } from '../../../components/admin/inventory/OutOfStockProductsCard';
import { InventoryKpiCards } from '../../../components/admin/inventory/InventoryKpiCards';
import { StockByWarehouseChart } from '../../../components/admin/inventory/StockByWarehouseChart';
import { ProductsByCategoryChart } from '../../../components/admin/inventory/ProductsByCategoryChart';
import { TopProductsByStockCard } from '../../../components/admin/inventory/TopProductsByStockCard';
import { ProductsSnapshotCard } from '../../../components/admin/inventory/ProductsSnapshotCard';
import { CategoriesSnapshotCard } from '../../../components/admin/inventory/CategoriesSnapshotCard';
import { WarehousesSnapshotCard } from '../../../components/admin/inventory/WarehousesSnapshotCard';
import { EmptyState } from '../../../components/common/EmptyState';
import { useInventoryOverviewStats } from '../../../hooks/useInventoryOverviewStats';

export default function InventoryOverviewPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { stats, isLoading, isStockLoading, isError, refetch } = useInventoryOverviewStats();

  const isFullyEmpty = !isLoading && stats && stats.totalProducts === 0 && stats.totalWarehouses === 0;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-1">
        <h1 className="text-2xl font-display font-semibold text-ink-primary">
          {t('inventory.overview.pageTitle')}
        </h1>
        <p className="text-sm text-ink-tertiary mt-1">{t('inventory.overview.pageSubtitle')}</p>
      </div>

      <InventoryCategoryNav />

      {isError ? (
        <div className="bg-panel border border-error/30 rounded-lg p-6 text-center">
          <p className="text-sm text-error mb-3">{t('inventory.overview.errorTitle')}</p>
          <button onClick={refetch} className="text-sm font-medium text-signal hover:text-signal-hover">
            {t('inventory.overview.retry')}
          </button>
        </div>
      ) : isFullyEmpty ? (
        <EmptyState
          title={t('inventory.overview.emptyTitle')}
          description={t('inventory.overview.emptyDescription')}
        />
      ) : (
        <div className="space-y-6">
          <InventoryValueHeroCard value={stats?.totalInventoryValueAtCost} isLoading={isLoading || isStockLoading} />

          {(isLoading || (stats?.outOfStockCount ?? 0) > 0) && (
            <OutOfStockProductsCard
              data={stats?.outOfStockProducts}
              totalCount={stats?.outOfStockCount}
              isLoading={isLoading || isStockLoading}
            />
          )}

          <InventoryKpiCards stats={stats} isLoading={isLoading} />

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <StockByWarehouseChart data={stats?.stockByWarehouse} isLoading={isLoading || isStockLoading} />
            <ProductsByCategoryChart data={stats?.productsByCategory} isLoading={isLoading} />
            <TopProductsByStockCard data={stats?.topProductsByStock} isLoading={isLoading || isStockLoading} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ProductsSnapshotCard stats={stats} isLoading={isLoading} />
            <CategoriesSnapshotCard stats={stats} isLoading={isLoading} />
            <WarehousesSnapshotCard stats={stats} isLoading={isLoading} />
          </div>

          <div className="flex flex-wrap gap-3">
            {/* FLAG: New Product / New Category route to modules that don't exist yet — see the respective snapshot cards' header comments. */}
            <button
              onClick={() => navigate('products')}
              className="text-sm font-medium px-4 py-2 rounded-md border border-hairline hover:border-signal/40 text-ink-primary transition-colors"
            >
              {t('inventory.overview.quickActions.newProduct')}
            </button>
            <button
              onClick={() => navigate('categories')}
              className="text-sm font-medium px-4 py-2 rounded-md border border-hairline hover:border-signal/40 text-ink-primary transition-colors"
            >
              {t('inventory.overview.quickActions.newCategory')}
            </button>
            <button
              onClick={() => navigate('warehouses')}
              className="text-sm font-medium px-4 py-2 rounded-md border border-hairline hover:border-signal/40 text-ink-primary transition-colors"
            >
              {t('inventory.overview.quickActions.manageWarehouses')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
