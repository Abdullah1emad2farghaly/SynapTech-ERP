// Intended path: src/pages/admin/purchasing/PurchasingOverviewPage.tsx

import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PurchasingCategoryNav } from '../../../components/admin/purchasing/PurchasingCategoryNav';
import { PurchasingKpiCards } from '../../../components/admin/purchasing/PurchasingKpiCards';
import { OrdersByStatusChart } from '../../../components/admin/purchasing/OrdersByStatusChart';
import { TopSuppliersCard } from '../../../components/admin/purchasing/TopSuppliersCard';
import { RecentPurchaseOrdersList } from '../../../components/admin/purchasing/RecentPurchaseOrdersList';
import { OverdueOrdersCard } from '../../../components/admin/purchasing/OverdueOrdersCard';
import { SuppliersSnapshotCard } from '../../../components/admin/purchasing/SuppliersSnapshotCard';
import { EmptyState } from '../../../components/common/EmptyState';
import { usePurchasingOverviewStats } from '../../../hooks/usePurchasingOverviewStats';

export default function PurchasingOverviewPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { stats, isLoading, isError, refetch } = usePurchasingOverviewStats();

  const isFullyEmpty = !isLoading && stats && stats.totalOrders === 0 && stats.totalSuppliers === 0;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-display font-semibold text-ink-primary">
          {t('purchasing.overview.pageTitle')}
        </h1>
        <button
          onClick={() => navigate('purchase-orders/create')}
          className="bg-signal hover:bg-signal-hover text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
        >
          {t('purchasing.overview.newOrder')}
        </button>
      </div>

      <PurchasingCategoryNav />

      {isError ? (
        <div className="bg-panel border border-error/30 rounded-lg p-6 text-center">
          <p className="text-sm text-error mb-3">{t('purchasing.overview.errorTitle')}</p>
          <button onClick={refetch} className="text-sm font-medium text-signal hover:text-signal-hover">
            {t('purchasing.overview.retry')}
          </button>
        </div>
      ) : isFullyEmpty ? (
        <EmptyState
          title={t('purchasing.overview.emptyTitle')}
          description={t('purchasing.overview.emptyDescription')}
          action={{ label: t('purchasing.overview.newOrder'), onClick: () => navigate('purchase-orders/create') }}
        />
      ) : (
        <div className="space-y-6">
          <PurchasingKpiCards stats={stats} isLoading={isLoading} />

          {/* Overdue is surfaced above the fold when it's non-empty — it's
              an action item, not a passive stat, so it shouldn't sit below
              the recent-activity fold once there's something in it. */}
          {(isLoading || (stats?.overdueOrders.length ?? 0) > 0) && (
            <OverdueOrdersCard data={stats?.overdueOrders} isLoading={isLoading} />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <OrdersByStatusChart data={stats?.ordersByStatus} isLoading={isLoading} />
            <TopSuppliersCard data={stats?.topSuppliers} isLoading={isLoading} />
          </div>

          <RecentPurchaseOrdersList data={stats?.recentOrders} isLoading={isLoading} />

          <SuppliersSnapshotCard stats={stats} isLoading={isLoading} />

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate('purchase-orders/create')}
              className="text-sm font-medium px-4 py-2 rounded-md border border-hairline hover:border-signal/40 text-ink-primary transition-colors"
            >
              {t('purchasing.overview.quickActions.newOrder')}
            </button>
            <button
              onClick={() => navigate('suppliers')}
              className="text-sm font-medium px-4 py-2 rounded-md border border-hairline hover:border-signal/40 text-ink-primary transition-colors"
            >
              {t('purchasing.overview.quickActions.newSupplier')}
            </button>
            <button
              onClick={() => navigate('purchase-orders')}
              className="text-sm font-medium px-4 py-2 rounded-md border border-hairline hover:border-signal/40 text-ink-primary transition-colors"
            >
              {t('purchasing.overview.quickActions.viewAllOrders')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
