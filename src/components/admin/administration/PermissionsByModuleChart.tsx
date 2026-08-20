// Intended path: src/components/admin/administration/PermissionsByModuleChart.tsx
// The one chart on this page sourced from the permissions CATALOG
// (GET /api/Roles/permissions-catalog) rather than from Users or Roles
// themselves — a "what can this system do" view rather than a "who has
// what" view. Real distribution: every PermissionResponse has a module field.

import { useTranslation } from 'react-i18next';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Skeleton } from '../../common/Skeleton';
import { EmptyState } from '../../common/EmptyState';
import type { GroupCount } from '../../../hooks/useAdministrationOverviewStats';

const PALETTE = ['var(--signal)', 'var(--synapse)', 'var(--success)', 'var(--warning)', 'var(--error)', 'var(--ink-tertiary)'];

interface Props {
  data: GroupCount[] | undefined;
  isLoading: boolean;
  isError: boolean;
}

export function PermissionsByModuleChart({ data, isLoading, isError }: Props) {
  const { t } = useTranslation();

  return (
    <div className="bg-panel border border-hairline rounded-lg p-4 shadow-elevation-1">
      <h3 className="text-sm font-medium text-ink-primary mb-3">
        {t('administration.overview.permissionsByModule.title')}
      </h3>
      {isLoading ? (
        <Skeleton className="h-56 w-full" />
      ) : isError || !data || data.length === 0 ? (
        <EmptyState
          title={t('administration.overview.permissionsByModule.emptyTitle')}
          description={
            isError
              ? t('administration.overview.permissionsByModule.errorDescription')
              : t('administration.overview.permissionsByModule.emptyDescription')
          }
        />
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie data={data} dataKey="count" nameKey="label" innerRadius={60} outerRadius={90} paddingAngle={2}>
              {data.map((entry, i) => (
                <Cell key={entry.key} fill={PALETTE[i % PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{
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
              }} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
