import { useTranslation } from 'react-i18next';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts';

import { Skeleton } from '../../common/Skeleton';
import { EmptyState } from '../../common/EmptyState';
import type { TopAccountBalance } from '../../../hooks/useAccountingOverviewStats';

interface Props {
  data: TopAccountBalance[] | undefined;
  isLoading: boolean;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 0,
  }).format(value);
}

export function TopAccountsByBalanceChart({
  data,
  isLoading,
}: Props) {
  const { t } = useTranslation();

  const chartData = (data ?? []).map((d) => ({
    ...d,
    label: `${d.code} · ${d.name}`,
  }));

  return (
    <div  className="bg-panel border border-hairline rounded-lg p-4 shadow-elevation-1">
      <h3 className="text-sm font-medium text-ink-primary mb-3">
        {t('accounting.overview.topAccounts.title')}
      </h3>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : chartData.length === 0 ? (
        <EmptyState
          title={t('accounting.overview.topAccounts.emptyTitle')}
          description={t(
            'accounting.overview.topAccounts.emptyDescription'
          )}
        />
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ left: 8, right: 16 }}
          >
            <CartesianGrid
              horizontal={false}
              stroke="var(--hairline)"
            />

            <XAxis
              type="number"
              tickFormatter={(value) => {
                const numericValue =
                  typeof value === 'number'
                    ? value
                    : Number(value ?? 0);

                return formatCurrency(numericValue);
              }}
              tick={{
                fontSize: 11,
                fill: 'var(--ink-tertiary)',
              }}
            />

            <YAxis
              direction={"ltr"}
              type="category"
              dataKey="label"
              width={140}
              tick={{
                fontSize: 11,
                fill: 'var(--ink-secondary)',
              }}
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
                const numericValue =
                  typeof value === 'number'
                    ? value
                    : Number(value ?? 0);

                return [
                  formatCurrency(numericValue),
                  t(
                    'accounting.overview.topAccounts.balanceLabel'
                  ),
                ];
              }}
            />

            <Bar
              dataKey="balance"
              radius={[0, 4, 4, 0]}
            >
              {chartData.map((entry) => (
                <Cell
                  key={entry.accountId}
                  fill={
                    entry.balance >= 0
                      ? 'var(--signal)'
                      : 'var(--error)'
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}