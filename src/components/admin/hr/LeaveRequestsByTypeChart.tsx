// Intended path: src/components/admin/hr/LeaveRequestsByTypeChart.tsx
// Real distribution — every LeaveRequestResponse has a leaveType field.
// leaveType has no confirmed backend enum. Translated directly against the
// existing leaveRequests.types.<value> namespace, no local map/new file —
// unrecognized values fall back to the raw string via i18next's defaultValue.

import { useMemo } from 'react';
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

export function LeaveRequestsByTypeChart({ data, isLoading }: Props) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';

  const chartData = useMemo(() => {
    if (!data) return [];
    const translated = data.map(d => ({
      ...d,
      label: t(`leaveRequests.types.${d.label.toLocaleLowerCase()}`, { defaultValue: d.label }),
    }
    
  ));
  
    return isRtl ? [...translated].reverse() : translated;
  }, [data, t, isRtl]);

  return (
    <div className="bg-panel border border-hairline rounded-lg p-4 shadow-elevation-1">
      <h3 className="text-sm font-medium text-ink-primary mb-3">
        {t('hr.overview.leaveByType.title')}
      </h3>

      {isLoading ? (
        <Skeleton className="h-56 w-full" />
      ) : !data || data.length === 0 ? (
        <EmptyState
          title={t('hr.overview.leaveByType.emptyTitle')}
          description={t('hr.overview.leaveByType.emptyDescription')}
        />
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData} margin={{ top: 8, right: 8 }}>
            <CartesianGrid vertical={false} stroke="var(--hairline)" />

            <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--ink-tertiary)' }} />

            {/* Numbers always stay LTR regardless of locale */}
            <YAxis
              direction="ltr"
              allowDecimals={false}
              tick={{ fontSize: 12, fill: 'var(--ink-tertiary)' }}
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
              itemStyle={{ color: 'rgb(var(--color-ink-secondary))' }}
              cursor={{ stroke: 'rgb(var(--color-hairline))' }}
              formatter={value => [
                typeof value === 'number' ? value : Number(value ?? 0),
                t('hr.overview.leaveByType.countLabel'),
              ]}
            />

            <Bar dataKey="count" fill="var(--synapse)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}