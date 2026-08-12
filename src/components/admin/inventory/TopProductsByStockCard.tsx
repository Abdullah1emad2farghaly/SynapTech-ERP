// Intended path: src/components/admin/inventory/TopProductsByStockCard.tsx
// Same ranked-list pattern as TopCustomersCard/TopSuppliersCard, but ranked
// by unit quantity (from the stock aggregation) rather than currency value.

import { useTranslation } from 'react-i18next';
import { Skeleton } from '../../common/Skeleton';
import { EmptyState } from '../../common/EmptyState';
import type { TopStockProduct } from '../../../hooks/useInventoryOverviewStats';

interface Props {
  data: TopStockProduct[] | undefined;
  isLoading: boolean;
}

export function TopProductsByStockCard({ data, isLoading }: Props) {
  const { t } = useTranslation();
  const maxValue = data && data.length > 0 ? data[0].totalUnits : 0;

  return (
    <div className="bg-panel border border-hairline rounded-lg p-4 shadow-elevation-1">
      <h3 className="text-sm font-medium text-ink-primary mb-3">
        {t('inventory.overview.topProductsByStock.title')}
      </h3>
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <EmptyState
          title={t('inventory.overview.topProductsByStock.emptyTitle')}
          description={t('inventory.overview.topProductsByStock.emptyDescription')}
        />
      ) : (
        <ul className="space-y-3">
          {data.map(product => (
            <li key={product.productId}>
              <div className="flex items-center justify-between text-sm">
                <div className="min-w-0">
                  <span className="font-medium text-ink-primary">{product.productName}</span>
                  <span className="ms-2 font-mono text-xs text-ink-tertiary">{product.productSku}</span>
                </div>
                <span className="text-ink-secondary whitespace-nowrap">
                  {t('inventory.overview.topProductsByStock.units', { count: product.totalUnits })}
                </span>
              </div>
              <div className="h-1.5 bg-sunken rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-signal rounded-full"
                  style={{ width: `${maxValue > 0 ? (product.totalUnits / maxValue) * 100 : 0}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
