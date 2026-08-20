// Intended path: src/components/admin/organization/DepartmentsTreemapChart.tsx
//
// This is the compensating "more detailed chart" for Organization's one
// real limitation: NEITHER Branches NOR Departments NOR Companies has any
// date/createdAt field, so unlike Sales/Purchasing/HR/Accounting, no
// trend/line chart is possible anywhere in this domain (see
// useOrganizationOverviewStats.ts's header comment).
//
// A treemap of the same departments-per-branch data already shown as a bar
// chart gives a second, genuinely different way to read the org structure
// (proportional area instead of length) — a new chart TYPE for this series,
// not just a re-skin, without inventing any data to fill the gap.

import { useTranslation } from 'react-i18next';
import {
  Treemap as RechartsTreemap,
  ResponsiveContainer,
} from 'recharts';
import type { ReactElement } from 'react';
import { Skeleton } from '../../common/Skeleton';
import { EmptyState } from '../../common/EmptyState';
import type { TreemapNode } from '../../../hooks/useOrganizationOverviewStats';

const PALETTE = [
  'var(--signal)',
  'var(--synapse)',
  'var(--success)',
  'var(--warning)',
  'var(--error)',
  'var(--ink-tertiary)',
];

interface Props {
  data: TreemapNode[] | undefined;
  isLoading: boolean;
}

interface CustomCellProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  index?: number;
  name?: string;
  value?: number;
}

interface TreemapProps {
  data: TreemapNode[];
  dataKey: string;
  nameKey: string;
  content: ReactElement;
  isAnimationActive?: boolean;
}

/**
 * The installed Recharts Treemap declaration in this project is incorrect:
 *
 *   Treemap(outsideProps: TreemapNode[]): React.JSX.Element
 *
 * The actual runtime component accepts a props object.
 *
 * This wrapper restores the correct props typing locally without changing
 * the runtime behavior of Recharts.
 */
const TypedTreemap = RechartsTreemap as unknown as (
  props: TreemapProps
) => ReactElement;

function CustomCell({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  index = 0,
  name = '',
  value = 0,
}: CustomCellProps) {
  const fill = PALETTE[index % PALETTE.length];

  const showLabel = width > 50 && height > 28;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill}
        fillOpacity={0.85}
        stroke="var(--panel)"
        strokeWidth={2}
        rx={4}
      />

      {showLabel && (
        <>
          <text
            x={x + 8}
            y={y + 18}
            fontSize={11}
            fill="white"
            fontWeight={500}
          >
            {name}
          </text>

          <text
            x={x + 8}
            y={y + 34}
            fontSize={10}
            fill="white"
            opacity={0.8}
          >
            {value}
          </text>
        </>
      )}
    </g>
  );
}

export function DepartmentsTreemapChart({
  data,
  isLoading,
}: Props) {
  const { t } = useTranslation();

  return (
    <div className="bg-panel border border-hairline rounded-lg p-4 shadow-elevation-1">
      <h3 className="text-sm font-medium text-ink-primary mb-3">
        {t('organization.overview.departmentsTreemap.title')}
      </h3>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : !data || data.length === 0 ? (
        <EmptyState
          title={t(
            'organization.overview.departmentsTreemap.emptyTitle'
          )}
          description={t(
            'organization.overview.departmentsTreemap.emptyDescription'
          )}
        />
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <TypedTreemap
            data={data}
            dataKey="size"
            nameKey="name"
            content={<CustomCell />}
            isAnimationActive={false}
          />
        </ResponsiveContainer>
      )}
    </div>
  );
}