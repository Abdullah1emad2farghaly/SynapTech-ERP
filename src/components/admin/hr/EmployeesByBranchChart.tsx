// Intended path: src/components/admin/hr/EmployeesByBranchChart.tsx
// Same pattern as EmployeesByDepartmentChart, grouped by branchId instead
// (Branches — Module 3, already built).

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
import type { GroupCount } from '../../../hooks/useHrOverviewStats';

interface Props {
  data: GroupCount[] | undefined;
  isLoading: boolean;
}

export function EmployeesByBranchChart({ data, isLoading }: Props) {
  const { t } = useTranslation();

  const resolved = (data ?? []).map((d) => ({
    ...d,
    label:
      d.label === '__unassigned__'
        ? t('hr.overview.unassigned')
        : d.label,
  }));

  return (
    <div className="bg-panel border border-hairline rounded-lg p-4 shadow-elevation-1">
      <h3 className="text-sm font-medium text-ink-primary mb-3">
        {t('hr.overview.employeesByBranch.title')}
      </h3>

      {isLoading ? (
        <Skeleton className="h-56 w-full" />
      ) : resolved.length === 0 ? (
        <EmptyState
          title={t('hr.overview.employeesByBranch.emptyTitle')}
          description={t(
            'hr.overview.employeesByBranch.emptyDescription'
          )}
        />
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart
            data={resolved}
            layout="vertical"
            margin={{ left: 8, right: 16 }}
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
              direction={"ltr"}
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
                t('hr.overview.employeesByBranch.countLabel'),
              ]}
            />

            <Bar
              dataKey="count"
              fill="var(--synapse)"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}