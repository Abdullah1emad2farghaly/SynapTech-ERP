// Intended path: src/pages/admin/inventory/InventoryOverviewPage.tsx
// NOTE: unlike Sales/Purchasing Overview, there is deliberately no
// "Recent Activity" section here. Stock has no GET endpoint to list
// movement/transfer history (only POST endpoints exist to create them) —
// so there is no readable transactional feed for Inventory at all. This is
// a real difference from Sales/Purchasing (both have orderDate-sortable
// order lists), not an oversight.

import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { InventoryCategoryNav } from '../../../components/admin/inventory/InventoryCategoryNav';
import { InventoryKpiCards } from '../../../components/admin/inventory/InventoryKpiCards';
import { StockByWarehouseChart } from '../../../components/admin/inventory/StockByWarehouseChart';
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
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-display font-semibold text-ink-primary">
          {t('inventory.overview.pageTitle')}
        </h1>
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
          <InventoryKpiCards stats={stats} isLoading={isLoading} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StockByWarehouseChart data={stats?.stockByWarehouse} isLoading={isLoading || isStockLoading} />
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
