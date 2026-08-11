// Intended path: src/components/admin/sales/OrdersByStatusChart.tsx

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { Skeleton } from "../../common/Skeleton";
import { EmptyState } from "../../common/EmptyState";
import type { StatusCount } from "../../../hooks/useSalesOverviewStats";

const STATUS_COLOR_VAR: Record<string, string> = {
  Draft: "var(--ink-tertiary)",
  Submitted: "var(--synapse)",
  Approved: "var(--signal)",
  PartiallyShipped: "var(--warning)",
  Shipped: "var(--success)",
  Cancelled: "var(--error)",
};

interface Props {
  data: StatusCount[] | undefined;
  isLoading: boolean;
}

export function OrdersByStatusChart({ data, isLoading }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSliceClick = (sliceData: unknown) => {
    if (!sliceData || typeof sliceData !== "object") {
      return;
    }

    const payload = (sliceData as { payload?: { status?: string } }).payload;

    const status = payload?.status;

    if (!status) {
      return;
    }

    navigate(
      `/sales/sales-orders?status=${encodeURIComponent(status)}`
    );
  };

  const formatStatus = (status: unknown): string => {
    if (typeof status !== "string") {
      return "";
    }

    return t(`salesOrders.status.${status}`, status);
  };

  const formatTooltipValue = (value: unknown): string | number => {
    if (typeof value === "number") {
      return value;
    }

    if (typeof value === "string") {
      return value;
    }

    return "";
  };

  return (
    <div className="bg-panel border border-hairline rounded-lg p-4 shadow-elevation-1">
      <h3 className="text-sm font-medium text-ink-primary mb-3">
        {t("sales.overview.ordersByStatus.title")}
      </h3>

      {isLoading ? (
        <Skeleton className="h-56 w-full" />
      ) : !data || data.length === 0 ? (
        <EmptyState
          title={t("sales.overview.ordersByStatus.emptyTitle")}
          description={t(
            "sales.overview.ordersByStatus.emptyDescription"
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
                    "var(--ink-tertiary)"
                  }
                />
              ))}
            </Pie>

            <Tooltip
              formatter={(value, name) => [
                formatTooltipValue(value),
                formatStatus(name),
              ]}
            />

            <Legend
              formatter={(value) => formatStatus(value)}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}