// Intended path: src/components/admin/inventory/OutOfStockProductsCard.tsx
// New. Deliberately "out of stock" (quantity === 0), never "low stock" —
// there is no reorder-point/minimum-stock field anywhere on
// ProductResponse, so any non-zero threshold would be invented data. Zero
// is the one line that's actually determinable as-is. Mirrors the
// above-the-fold alert treatment already used for Purchasing Overview's
// OverdueOrdersCard — shown only when non-empty.

import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { Skeleton } from '../../common/Skeleton';
import type { OutOfStockProduct } from '../../../hooks/useInventoryOverviewStats';

interface Props {
  data: OutOfStockProduct[] | undefined;
  totalCount: number | undefined;
  isLoading: boolean;
}

export function OutOfStockProductsCard({ data, totalCount, isLoading }: Props) {
  const { t } = useTranslation();
  const hasOutOfStock = (totalCount ?? 0) > 0;

  return (
    <div
      className={[
        'bg-panel border rounded-lg p-4 shadow-elevation-1',
        hasOutOfStock ? 'border-error/40' : 'border-hairline',
      ].join(' ')}
    >
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle size={16} className={hasOutOfStock ? 'text-error' : 'text-ink-tertiary'} />
        <h3 className="text-sm font-medium text-ink-primary">
          {t('inventory.overview.outOfStock.title')}
        </h3>
        {hasOutOfStock && (
          <span className="ms-auto text-xs font-medium px-2 py-0.5 rounded-full bg-error/15 text-error">
            {t('inventory.overview.outOfStock.badge', { count: totalCount })}
          </span>
        )}
      </div>
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : !hasOutOfStock ? (
        <p className="text-sm text-ink-tertiary">{t('inventory.overview.outOfStock.emptyDescription')}</p>
      ) : (
        <>
          <ul className="space-y-2">
            {(data ?? []).map(product => (
              <li key={product.productId} className="flex items-center justify-between py-1">
                <span className="text-sm text-ink-primary truncate">{product.productName}</span>
                <span className="font-mono text-xs text-ink-tertiary shrink-0 ms-2">{product.productSku}</span>
              </li>
            ))}
          </ul>
          {(totalCount ?? 0) > (data?.length ?? 0) && (
            <Link to="products" className="text-xs font-medium text-signal hover:text-signal-hover mt-2 inline-block">
              {t('inventory.overview.outOfStock.viewAll', { count: totalCount })}
            </Link>
          )}
        </>
      )}
    </div>
  );
}
