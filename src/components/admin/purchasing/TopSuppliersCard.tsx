// Intended path: src/components/admin/purchasing/TopSuppliersCard.tsx
// Mirrors Sales Overview's TopCustomersCard exactly, for suppliers.

import { useTranslation } from 'react-i18next';
import { Skeleton } from '../../common/Skeleton';
import { EmptyState } from '../../common/EmptyState';
import type { TopSupplier } from '../../../hooks/usePurchasingOverviewStats';

interface Props {
  data: TopSupplier[] | undefined;
  isLoading: boolean;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 0,
  }).format(value);
}

export function TopSuppliersCard({ data, isLoading }: Props) {
  const { t } = useTranslation();
  const maxValue = data && data.length > 0 ? data[0].totalValue : 0;

  return (
    <div className="bg-panel border border-hairline rounded-lg p-4 shadow-elevation-1">
      <h3 className="text-sm font-medium text-ink-primary mb-3">
        {t('purchasing.overview.topSuppliers.title')}
      </h3>
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <EmptyState
          title={t('purchasing.overview.topSuppliers.emptyTitle')}
          description={t('purchasing.overview.topSuppliers.emptyDescription')}
        />
      ) : (
        <ul className="space-y-3">
          {data.map(supplier => (
            <li key={supplier.supplierId}>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-ink-primary">{supplier.supplierName}</span>
                <span className="text-ink-secondary">{formatCurrency(supplier.totalValue)}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-1.5 bg-sunken rounded-full overflow-hidden">
                  <div
                    className="h-full bg-signal rounded-full"
                    style={{ width: `${maxValue > 0 ? (supplier.totalValue / maxValue) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-xs text-ink-tertiary whitespace-nowrap">
                  {t('purchasing.overview.topSuppliers.orderCount', { count: supplier.orderCount })}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
