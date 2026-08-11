// Intended path: src/pages/admin/sales/SalesOverviewPage.tsx

import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { SalesCategoryNav } from '../../../components/admin/sales/SalesCategoryNav';
import { SalesKpiCards } from '../../../components/admin/sales/SalesKpiCards';
import { OrdersByStatusChart } from '../../../components/admin/sales/OrdersByStatusChart';
import { TopCustomersCard } from '../../../components/admin/sales/TopCustomersCard';
import { RecentSalesOrdersList } from '../../../components/admin/sales/RecentSalesOrdersList';
import { CustomersSnapshotCard } from '../../../components/admin/sales/CustomersSnapshotCard';
import { EmptyState } from '../../../components/common/EmptyState';
import { useSalesOverviewStats } from '../../../hooks/useSalesOverviewStats';

export default function SalesOverviewPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { stats, isLoading, isError, refetch } = useSalesOverviewStats();

  const isFullyEmpty = !isLoading && stats && stats.totalOrders === 0 && stats.totalCustomers === 0;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-display font-semibold text-ink-primary">
          {t('sales.overview.pageTitle')}
        </h1>
        <button
          onClick={() => navigate('sales-orders/create')}
          className="bg-signal hover:bg-signal-hover text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
        >
          {t('sales.overview.newOrder')}
        </button>
      </div>

      <SalesCategoryNav />

      {isError ? (
        <div className="bg-panel border border-error/30 rounded-lg p-6 text-center">
          <p className="text-sm text-error mb-3">{t('sales.overview.errorTitle')}</p>
          <button onClick={refetch} className="text-sm font-medium text-signal hover:text-signal-hover">
            {t('sales.overview.retry')}
          </button>
        </div>
      ) : isFullyEmpty ? (
        <EmptyState
          title={t('sales.overview.emptyTitle')}
          description={t('sales.overview.emptyDescription')}
          action={{ label: t('sales.overview.newOrder'), onClick: () => navigate('/sales/sales-orders/create') }}
        />
      ) : (
        <div className="space-y-6">
          <SalesKpiCards stats={stats} isLoading={isLoading} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <OrdersByStatusChart data={stats?.ordersByStatus} isLoading={isLoading} />
            <TopCustomersCard data={stats?.topCustomers} isLoading={isLoading} />
          </div>

          <RecentSalesOrdersList data={stats?.recentOrders} isLoading={isLoading} />

          <CustomersSnapshotCard stats={stats} isLoading={isLoading} />

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/sales/sales-orders/create')}
              className="text-sm font-medium px-4 py-2 rounded-md border border-hairline hover:border-signal/40 text-ink-primary transition-colors"
            >
              {t('sales.overview.quickActions.newOrder')}
            </button>
            <button
              onClick={() => navigate('/sales/customers')}
              className="text-sm font-medium px-4 py-2 rounded-md border border-hairline hover:border-signal/40 text-ink-primary transition-colors"
            >
              {t('sales.overview.quickActions.newCustomer')}
            </button>
            <button
              onClick={() => navigate('/sales/sales-orders')}
              className="text-sm font-medium px-4 py-2 rounded-md border border-hairline hover:border-signal/40 text-ink-primary transition-colors"
            >
              {t('sales.overview.quickActions.viewAllOrders')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
