// Intended path: src/components/admin/purchasing/OrdersByStatusChart.tsx
// Structurally identical to Sales Overview's OrdersByStatusChart, but for
// the Purchase Orders status set, which differs from Sales Orders'
// (PartiallyReceived/Received vs PartiallyShipped/Shipped).

import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
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

import type { StatusCount } from '../../../hooks/usePurchasingOverviewStats';


// ASSUMPTION: matches the status→color mapping already established for
// Purchase Orders' own StatusTracker (Draft→ink-tertiary,
// Submitted→synapse, Approved→signal, PartiallyReceived→warning,
// Received→success, Cancelled→error). Exact string casing/spacing of
// "PartiallyReceived" in the real backend enum is unconfirmed — verify
// against the actual PurchaseOrderStatus values before merging. If
// purchaseOrderWorkflow.ts already exports a canonical color map, import it
// from there instead of duplicating this object.
const STATUS_COLOR_VAR: Record<string, string> = {
  Draft: 'var(--ink-tertiary)',
  Submitted: 'var(--synapse)',
  Approved: 'var(--signal)',
  PartiallyReceived: 'var(--warning)',
  Received: 'var(--success)',
  Cancelled: 'var(--error)',
};


interface Props {
  data: StatusCount[] | undefined;
  isLoading: boolean;
}


export function OrdersByStatusChart({ data, isLoading }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();


  const handleSliceClick = (
    _entry: unknown,
    index: number
  ) => {
    if (!data || !data[index]) {
      return;
    }

    const status = data[index].status;

    navigate(`purchase-orders?status=${status}`);
  };


  return (
    <div className="bg-panel border border-hairline rounded-lg p-4 shadow-elevation-1">
      <h3 className="text-sm font-medium text-ink-primary mb-3">
        {t('purchasing.overview.ordersByStatus.title')}
      </h3>

      {isLoading ? (
        <Skeleton className="h-56 w-full" />
      ) : !data || data.length === 0 ? (
        <EmptyState
          title={t('purchasing.overview.ordersByStatus.emptyTitle')}
          description={t(
            'purchasing.overview.ordersByStatus.emptyDescription'
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
              onClick={handleSliceClick}
              cursor="pointer"
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
              formatter={(value, name) => [
                Number(value ?? 0),
                t(
                  `purchaseOrders.status.${String(name)}`,
                  String(name)
                ),
              ]}
            />

            <Legend
              formatter={(value) =>
                t(
                  `purchaseOrders.status.${String(value)}`,
                  String(value)
                )
              }
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
