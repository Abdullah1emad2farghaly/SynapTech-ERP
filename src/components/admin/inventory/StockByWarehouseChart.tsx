// Intended path: src/components/admin/inventory/StockByWarehouseChart.tsx
// Real distribution, but sourced from the N+1-by-warehouse fetch in
// useInventoryOverviewStats — see that file's header comment. Renders its
// own independent loading state (isStockLoading) rather than being gated by
// the page's main isLoading, since it's the slowest query on this page.

import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Skeleton } from '../../common/Skeleton';
import { EmptyState } from '../../common/EmptyState';
import type { WarehouseStockTotal } from '../../../hooks/useInventoryOverviewStats';

interface Props {
  data: WarehouseStockTotal[] | undefined;
  isLoading: boolean;
}

export function StockByWarehouseChart({ data, isLoading }: Props) {
  const { t } = useTranslation();

  return (
    <div className="bg-panel border border-hairline rounded-lg p-4 shadow-elevation-1">
      <h3 className="text-sm font-medium text-ink-primary mb-3">
        {t('inventory.overview.stockByWarehouse.title')}
      </h3>
      {isLoading ? (
        <Skeleton className="h-56 w-full" />
      ) : !data || data.length === 0 ? (
        <EmptyState
          title={t('inventory.overview.stockByWarehouse.emptyTitle')}
          description={t('inventory.overview.stockByWarehouse.emptyDescription')}
        />
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
            <CartesianGrid horizontal={false} stroke="var(--hairline)" />
            <XAxis type="number" tick={{ fontSize: 12, fill: 'var(--ink-tertiary)' }} />
            <YAxis
              type="category"
              dataKey="warehouseName"
              width={100}
              tick={{ fontSize: 12, fill: 'var(--ink-secondary)' }}
            />
            <Tooltip formatter={(value) => [ Number(value ?? 0), t('inventory.overview.stockByWarehouse.unitsLabel'), ]} />
            <Bar dataKey="totalUnits" fill="var(--signal)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
