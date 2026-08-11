// Intended path: src/components/admin/sales/TopCustomersCard.tsx

import { useTranslation } from 'react-i18next';
import { Skeleton } from '../../common/Skeleton';
import { EmptyState } from '../../common/EmptyState';
import type { TopCustomer } from '../../../hooks/useSalesOverviewStats';

interface Props {
  data: TopCustomer[] | undefined;
  isLoading: boolean;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 0,
  }).format(value);
}

export function TopCustomersCard({ data, isLoading }: Props) {
  const { t } = useTranslation();
  const maxValue = data && data.length > 0 ? data[0].totalValue : 0;

  return (
    <div className="bg-panel border border-hairline rounded-lg p-4 shadow-elevation-1">
      <h3 className="text-sm font-medium text-ink-primary mb-3">
        {t('sales.overview.topCustomers.title')}
      </h3>
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <EmptyState
          title={t('sales.overview.topCustomers.emptyTitle')}
          description={t('sales.overview.topCustomers.emptyDescription')}
        />
      ) : (
        <ul className="space-y-3">
          {data.map(customer => (
            <li key={customer.customerId}>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-ink-primary">{customer.customerName}</span>
                <span className="text-ink-secondary">{formatCurrency(customer.totalValue)}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-1.5 bg-sunken rounded-full overflow-hidden">
                  <div
                    className="h-full bg-signal rounded-full"
                    style={{ width: `${maxValue > 0 ? (customer.totalValue / maxValue) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-xs text-ink-tertiary whitespace-nowrap">
                  {t('sales.overview.topCustomers.orderCount', { count: customer.orderCount })}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
