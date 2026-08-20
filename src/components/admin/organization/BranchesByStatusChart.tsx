// Intended path: src/components/admin/organization/BranchesByStatusChart.tsx

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
  active: 'var(--success)',
  inactive: 'var(--ink-tertiary)',
};

interface Props {
  data: GroupCount[] | undefined;
  isLoading: boolean;
}

export function BranchesByStatusChart({ data, isLoading }: Props) {
  const { t } = useTranslation();

  return (
    <div className="bg-panel border border-hairline rounded-lg p-4 shadow-elevation-1">
      <h3 className="text-sm font-medium text-ink-primary mb-3">
        {t('organization.overview.branchesByStatus.title')}
      </h3>

      {isLoading ? (
        <Skeleton className="h-56 w-full" />
      ) : !data || data.length === 0 ? (
        <EmptyState
          title={t('organization.overview.branchesByStatus.emptyTitle')}
          description={t(
            'organization.overview.branchesByStatus.emptyDescription'
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
                    COLOR_VAR[entry.key] ?? 'var(--ink-tertiary)'
                  }
                />
              ))}
            </Pie>

            <Tooltip
              formatter={(value, name) => {
                const label =
                  typeof name === 'string' ? name : String(name ?? '');

                return [
                  value,
                  t(
                    `organization.overview.status.${label}`,
                    label
                  ),
                ];
              }}
            />

            <Legend
              formatter={(value) => {
                const label = String(value ?? '');

                return t(
                  `organization.overview.status.${label}`,
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