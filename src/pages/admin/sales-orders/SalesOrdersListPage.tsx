// Project path: src/pages/admin/sales-orders/SalesOrdersListPage.tsx
// Route: /sales-orders

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useSalesOrders } from "../../../hooks/useSalesOrders";
import { useBulkCancelSalesOrders } from "../../../hooks/useSalesOrderMutations";
import { SalesOrdersDashboard } from "../../../components/admin/sales-orders/SalesOrdersDashboard";
import { SalesOrdersToolbar } from "../../../components/admin/sales-orders/SalesOrdersToolbar";
import {
  SalesOrdersFilters,
  DEFAULT_SO_FILTERS,
  type SalesOrdersFiltersState,
} from "../../../components/admin/sales-orders/SalesOrdersFilters";
import { SalesOrdersTable } from "../../../components/admin/sales-orders/SalesOrdersTable";
import {
  SalesOrderActionDialog,
  type SalesOrderDialogAction,
} from "../../../components/admin/sales-orders/SalesOrderActionDialog";
import type { SalesOrderResponse } from "../../../types/salesOrders.types";
import { hasAnyPermission } from "@/utils/permissions";
import { getUserPermissions } from "@/pages/common/LoginPage";

export function SalesOrdersListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: orders = [], isLoading, isFetching, refetch } = useSalesOrders();
  const bulkCancel = useBulkCancelSalesOrders();

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<SalesOrdersFiltersState>(DEFAULT_SO_FILTERS);
  const [dialog, setDialog] = useState<{ action: SalesOrderDialogAction; order: SalesOrderResponse } | null>(null);

  const customerNames = useMemo(() => Array.from(new Set(orders.map((o) => o.customerName))).sort(), [orders]);
  const warehouseNames = useMemo(() => Array.from(new Set(orders.map((o) => o.warehouseName))).sort(), [orders]);
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach((o) => { counts[o.status] = (counts[o.status] ?? 0) + 1; });
    return counts;
  }, [orders]);

  const canCreateAccess = hasAnyPermission(["sales.orders.create"], getUserPermissions());

  const hasActiveFilters =
    search !== "" ||
    filters.statuses.length > 0 ||
    filters.customerName !== "all" ||
    filters.warehouseName !== "all" ||
    filters.hasWarnings !== "all";

  const visibleOrders = useMemo(() => {
    let result = orders;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((o) => o.orderNumber.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q));
    }
    if (filters.statuses.length > 0) result = result.filter((o) => filters.statuses.includes(o.status));
    if (filters.customerName !== "all") result = result.filter((o) => o.customerName === filters.customerName);
    if (filters.warehouseName !== "all") result = result.filter((o) => o.warehouseName === filters.warehouseName);
    if (filters.orderDateFrom) result = result.filter((o) => o.orderDate >= filters.orderDateFrom);
    if (filters.orderDateTo) result = result.filter((o) => o.orderDate <= filters.orderDateTo);
    if (filters.hasWarnings === "yes") result = result.filter((o) => o.stockWarnings.length > 0);
    if (filters.hasWarnings === "no") result = result.filter((o) => o.stockWarnings.length === 0);

    return [...result].sort((a, b) => b.orderDate.localeCompare(a.orderDate));
  }, [orders, search, filters]);

  const handleDuplicate = (order: SalesOrderResponse) => {
    navigate("create", {
      state: {
        duplicateFrom: {
          customerId: order.customerId,
          warehouseId: order.warehouseId,
          orderDate: new Date().toISOString().slice(0, 10),
          notes: order.notes,
          lines: order.lines.map((l) => ({
            productId: l.productId,
            quantity: l.quantity,
            unitPrice: l.unitPrice,
          })),
        },
      },
    });
  };

  const handleBulkCancel = async (ids: string[]) => {
    const result = await bulkCancel.mutateAsync(ids);
    if (result.failedIds.length === 0) {
      toast.success(t("salesOrders.toasts.bulkCancelled", { count: result.succeededIds.length }));
    } else {
      toast.error(t("salesOrders.toasts.bulkCancelPartial", { succeeded: result.succeededIds.length, failed: result.failedIds.length }));
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-[--ink-primary]">{t("salesOrders.page.title")}</h1>
        <p className="mt-1 text-sm text-[--ink-secondary]">{t("salesOrders.page.description")}</p>
      </div>

      <SalesOrdersDashboard
        orders={orders}
        isLoading={isLoading}
        onCardClick={(status) => setFilters(status ? { ...DEFAULT_SO_FILTERS, statuses: [status] } : DEFAULT_SO_FILTERS)}
      />

      <SalesOrdersToolbar
        searchValue={search}
        onSearchChange={setSearch}
        onRefresh={() => refetch()}
        isRefreshing={isFetching}
        onCreate={() => navigate("create")}
        canCreateAccess={canCreateAccess}
      />

      <SalesOrdersFilters
        filters={filters}
        onFiltersChange={setFilters}
        customerNames={customerNames}
        warehouseNames={warehouseNames}
        statusCounts={statusCounts}
      />

      <SalesOrdersTable
        orders={visibleOrders}
        isLoading={isLoading}
        hasActiveFilters={hasActiveFilters}
        onView={(order) => navigate(`${order.id}`)}
        onEdit={(order) => navigate(`${order.id}/edit`)}
        onSubmit={(order) => setDialog({ action: "submit", order })}
        onApprove={(order) => setDialog({ action: "approve", order })}
        onShip={(order) => navigate(`${order.id}/ship`)}
        onCancel={(order) => setDialog({ action: "cancel", order })}
        onPrint={() => window.print()}
        onDuplicate={handleDuplicate}
        onBulkCancel={handleBulkCancel}
        onCreate={() => navigate("create")}
        
      />

      <SalesOrderActionDialog
        action={dialog?.action ?? null}
        order={dialog?.order ?? null}
        onClose={() => setDialog(null)}
      />
    </div>
  );
}
