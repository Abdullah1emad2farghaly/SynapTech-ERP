// Intended path: src/components/admin/hr/HeadcountGrowthChart.tsx
// Real cumulative trend from hireDate — same category as Accounting's
// entriesOverTime: an actual running total of employees hired-to-date,
// bucketed by month from data already fetched, not projected or
// extrapolated.

import { useTranslation } from 'react-i18next';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { Skeleton } from '../../common/Skeleton';
import { EmptyState } from '../../common/EmptyState';
import type { MonthlyCount } from '../../../hooks/useHrOverviewStats';

interface Props {
  data: MonthlyCount[] | undefined;
  isLoading: boolean;
}

export function HeadcountGrowthChart({ data, isLoading }: Props) {
  const { t } = useTranslation();

  return (
    <div className="bg-panel border border-hairline rounded-lg p-4 shadow-elevation-1">
      <h3 className="text-sm font-medium text-ink-primary mb-3">
        {t('hr.overview.headcountGrowth.title')}
      </h3>

      {isLoading ? (
        <Skeleton className="h-56 w-full" />
      ) : !data || data.length === 0 ? (
        <EmptyState
          title={t('hr.overview.headcountGrowth.emptyTitle')}
          description={t(
            'hr.overview.headcountGrowth.emptyDescription'
          )}
        />
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart
            data={data}
            margin={{ top: 8, right: 8 }}
          >
            <defs>
              <linearGradient
                id="headcountFill"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="var(--signal)"
                  stopOpacity={0.35}
                />
                <stop
                  offset="100%"
                  stopColor="var(--signal)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              vertical={false}
              stroke="var(--hairline)"
            />

            <XAxis
              dataKey="monthLabel"
              tick={{
                fontSize: 11,
                fill: 'var(--ink-tertiary)',
              }}
            />

            <YAxis
              allowDecimals={false}
              tick={{
                fontSize: 12,
                fill: 'var(--ink-tertiary)',
              }}
              width={32}
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
              formatter={(value) => [
                typeof value === 'number'
                  ? value
                  : Number(value ?? 0),
                t('hr.overview.headcountGrowth.countLabel'),
              ]}
            />

            <Area
              type="monotone"
              dataKey="count"
              stroke="var(--signal)"
              strokeWidth={2}
              fill="url(#headcountFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}