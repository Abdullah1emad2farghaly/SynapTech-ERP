import { useTranslation } from 'react-i18next';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

import { Skeleton } from '../../common/Skeleton';
import { EmptyState } from '../../common/EmptyState';
import type { AccountTypeCount } from '../../../hooks/useAccountingOverviewStats';

interface Props {
  data: AccountTypeCount[] | undefined;
  isLoading: boolean;
}

export function AccountsByTypeBarChart({
  data,
  isLoading,
}: Props) {
  const { t } = useTranslation();

  return (
    <div className="bg-panel border border-hairline rounded-lg p-4 shadow-elevation-1">
      <h3 className="text-sm font-medium text-ink-primary mb-3">
        {t('accounting.overview.accountsByType.title')}
      </h3>

      {isLoading ? (
        <Skeleton className="h-56 w-full" />
      ) : !data || data.length === 0 ? (
        <EmptyState
          title={t('accounting.overview.accountsByType.emptyTitle')}
          description={t(
            'accounting.overview.accountsByType.emptyDescription'
          )}
        />
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart
            data={data}
            margin={{ top: 8, right: 8 }}
          >
            <CartesianGrid
              vertical={false}
              stroke="var(--hairline)"
            />

            <XAxis
              dataKey="accountType"
              tick={{
                fontSize: 11,
                fill: 'var(--ink-tertiary)',
              }}
            />

            <YAxis
              direction={"ltr"}
              tick={{
                fontSize: 12,
                fill: 'var(--ink-tertiary)',
              }}
              allowDecimals={false}
            />

            <Tooltip
              contentStyle={{
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
              }}
              formatter={(value) => {
                const count =
                  typeof value === 'number'
                    ? value
                    : Number(value ?? 0);

                return [
                  count,
                  t(
                    'accounting.overview.accountsByType.countLabel'
                  ),
                ];
              }}
            />

            <Bar
              dataKey="count"
              fill="var(--signal)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}