// Intended path: src/components/admin/hr/LeaveRequestsByStatusChart.tsx
// ASSUMPTION: status color mapping assumes Pending/Approved/Rejected/
// Cancelled as the values (inferred from the /approve, /reject, /cancel
// action endpoints existing) — not directly confirmed. Unmapped statuses
// fall back to ink-tertiary.

import { useTranslation } from 'react-i18next';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Skeleton } from '../../common/Skeleton';
import { EmptyState } from '../../common/EmptyState';
import type { GroupCount } from '../../../hooks/useHrOverviewStats';

const STATUS_COLOR_VAR: Record<string, string> = {
  Pending: 'var(--warning)',
  Approved: 'var(--success)',
  Rejected: 'var(--error)',
  Cancelled: 'var(--ink-tertiary)',
};

interface Props {
  data: GroupCount[] | undefined;
  isLoading: boolean;
}

export function LeaveRequestsByStatusChart({
  data,
  isLoading,
}: Props) {
  const { t } = useTranslation();

  return (
    <div className="bg-panel border border-hairline rounded-lg p-4 shadow-elevation-1">
      <h3 className="text-sm font-medium text-ink-primary mb-3">
        {t('hr.overview.leaveByStatus.title')}
      </h3>

      {isLoading ? (
        <Skeleton className="h-56 w-full" />
      ) : !data || data.length === 0 ? (
        <EmptyState
          title={t('hr.overview.leaveByStatus.emptyTitle')}
          description={t(
            'hr.overview.leaveByStatus.emptyDescription'
          )}
        />
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="label"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
            >
              {data.map((entry) => (
                <Cell
                  key={entry.key}
                  fill={
                    STATUS_COLOR_VAR[entry.key] ??
                    'var(--ink-tertiary)'
                  }
                />
              ))}
            </Pie>

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
              formatter={(value, name) => {
                const numericValue =
                  typeof value === 'number'
                    ? value
                    : Number(value ?? 0);

                const statusName =
                  typeof name === 'string' ? name : String(name ?? '');

                return [
                  numericValue,
                  t(
                    `leaveRequests.status.${statusName}`,
                    statusName
                  ),
                ];
              }}
            />

            <Legend
              formatter={(value) => {
                const statusName =
                  typeof value === 'string'
                    ? value
                    : String(value ?? '');

                return t(
                  `leaveRequests.status.${statusName}`,
                  statusName
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}