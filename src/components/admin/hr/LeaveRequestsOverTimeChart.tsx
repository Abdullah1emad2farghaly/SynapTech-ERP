// Intended path: src/components/admin/hr/LeaveRequestsOverTimeChart.tsx
// Real trend, bucketed by month from LeaveRequestResponse.startDate — same
// "actual counts, no invented deltas" treatment as the other trend charts
// in this series.

import { useTranslation } from 'react-i18next';
import {
  LineChart,
  Line,
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

export function LeaveRequestsOverTimeChart({
  data,
  isLoading,
}: Props) {
  const { t } = useTranslation();

  return (
    <div className="bg-panel border border-hairline rounded-lg p-4 shadow-elevation-1">
      <h3 className="text-sm font-medium text-ink-primary mb-3">
        {t('hr.overview.leaveOverTime.title')}
      </h3>

      {isLoading ? (
        <Skeleton className="h-56 w-full" />
      ) : !data || data.length === 0 ? (
        <EmptyState
          title={t('hr.overview.leaveOverTime.emptyTitle')}
          description={t(
            'hr.overview.leaveOverTime.emptyDescription'
          )}
        />
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <LineChart
            data={data}
            margin={{ top: 8, right: 8 }}
          >
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
                t('hr.overview.leaveOverTime.countLabel'),
              ]}
            />

            <Line
              type="monotone"
              dataKey="count"
              stroke="var(--synapse)"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}