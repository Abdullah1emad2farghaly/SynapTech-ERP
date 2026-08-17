// Intended path: src/components/admin/hr/AttendanceByStatusChart.tsx
// ASSUMPTION (compounding two layers): status color mapping assumes
// Present/Absent/Late/HalfDay as the values (no confirmed enum — pure
// guess based on common HR conventions), stacked on top of
// attendance.api.ts's larger assumption that the unfiltered
// GET /api/Attendance call returns company-wide data at all. If that call
// doesn't behave as assumed, this chart will simply render its own empty
// state via isAttendanceError/no-data — it won't break the rest of the page.

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
  Present: 'var(--success)',
  Absent: 'var(--error)',
  Late: 'var(--warning)',
  HalfDay: 'var(--synapse)',
};

interface Props {
  data: GroupCount[] | undefined;
  isLoading: boolean;
  isError: boolean;
}

export function AttendanceByStatusChart({
  data,
  isLoading,
  isError,
}: Props) {
  const { t } = useTranslation();

  return (
    <div className="bg-panel border border-hairline rounded-lg p-4 shadow-elevation-1">
      <h3 className="text-sm font-medium text-ink-primary mb-3">
        {t('hr.overview.attendanceByStatus.title')}
      </h3>

      {isLoading ? (
        <Skeleton className="h-56 w-full" />
      ) : isError || !data || data.length === 0 ? (
        <EmptyState
          title={t('hr.overview.attendanceByStatus.emptyTitle')}
          description={
            isError
              ? t('hr.overview.attendanceByStatus.errorDescription')
              : t(
                'hr.overview.attendanceByStatus.emptyDescription'
              )
          }
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
                  typeof name === 'string'
                    ? name
                    : String(name ?? '');

                return [
                  numericValue,
                  t(
                    `attendance.status.${statusName}`,
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
                  `attendance.status.${statusName}`,
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