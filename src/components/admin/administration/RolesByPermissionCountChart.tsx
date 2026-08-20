// Intended path: src/components/admin/administration/RolesByPermissionCountChart.tsx
//
// A real bar chart (not the div-progress-bar list style) ranking every
// role by how many permissions it holds — RoleResponse.permissions[].length,
// directly counted, no invented "power score" or weighting.

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
import type { RolePermissionCount } from '../../../hooks/useAdministrationOverviewStats';

interface Props {
  data: RolePermissionCount[] | undefined;
  isLoading: boolean;
}

export function RolesByPermissionCountChart({
  data,
  isLoading,
}: Props) {
  const { t } = useTranslation();

  return (
    <div className="bg-panel border border-hairline rounded-lg p-4 shadow-elevation-1">
      <h3 className="text-sm font-medium text-ink-primary mb-3">
        {t(
          'administration.overview.rolesByPermissionCount.title'
        )}
      </h3>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : !data || data.length === 0 ? (
        <EmptyState
          title={t(
            'administration.overview.rolesByPermissionCount.emptyTitle'
          )}
          description={t(
            'administration.overview.rolesByPermissionCount.emptyDescription'
          )}
        />
      ) : (
        <ResponsiveContainer
          width="100%"
          height={Math.max(220, data.length * 32)}
        >
          <BarChart
            data={data}
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
              dataKey="roleName"
              width={120}
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
                  'administration.overview.rolesByPermissionCount.countLabel'
                ),
              ]}
            />

            <Bar
              dataKey="permissionCount"
              fill="var(--synapse)"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}