// Intended path: src/components/admin/purchasing/RecentPurchaseOrdersList.tsx
// Mirrors Sales Overview's RecentSalesOrdersList exactly, for purchase orders.

import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Skeleton } from '../../common/Skeleton';
import { EmptyState } from '../../common/EmptyState';
// ASSUMPTION: path/name of the existing Purchase Orders status badge
// component — verify against the actual Purchase Orders module folder.
import { PurchaseOrderStatusBadge } from '../purchase-orders/PurchaseOrderStatusBadge';
import type { PurchaseOrderResponse } from '@/types/purchaseOrders.types';

interface Props {
  data: PurchaseOrderResponse[] | undefined;
  isLoading: boolean;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 0,
  }).format(value);
}

export function RecentPurchaseOrdersList({ data, isLoading }: Props) {
  const { t } = useTranslation();

  return (
    <div className="bg-panel border border-hairline rounded-lg p-4 shadow-elevation-1">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-ink-primary">
          {t('purchasing.overview.recentOrders.title')}
        </h3>
        <Link to="/purchase-orders" className="text-xs font-medium text-signal hover:text-signal-hover">
          {t('purchasing.overview.recentOrders.viewAll')}
        </Link>
      </div>
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <EmptyState
          title={t('purchasing.overview.recentOrders.emptyTitle')}
          description={t('purchasing.overview.recentOrders.emptyDescription')}
        />
      ) : (
        <ul className="divide-y divide-hairline">
          {data.map(order => (
            <li key={order.id}>
              <Link
                to={`purchase-orders/${order.id}`}
                className="flex items-center justify-between py-3 hover:bg-sunken/40 -mx-2 px-2 rounded-md transition-colors"
              >
                <div className="min-w-0">
                  <p className="font-mono text-sm text-ink-primary truncate">{order.orderNumber}</p>
                  <p className="text-xs text-ink-tertiary truncate">{order.supplierName}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <PurchaseOrderStatusBadge status={order.status} />
                  <span className="text-sm text-ink-secondary tabular-nums">
                    {formatCurrency(order.totalAmount)}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
