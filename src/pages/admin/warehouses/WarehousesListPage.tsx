// Project path: src/pages/admin/warehouses/WarehousesListPage.tsx
// Route: /warehouses

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useWarehouses } from "../../../hooks/useWarehouses";
import { useSetWarehouseActive } from "../../../hooks/useWarehouseMutations";
import { useBranches } from "../../../hooks/useBranches"; // existing lookup hook, per branches.api.ts
import { WarehousesStatsCards } from "../../../components/admin/warehouses/WarehousesStatsCards";
import {
  WarehousesToolbar,
  type WarehousesFilters,
  type WarehousesSortOption,
} from "../../../components/admin/warehouses/WarehousesToolbar";
import { WarehousesDataTable } from "../../../components/admin/warehouses/WarehousesDataTable";
import {
  WarehouseDrawer,
  type WarehouseDrawerMode,
} from "../../../components/admin/warehouses/WarehouseDrawer";
import { DeleteWarehouseDialog } from "../../../components/admin/warehouses/DeleteWarehouseDialog";
import type { WarehouseResponse } from "../../../types/warehouses.types";
import { hasAnyPermission } from "@/utils/permissions";
import { getUserPermissions } from "@/pages/common/LoginPage";

const DEFAULT_FILTERS: WarehousesFilters = {
  search: "",
  branchId: "all",
  status: "all",
};

type DrawerState = { mode: WarehouseDrawerMode; warehouse: WarehouseResponse | null } | null;

export function WarehousesListPage() {
  const { t } = useTranslation();
  const { data: warehouses = [], isLoading, isFetching, refetch } = useWarehouses();
  const { data: branches = [] } = useBranches();
  const setActive = useSetWarehouseActive();

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [sort, setSort] = useState<WarehousesSortOption>("nameAsc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>();
  const [drawer, setDrawer] = useState<DrawerState>(null);
  const [deleteTarget, setDeleteTarget] = useState<WarehouseResponse | null>(null);

  const canManageAccess = hasAnyPermission(["inventory.warehouses.manage"], getUserPermissions());

  const hasActiveFilters =
    filters.search !== "" || filters.branchId !== "all" || filters.status !== "all";

  const visibleWarehouses = useMemo(() => {
    let result = warehouses;

    if (filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      result = result.filter(
        (w) => w.name.toLowerCase().includes(q) || w.code.toLowerCase().includes(q)
      );
    }
    if (filters.branchId !== "all") {
      result = result.filter((w) => w.branchId === filters.branchId);
    }
    if (filters.status !== "all") {
      result = result.filter((w) =>
        filters.status === "active" ? w.isActive : !w.isActive
      );
    }

    return [...result].sort((a, b) => {
      if (sort === "nameAsc") return a.name.localeCompare(b.name);
      if (sort === "nameDesc") return b.name.localeCompare(a.name);
      return a.code.localeCompare(b.code);
    });
  }, [warehouses, filters, sort]);

  return (
    <div className="flex flex-col gap-6 px-2 md:p-6 py-6">
      <div>
        <h1 className="text-2xl font-semibold text-[--ink-primary]">
          {t("warehouses.page.title")}
        </h1>
        <p className="mt-1 text-sm text-[--ink-secondary]">
          {t("warehouses.page.description")}
        </p>
      </div>

      <WarehousesStatsCards warehouses={warehouses} isLoading={isLoading} />

      <WarehousesToolbar
        filters={filters}
        onFiltersChange={setFilters}
        sortValue={sort}
        onSortChange={setSort}
        branches={branches}
        onRefresh={() => refetch()}
        isRefreshing={isFetching}
        onCreate={() => setDrawer({ mode: "create", warehouse: null })}
        canManageAccess={canManageAccess}
      />

      <WarehousesDataTable
        warehouses={visibleWarehouses}
        branches={branches}
        isLoading={isLoading}
        hasActiveFilters={hasActiveFilters}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onView={(warehouse) => setDrawer({ mode: "view", warehouse })}
        onEdit={(warehouse) => setDrawer({ mode: "edit", warehouse })}
        onToggleActive={(warehouse) =>
          toast.promise(
            setActive.mutateAsync({
              id: warehouse.id,
              payload: {
                name: warehouse.name,
                code: warehouse.code,
                branchId: warehouse.branchId,
                isActive: !warehouse.isActive,
              },
            }),
            {
              loading: t("common.status.updating"),
              success: warehouse.isActive
                ? t("warehouses.toasts.deactivated")
                : t("warehouses.toasts.activated"),
              error: t("common.errors.actionFailed"),
            }
          )
        }
        onDelete={setDeleteTarget}
        onCreate={() => setDrawer({ mode: "create", warehouse: null })}
        onResetFilters={() => setFilters(DEFAULT_FILTERS)}
        canManageAccess={canManageAccess}
      />

      <WarehouseDrawer
        mode={drawer?.mode ?? "create"}
        warehouse={drawer?.warehouse ?? null}
        branches={branches}
        open={drawer !== null}
        onClose={() => setDrawer(null)}
      />

      <DeleteWarehouseDialog
        warehouse={deleteTarget}
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
