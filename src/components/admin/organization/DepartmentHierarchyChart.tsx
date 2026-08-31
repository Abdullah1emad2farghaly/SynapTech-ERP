// Intended path: src/components/admin/organization/DepartmentHierarchyChart.tsx
// Real structural distribution — every DepartmentResponse has a nullable
// parentDepartmentId, so "top-level vs nested" is directly determinable,
// not inferred or guessed.

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
import type { GroupCount } from '../../../hooks/useOrganizationOverviewStats';

const COLOR_VAR: Record<string, string> = {
  topLevel: 'var(--signal)',
  nested: 'var(--synapse)',
};

interface Props {
  data: GroupCount[] | undefined;
  isLoading: boolean;
}

export function DepartmentHierarchyChart({
  data,
  isLoading,
}: Props) {
  const { t } = useTranslation();

  return (
    <div className="bg-panel border border-hairline rounded-lg p-4 shadow-elevation-1">
      <h3 className="text-sm font-medium text-ink-primary mb-3">
        {t('organization.overview.departmentHierarchy.title')}
      </h3>

      {isLoading ? (
        <Skeleton className="h-56 w-full" />
      ) : !data || data.length === 0 ? (
        <EmptyState
          title={t(
            'organization.overview.departmentHierarchy.emptyTitle'
          )}
          description={t(
            'organization.overview.departmentHierarchy.emptyDescription'
          )}
        />
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="label"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={2}
            >
              {data.map((entry) => (
                <Cell
                  key={entry.key}
                  fill={
                    COLOR_VAR[entry.key] ??
                    'var(--ink-tertiary)'
                  }
                />
              ))}
            </Pie>

            <Tooltip
              formatter={(value, name) => {
                const label =
                  typeof name === 'string'
                    ? name
                    : String(name ?? '');

                return [
                  value,
                  t(
                    `organization.overview.hierarchy.${label}`,
                    label
                  ),
                ];
              }}
            />

            <Legend
              formatter={(value) => {
                const label = String(value ?? '');

                return t(
                  `organization.overview.hierarchy.${label}`,
                  label
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}