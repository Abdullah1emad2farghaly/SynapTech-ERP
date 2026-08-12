// Project path: src/pages/admin/purchase-orders/PurchaseOrdersListPage.tsx
// Route: /purchase-orders

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { usePurchaseOrders } from "../../../hooks/usePurchaseOrders";
import { useBulkCancelPurchaseOrders } from "../../../hooks/usePurchaseOrderMutations";
import { PurchaseOrdersDashboard } from "../../../components/admin/purchase-orders/PurchaseOrdersDashboard";
import { PurchaseOrdersToolbar } from "../../../components/admin/purchase-orders/PurchaseOrdersToolbar";
import {
  PurchaseOrdersFilters,
  DEFAULT_PO_FILTERS,
  type PurchaseOrdersFiltersState,
} from "../../../components/admin/purchase-orders/PurchaseOrdersFilters";
import { PurchaseOrdersTable } from "../../../components/admin/purchase-orders/PurchaseOrdersTable";
import {
  PurchaseOrderActionDialog,
  type PurchaseOrderDialogAction,
} from "../../../components/admin/purchase-orders/PurchaseOrderActionDialog";
import type { PurchaseOrderResponse } from "../../../types/purchaseOrders.types";

export function PurchaseOrdersListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: orders = [], isLoading, isFetching, refetch } = usePurchaseOrders();
  const bulkCancel = useBulkCancelPurchaseOrders();

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<PurchaseOrdersFiltersState>(DEFAULT_PO_FILTERS);
  const [dialog, setDialog] = useState<{ action: PurchaseOrderDialogAction; order: PurchaseOrderResponse } | null>(null);

  const supplierNames = useMemo(() => Array.from(new Set(orders.map((o) => o.supplierName))).sort(), [orders]);
  const warehouseNames = useMemo(() => Array.from(new Set(orders.map((o) => o.warehouseName))).sort(), [orders]);
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach((o) => { counts[o.status] = (counts[o.status] ?? 0) + 1; });
    return counts;
  }, [orders]);

  const hasActiveFilters =
    search !== "" ||
    filters.statuses.length > 0 ||
    filters.supplierName !== "all" ||
    filters.warehouseName !== "all" ||
    filters.hasWarnings !== "all";

  const visibleOrders = useMemo(() => {
    let result = orders;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (o) => o.orderNumber.toLowerCase().includes(q) || o.supplierName.toLowerCase().includes(q)
      );
    }
    if (filters.statuses.length > 0) {
      result = result.filter((o) => filters.statuses.includes(o.status));
    }
    if (filters.supplierName !== "all") {
      result = result.filter((o) => o.supplierName === filters.supplierName);
    }
    if (filters.warehouseName !== "all") {
      result = result.filter((o) => o.warehouseName === filters.warehouseName);
    }
    if (filters.orderDateFrom) result = result.filter((o) => o.orderDate >= filters.orderDateFrom);
    if (filters.orderDateTo) result = result.filter((o) => o.orderDate <= filters.orderDateTo);
    if (filters.hasWarnings === "yes") result = result.filter((o) => o.warnings.length > 0);
    if (filters.hasWarnings === "no") result = result.filter((o) => o.warnings.length === 0);

    return [...result].sort((a, b) => b.orderDate.localeCompare(a.orderDate));
  }, [orders, search, filters]);

  const handleDuplicate = (order: PurchaseOrderResponse) => {
    navigate("create", {
      state: {
        duplicateFrom: {
          supplierId: order.supplierId,
          warehouseId: order.warehouseId,
          orderDate: new Date().toISOString().slice(0, 10),
          expectedDate: new Date().toISOString().slice(0, 10),
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
      toast.success(t("purchaseOrders.toasts.bulkCancelled", { count: result.succeededIds.length }));
    } else {
      toast.error(t("purchaseOrders.toasts.bulkCancelPartial", { succeeded: result.succeededIds.length, failed: result.failedIds.length }));
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-[--ink-primary]">{t("purchaseOrders.page.title")}</h1>
        <p className="mt-1 text-sm text-[--ink-secondary]">{t("purchaseOrders.page.description")}</p>
      </div>

      <PurchaseOrdersDashboard
        orders={orders}
        isLoading={isLoading}
        onCardClick={(status) => setFilters(status ? { ...DEFAULT_PO_FILTERS, statuses: [status] } : DEFAULT_PO_FILTERS)}
      />

      <PurchaseOrdersToolbar
        searchValue={search}
        onSearchChange={setSearch}
        onRefresh={() => refetch()}
        isRefreshing={isFetching}
        onCreate={() => navigate("create")}
      />

      <PurchaseOrdersFilters
        filters={filters}
        onFiltersChange={setFilters}
        supplierNames={supplierNames}
        warehouseNames={warehouseNames}
        statusCounts={statusCounts}
      />

      <PurchaseOrdersTable
        orders={visibleOrders}
        isLoading={isLoading}
        hasActiveFilters={hasActiveFilters}
        onView={(order) => navigate(`${order.id}`)}
        onEdit={(order) => navigate(`${order.id}/edit`)}
        onSubmit={(order) => setDialog({ action: "submit", order })}
        onApprove={(order) => setDialog({ action: "approve", order })}
        onReceive={(order) => navigate(`${order.id}/receive`)}
        onCancel={(order) => setDialog({ action: "cancel", order })}
        onPrint={() => window.print()}
        onDuplicate={handleDuplicate}
        onBulkCancel={handleBulkCancel}
        onCreate={() => navigate("create")}
      />

      <PurchaseOrderActionDialog
        action={dialog?.action ?? null}
        order={dialog?.order ?? null}
        onClose={() => setDialog(null)}
      />
    </div>
  );
}
