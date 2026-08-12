// Intended path: src/components/admin/sales/CustomersSnapshotCard.tsx

import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Skeleton } from '../../common/Skeleton';
import type { SalesOverviewStats } from '../../../hooks/useSalesOverviewStats';

interface Props {
  stats: SalesOverviewStats | null;
  isLoading: boolean;
}

export function CustomersSnapshotCard({ stats, isLoading }: Props) {
  const { t } = useTranslation();
  const inactiveCustomers = stats ? stats.totalCustomers - stats.activeCustomers : 0;

  return (
    <div className="bg-panel border border-hairline rounded-lg p-4 shadow-elevation-1">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-ink-primary">
          {t('sales.overview.customersSnapshot.title')}
        </h3>
        {/*
          FLAG: this links to /customers, which is not yet a built module in
          this project — Customers has so far only existed as a lookup for
          the Sales Order line-item picker (customers.lookup.api.ts), not as
          a full List/Create/Edit module. This link (and the "New Customer"
          quick action on the page) will 404 until a Customers module is
          built. Left in per the spec's design intent, but flagged rather
          than silently working around it — a Customers Management module
          is the natural next build after this one.
        */}
        <Link to="/sales/customers" className="text-xs font-medium text-signal hover:text-signal-hover">
          {t('sales.overview.customersSnapshot.manage')}
        </Link>
      </div>
      {isLoading ? (
        <Skeleton className="h-16 w-full" />
      ) : (
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-lg font-semibold text-ink-primary">{stats?.totalCustomers ?? 0}</p>
            <p className="text-xs text-ink-tertiary">{t('sales.overview.customersSnapshot.total')}</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-success">{stats?.activeCustomers ?? 0}</p>
            <p className="text-xs text-ink-tertiary">{t('sales.overview.customersSnapshot.active')}</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-ink-tertiary">{inactiveCustomers}</p>
            <p className="text-xs text-ink-tertiary">{t('sales.overview.customersSnapshot.inactive')}</p>
          </div>
        </div>
      )}
    </div>
  );
}
