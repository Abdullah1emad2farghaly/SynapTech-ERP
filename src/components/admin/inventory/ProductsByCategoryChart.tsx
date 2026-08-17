// Intended path: src/components/admin/inventory/ProductsByCategoryChart.tsx
// New. Real distribution — every ProductResponse has a categoryId (nullable),
// grouped against Categories' names by useInventoryOverviewStats, with an
// explicit Uncategorized bucket for null rather than hiding those products.

import { useTranslation } from 'react-i18next';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Skeleton } from '../../common/Skeleton';
import { EmptyState } from '../../common/EmptyState';
import type { CategoryProductCount } from '../../../hooks/useInventoryOverviewStats';

// Cycles through existing chart-safe design tokens rather than introducing
// a new palette — same "existing tokens only" rule applied to the Sales/
// Purchasing status donuts.
const PALETTE = [
  'var(--signal)',
  'var(--synapse)',
  'var(--success)',
  'var(--warning)',
  'var(--error)',
  'var(--ink-tertiary)',
];

interface Props {
  data: CategoryProductCount[] | undefined;
  isLoading: boolean;
}

export function ProductsByCategoryChart({ data, isLoading }: Props) {
  const { t } = useTranslation();

  const resolved = (data ?? []).map(d => ({
    ...d,
    label:
      d.categoryName === '__uncategorized__'
        ? t('inventory.overview.productsByCategory.uncategorized')
        : d.categoryName,
  }));

  return (
    <div className="bg-panel border border-hairline rounded-lg p-4 shadow-elevation-1">
      <h3 className="text-sm font-medium text-ink-primary mb-3">
        {t('inventory.overview.productsByCategory.title')}
      </h3>
      {isLoading ? (
        <Skeleton className="h-56 w-full" />
      ) : resolved.length === 0 ? (
        <EmptyState
          title={t('inventory.overview.productsByCategory.emptyTitle')}
          description={t('inventory.overview.productsByCategory.emptyDescription')}
        />
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie data={resolved} dataKey="productCount" nameKey="label" innerRadius={60} outerRadius={90} paddingAngle={2}>
              {resolved.map((entry, i) => (
                <Cell key={entry.categoryId ?? 'uncategorized'} fill={PALETTE[i % PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{
              backgroundColor: 'rgb(var(--color-panel))',
              border: '1px solid rgb(var(--color-hairline))',
              borderRadius: '8px',
              boxShadow: 'var(--shadow-elevation-1)',
              color: 'rgb(var(--color-ink-primary))',
            }}
              labelStyle={{
                color: 'rgb(var(--color-ink-primary))',
                fontWeight: 500,
                marginBottom: '4px',
              }}
              itemStyle={{
                color: 'rgb(var(--color-ink-secondary))',
              }}
              cursor={{
                stroke: 'rgb(var(--color-hairline))',
              }} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
