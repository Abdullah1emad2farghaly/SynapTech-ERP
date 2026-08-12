// Intended path: src/components/admin/purchasing/OverdueOrdersCard.tsx
// This has no equivalent on the Sales Overview — SalesOrderResponse has no
// date field to compare against "now" besides orderDate itself, so no real
// overdue/lateness concept exists there. Purchase Orders DO have
// expectedDate, which makes this a genuinely grounded, Purchasing-specific
// metric rather than a padded mirror of the Sales page.

import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Skeleton } from '../../common/Skeleton';
import type { OverdueOrder } from '../../../hooks/usePurchasingOverviewStats';

interface Props {
  data: OverdueOrder[] | undefined;
  isLoading: boolean;
}

export function OverdueOrdersCard({ data, isLoading }: Props) {
  const { t } = useTranslation();
  const hasOverdue = data && data.length > 0;

  return (
    <div
      className={[
        'bg-panel border rounded-lg p-4 shadow-elevation-1',
        hasOverdue ? 'border-warning/40' : 'border-hairline',
      ].join(' ')}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-ink-primary">
          {t('purchasing.overview.overdueOrders.title')}
        </h3>
        {hasOverdue && (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-warning/15 text-warning">
            {t('purchasing.overview.overdueOrders.badge', { count: data!.length })}
          </span>
        )}
      </div>
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : !hasOverdue ? (
        <p className="text-sm text-ink-tertiary">{t('purchasing.overview.overdueOrders.emptyDescription')}</p>
      ) : (
        <ul className="space-y-2">
          {data!.map(({ order, daysOverdue }) => (
            <li key={order.id}>
              <Link
                to={`purchase-orders/${order.id}`}
                className="flex items-center justify-between py-2 px-2 -mx-2 rounded-md hover:bg-sunken/40 transition-colors"
              >
                <div className="min-w-0">
                  <p className="font-mono text-sm text-ink-primary truncate">{order.orderNumber}</p>
                  <p className="text-xs text-ink-tertiary truncate">{order.supplierName}</p>
                </div>
                <span className="text-xs font-medium text-warning whitespace-nowrap">
                  {t('purchasing.overview.overdueOrders.daysOverdue', { count: daysOverdue })}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
