// Intended path: src/components/admin/organization/DepartmentsByBranchChart.tsx
// Real distribution — every DepartmentResponse has a (nullable) branchId,
// resolved against Branches (Module 3), with an explicit Unassigned bucket.

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
import type { GroupCount } from '../../../hooks/useOrganizationOverviewStats';

interface Props {
  data: GroupCount[] | undefined;
  isLoading: boolean;
}

export function DepartmentsByBranchChart({
  data,
  isLoading,
}: Props) {
  const { t } = useTranslation();

  const resolved = (data ?? []).map((d) => ({
    ...d,
    label:
      d.label === '__unassigned__'
        ? t('organization.overview.unassigned')
        : d.label,
  }));

  return (
    <div className="bg-panel border border-hairline rounded-lg p-4 shadow-elevation-1">
      <h3 className="text-sm font-medium text-ink-primary mb-3">
        {t(
          'organization.overview.departmentsByBranch.title'
        )}
      </h3>

      {isLoading ? (
        <Skeleton className="h-56 w-full" />
      ) : resolved.length === 0 ? (
        <EmptyState
          title={t(
            'organization.overview.departmentsByBranch.emptyTitle'
          )}
          description={t(
            'organization.overview.departmentsByBranch.emptyDescription'
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
              formatter={(value) => [
                value,
                t(
                  'organization.overview.departmentsByBranch.countLabel'
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