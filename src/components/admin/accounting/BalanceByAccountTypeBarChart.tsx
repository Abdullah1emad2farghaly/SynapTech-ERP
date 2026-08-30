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
import type { AccountTypeBalance } from '../../../hooks/useAccountingOverviewStats';

interface Props {
  data: AccountTypeBalance[] | undefined;
  isLoading: boolean;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 0,
  }).format(value);
}

export function BalanceByAccountTypeBarChart({
  data,
  isLoading,
}: Props) {
  const { t } = useTranslation();

  return (
    <div className="bg-panel border border-hairline rounded-lg p-4 shadow-elevation-1">
      <h3 className="text-sm font-medium text-ink-primary mb-3">
        {t('accounting.overview.balanceByType.title')}
      </h3>

      {isLoading ? (
        <Skeleton className="h-56 w-full" />
      ) : !data || data.length === 0 ? (
        <EmptyState
          title={t('accounting.overview.balanceByType.emptyTitle')}
          description={t(
            'accounting.overview.balanceByType.emptyDescription'
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
              tickFormatter={(value) => {
                const numericValue =
                  typeof value === 'number'
                    ? value
                    : Number(value ?? 0);

                return formatCurrency(numericValue);
              }}
              width={70}
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
                    'accounting.overview.balanceByType.netLabel'
                  ),
                ];
              }}
            />

            <Bar
              dataKey="netBalance"
              radius={[4, 4, 0, 0]}
            >
              {data.map((entry) => (
                <Cell
                  key={entry.accountType}
                  fill={
                    entry.netBalance >= 0
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
