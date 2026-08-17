// Intended path: src/components/admin/accounting/JournalEntriesByStatusChart.tsx

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
import type { StatusCount } from '../../../hooks/useAccountingOverviewStats';

const STATUS_COLOR_VAR: Record<string, string> = {
  Draft: 'var(--ink-tertiary)',
  Posted: 'var(--success)',
  Reversed: 'var(--warning)',
};

interface Props {
  data: StatusCount[] | undefined;
  isLoading: boolean;
}

export function JournalEntriesByStatusChart({
  data,
  isLoading,
}: Props) {
  const { t } = useTranslation();

  return (
    <div className="bg-panel border border-hairline rounded-lg p-4 shadow-elevation-1">
      <h3 className="text-sm font-medium text-ink-primary mb-3">
        {t('accounting.overview.entriesByStatus.title')}
      </h3>

      {isLoading ? (
        <Skeleton className="h-56 w-full" />
      ) : !data || data.length === 0 ? (
        <EmptyState
          title={t('accounting.overview.entriesByStatus.emptyTitle')}
          description={t(
            'accounting.overview.entriesByStatus.emptyDescription'
          )}
        />
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="status"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
            >
              {data.map((entry) => (
                <Cell
                  key={entry.status}
                  fill={
                    STATUS_COLOR_VAR[entry.status] ??
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
                const status = String(name ?? '');
                const count =
                  typeof value === 'number'
                    ? value
                    : Number(value ?? 0);

                return [
                  count,
                  t(`journalEntries.status.${status}`, status),
                ];
              }}
            />

            <Legend
              formatter={(value) => {
                const status = String(value ?? '');

                return t(
                  `journalEntries.status.${status}`,
                  status
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}