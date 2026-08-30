// Project path: src/pages/admin/suppliers/SuppliersListPage.tsx
// Route: /suppliers

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useSuppliers } from "../../../hooks/useSuppliers";
import { useBulkDeleteSuppliers } from "../../../hooks/useSupplierMutations";
import {
  SuppliersToolbar,
  type SuppliersFilters,
  type SuppliersSortOption,
} from "../../../components/admin/suppliers/SuppliersToolbar";
import { SuppliersTable } from "../../../components/admin/suppliers/SuppliersTable";
import {
  SupplierDrawer,
  type SupplierDrawerMode,
} from "../../../components/admin/suppliers/SupplierDrawer";
import { SupplierDeleteDialog } from "../../../components/admin/suppliers/SupplierDeleteDialog";
import type { SupplierResponse } from "../../../types/suppliers.types";
import { hasAnyPermission } from "@/utils/permissions";
import { getUserPermissions } from "@/pages/common/LoginPage";

const DEFAULT_FILTERS: SuppliersFilters = { search: "", status: "all" };

type DrawerState = { mode: SupplierDrawerMode; supplier: SupplierResponse | null } | null;

export function SuppliersListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: suppliers = [], isLoading, isFetching, refetch } = useSuppliers();
  const bulkDelete = useBulkDeleteSuppliers();

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SuppliersSortOption>("nameAsc");
  const [drawer, setDrawer] = useState<DrawerState>(null);
  const [deleteTarget, setDeleteTarget] = useState<SupplierResponse | null>(null);
  const canManageAccess = hasAnyPermission(["purchasing.suppliers.manage"],getUserPermissions());

  const hasActiveFilters = filters.search !== "" || filters.status !== "all";

  const visibleSuppliers = useMemo(() => {
    let result = suppliers;

    if (filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      result = result.filter(
        (s) =>
          s.name?.toLowerCase()?.includes(q) ||
          s.contactName?.toLowerCase()?.includes(q) ||
          s.email?.toLowerCase()?.includes(q) ||
          s.taxNumber?.toLowerCase()?.includes(q)
      );
    }
    if (filters.status !== "all") {
      result = result.filter((s) =>
        filters.status === "active" ? s.isActive : !s.isActive
      );
    }

    return [...result].sort((a, b) =>
      sort === "nameAsc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
    );
  }, [suppliers, filters, sort]);

  const handleBulkDelete = async (ids: string[]) => {
    const result = await bulkDelete.mutateAsync(ids);
    if (result.failedIds.length === 0) {
      toast.success(t("suppliers.toasts.bulkDeleted", { count: result.succeededIds.length }));
    } else {
      toast.error(
        t("suppliers.toasts.bulkDeletePartial", {
          succeeded: result.succeededIds.length,
          failed: result.failedIds.length,
        })
      );
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-[--ink-primary]">
          {t("suppliers.page.title")}
        </h1>
        <p className="mt-1 text-sm text-[--ink-secondary]">
          {t("suppliers.page.description")}
        </p>
      </div>

      <SuppliersToolbar
        filters={filters}
        onFiltersChange={setFilters}
        sortValue={sort}
        onSortChange={setSort}
        onRefresh={() => refetch()}
        isRefreshing={isFetching}
        onCreate={() => setDrawer({ mode: "create", supplier: null })}
        canManageAccess={canManageAccess}
      />

      <SuppliersTable
        suppliers={visibleSuppliers}
        isLoading={isLoading}
        hasActiveFilters={hasActiveFilters}
        onView={(supplier) => navigate(`${supplier.id}`)}
        onEdit={(supplier) => setDrawer({ mode: "edit", supplier })}
        onDelete={setDeleteTarget}
        onBulkDelete={handleBulkDelete}
        onCreate={() => setDrawer({ mode: "create", supplier: null })}
      />

      <SupplierDrawer
        mode={drawer?.mode ?? "create"}
        supplier={drawer?.supplier ?? null}
        open={drawer !== null}
        onClose={() => setDrawer(null)}
      />

      <SupplierDeleteDialog
        supplier={deleteTarget}
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
