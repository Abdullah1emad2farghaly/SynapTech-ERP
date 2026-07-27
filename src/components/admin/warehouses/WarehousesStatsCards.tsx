// Project path: src/components/admin/warehouses/WarehousesStatsCards.tsx
//
// All four figures derived from confirmed data (name/code/branchId/isActive
// across the full list). No capacity/stock-based stats — those fields don't exist.

import { useTranslation } from "react-i18next";
import { Warehouse, CheckCircle2, XCircle, Network } from "lucide-react";
import type { WarehouseResponse } from "../../../types/warehouses.types";

interface WarehousesStatsCardsProps {
  warehouses: WarehouseResponse[];
  isLoading?: boolean;
}

function StatCard({
  icon,
  label,
  value,
  description,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-[--hairline] bg-[--panel] p-5 shadow-[var(--elevation-1)] transition-transform duration-150 ease-out hover:-translate-y-0.5">
      <div className="flex items-center justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[--signal]/10 text-[--signal]">
          {icon}
        </span>
        <span className="text-2xl font-semibold text-[--ink-primary]">{value}</span>
      </div>
      <div>
        <p className="text-sm font-medium text-[--ink-primary]">{label}</p>
        <p className="text-xs text-[--ink-tertiary]">{description}</p>
      </div>
    </div>
  );
}

export function WarehousesStatsCards({
  warehouses,
  isLoading,
}: WarehousesStatsCardsProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-[92px] animate-pulse rounded-lg bg-[--sunken]" />
        ))}
      </div>
    );
  }

  const active = warehouses.filter((w) => w.isActive).length;
  const inactive = warehouses.length - active;
  const branchesWithWarehouses = new Set(warehouses.map((w) => w.branchId)).size;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      <StatCard
        icon={<Warehouse size={18} />}
        label={t("warehouses.stats.total")}
        value={warehouses.length}
        description={t("warehouses.stats.totalDescription")}
      />
      <StatCard
        icon={<CheckCircle2 size={18} />}
        label={t("warehouses.stats.active")}
        value={active}
        description={t("warehouses.stats.activeDescription")}
      />
      <StatCard
        icon={<XCircle size={18} />}
        label={t("warehouses.stats.inactive")}
        value={inactive}
        description={t("warehouses.stats.inactiveDescription")}
      />
      <StatCard
        icon={<Network size={18} />}
        label={t("warehouses.stats.branchesWithWarehouses")}
        value={branchesWithWarehouses}
        description={t("warehouses.stats.branchesWithWarehousesDescription")}
      />
    </div>
  );
}
