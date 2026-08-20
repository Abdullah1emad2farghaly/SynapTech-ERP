// Intended path: src/components/admin/administration/UsersByDepartmentChart.tsx
//
// Same pattern as UsersByBranchChart — departmentName is already resolved
// server-side on UserResponse.

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
import type { GroupCount } from '../../../hooks/useAdministrationOverviewStats';

interface Props {
  data: GroupCount[] | undefined;
  isLoading: boolean;
}

export function UsersByDepartmentChart({
  data,
  isLoading,
}: Props) {
  const { t } = useTranslation();

  const resolved = (data ?? []).map((d) => ({
    ...d,
    label:
      d.label === '__unassigned__'
        ? t('administration.overview.unassigned')
        : d.label,
  }));

  return (
    <div className="bg-panel border border-hairline rounded-lg p-4 shadow-elevation-1">
      <h3 className="text-sm font-medium text-ink-primary mb-3">
        {t(
          'administration.overview.usersByDepartment.title'
        )}
      </h3>

      {isLoading ? (
        <Skeleton className="h-56 w-full" />
      ) : resolved.length === 0 ? (
        <EmptyState
          title={t(
            'administration.overview.usersByDepartment.emptyTitle'
          )}
          description={t(
            'administration.overview.usersByDepartment.emptyDescription'
          )}
        />
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart
            data={resolved}
            layout="vertical"
            margin={{
              left: 8,
              right: 16,
            }}
          >
            <CartesianGrid
              horizontal={false}
              stroke="var(--hairline)"
            />

            <XAxis
              type="number"
              allowDecimals={false}
              tick={{
                fontSize: 12,
                fill: 'var(--ink-tertiary)',
              }}
            />

            <YAxis
              type="category"
              dataKey="label"
              width={110}
              tick={{
                fontSize: 12,
                fill: 'var(--ink-secondary)',
              }}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--panel)',
                border: '1px solid var(--hairline)',
                borderRadius: '8px',
                boxShadow: 'var(--shadow-elevation-1)',
                color: 'var(--ink-primary)',
              }}
              labelStyle={{
                color: 'var(--ink-primary)',
                fontWeight: 500,
                marginBottom: '4px',
              }}
              itemStyle={{
                color: 'var(--ink-secondary)',
              }}
              cursor={{
                stroke: 'var(--hairline)',
              }}
              formatter={(value) => [
                value,
                t(
                  'administration.overview.usersByDepartment.countLabel'
                ),
              ]}
            />

            <Bar
              dataKey="count"
              fill="var(--signal)"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}