// src/pages/admin/customers/CustomersPage.tsx
//
// The module's only page. Owns local state (search, status filter,
// sort, drawer/dialog targets) and delegates fetching/mutations to
// hooks over services/api. Renders CustomersTable on larger screens and
// CustomerCard list on mobile — both fed the same filtered/sorted rows,
// switched via Tailwind's responsive display utilities rather than a
// JS breakpoint check, so there's no layout flash on resize.
//
// No pagination — GET /api/Customers documents no pagination params,
// same assumption class as Departments/Categories: full list loads once,
// client-side search/filter/sort from there.

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { RefreshCw, Search } from "lucide-react";
import { CustomersKpiRow } from "../../../components/admin/customers/CustomersKpiRow";
import { CustomersTable, type CustomerRow } from "../../../components/admin/customers/CustomersTable";
import { CustomerCard } from "../../../components/admin/customers/CustomerCard";
import { CustomerActionMenu } from "../../../components/admin/customers/CustomerActionMenu";
import { CustomerDrawer, type CustomerFormValues } from "../../../components/admin/customers/CustomerDrawer";
import { CustomerDetailsDrawer } from "../../../components/admin/customers/CustomerDetailsDrawer";
import { ConfirmationDialog } from "../../../components/common/ConfirmationDialog";

import {
  useCustomersList,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
} from "../../../hooks/useCustomers.crud";
import axios from "axios";
import { handleErrors } from "@/utils/HandleErrors";
import { hasAnyPermission } from "@/utils/permissions";
import { getUserPermissions } from "@/pages/common/LoginPage";

type DrawerTarget =
  | { kind: "create" }
  | { kind: "edit"; id: string }
  | { kind: "details"; id: string }
  | null;
type ConfirmTarget = { kind: "deactivate" | "delete"; id: string } | null;

export function CustomersPage() {
  const { t } = useTranslation();

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<"active" | "inactive" | null>(null);
  const [sortColumnId, setSortColumnId] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null);
  const [drawerTarget, setDrawerTarget] = useState<DrawerTarget>(null);
  const [confirmTarget, setConfirmTarget] = useState<ConfirmTarget>(null);
  const [isConfirmSubmitting, setIsConfirmSubmitting] = useState(false);

  const { data: customers = [], isLoading, isError, refetch } = useCustomersList();
  const canManageAccess = hasAnyPermission(['sales.customers.manage'], getUserPermissions());
  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();
  const deleteMutation = useDeleteCustomer();

  const customerById = useMemo(() => {
    const map = new Map<string, (typeof customers)[number]>();
    customers.forEach((c) => map.set(c.id, c));
    return map;
  }, [customers]);

  const isFiltered = searchText.trim().length > 0 || statusFilter !== null;

  const filteredCustomers = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    return customers.filter((c) => {
      if (
        query &&
        !c.name.toLowerCase().includes(query) &&
        !c.contactName.toLowerCase().includes(query) &&
        !c.email.toLowerCase().includes(query) &&
        !c.phone.toLowerCase().includes(query)
      ) {
        return false;
      }
      if (statusFilter === "active" && !c.isActive) return false;
      if (statusFilter === "inactive" && c.isActive) return false;
      return true;
    });
  }, [customers, searchText, statusFilter]);

  const sortedCustomers = useMemo(() => {
    if (!sortColumnId || !sortDirection) return filteredCustomers;
    const factor = sortDirection === "asc" ? 1 : -1;
    return [...filteredCustomers].sort((a, b) => {
      switch (sortColumnId) {
        case "name":
          return a.name.localeCompare(b.name) * factor;
        case "contactName":
          return a?.contactName?.localeCompare(b.contactName) * factor;
        case "status":
          return (Number(a.isActive) - Number(b.isActive)) * factor;
        default:
          return 0;
      }
    });
  }, [filteredCustomers, sortColumnId, sortDirection]);

  const kpis = useMemo(
    () => ({
      total: customers.length,
      active: customers.filter((c) => c.isActive).length,
      inactive: customers.filter((c) => !c.isActive).length,
    }),
    [customers],
  );

  
  function handleClearFilters() {
    setSearchText("");
    setStatusFilter(null);
  }

  async function handleSetActive(id: string, active: boolean) {
    const current = customerById.get(id);
    if (!current) return;
    await updateMutation.mutateAsync({ ...current, id, isActive: active });
    refetch();
  }

  async function handleDrawerSubmit(values: CustomerFormValues, id?: string) {

    if (id) {
      await updateMutation.mutateAsync({ id, ...values }, {
        onError: (error) => {
          if (axios.isAxiosError(error)) {
            handleErrors(error.response?.data.errors);
          }
        }
      });
      setDrawerTarget(null);
    } else {
      const { isActive: _isActive, ...createValues } = values;
      await createMutation.mutateAsync(createValues, {
        onError: (error) => {
          if (axios.isAxiosError(error)) {
            handleErrors(error.response?.data.errors);
          }
        }
      });
    }
    refetch();
  }

  function requestDeactivate(id: string) {
    setConfirmTarget({ kind: "deactivate", id });
  }

  function requestDelete(id: string) {
    setConfirmTarget({ kind: "delete", id });
  }

  async function handleConfirm() {
    if (!confirmTarget) return;
    setIsConfirmSubmitting(true);
    try {
      const name = customerById.get(confirmTarget.id)?.name ?? "";
      if (confirmTarget.kind === "deactivate") {
        await handleSetActive(confirmTarget.id, false);
        toast.success(t("customers.toast.deactivated", { name }));
      } else {
        await deleteMutation.mutateAsync(confirmTarget.id);
        toast.success(t("customers.toast.deleted", { name }));
        refetch();
      }
      setConfirmTarget(null);
    } finally {
      setIsConfirmSubmitting(false);
    }
  }

  function renderRowActions(row: { id: string; isActive: boolean }) {
    return (
      <CustomerActionMenu
        customerId={row.id}
        customerName={customerById.get(row.id)?.name ?? ""}
        isActive={row.isActive}
        onViewDetails={(id) => setDrawerTarget({ kind: "details", id })}
        onEdit={(id) => setDrawerTarget({ kind: "edit", id })}
        onSetActive={handleSetActive}
        onDeactivateRequest={requestDeactivate}
        onDeleteRequest={requestDelete}
      />
    );
  }

  const tableRows: CustomerRow[] = sortedCustomers.map((c) => ({
    id: c.id,
    name: c.name,
    contactName: c.contactName,
    phone: c.phone,
    email: c.email,
    taxNumber: c.taxNumber,
    isActive: c.isActive,
  }));

  const editingCustomer =
    drawerTarget?.kind === "edit" ? customerById.get(drawerTarget.id) : undefined;
  const detailsCustomer =
    drawerTarget?.kind === "details" ? customerById.get(drawerTarget.id) : undefined;

  return (
    <div className="flex flex-col gap-4 md:px-6 px-2 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--ink-primary)]">
            {t("customers.list.title")}
          </h1>
          <p className="text-sm text-[var(--ink-tertiary)]">
            {t("customers.list.subtitleCount", { count: kpis.total })}
          </p>
        </div>
        {/*  */}
        {
          canManageAccess && (
            <button
              type="button"
              onClick={() => setDrawerTarget({ kind: "create" })}
              className="rounded-[10px] bg-[var(--signal)] px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-[var(--signal-hover)]"
            >
              {t("customers.list.createCustomer")}
            </button>
          )
        }

      </div>

      <CustomersKpiRow total={kpis.total} active={kpis.active} inactive={kpis.inactive} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search
            size={15}
            className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[var(--ink-tertiary)]"
          />
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder={t("customers.list.search.placeholder")}
            className="w-full rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] py-2 ps-9 pe-3 text-sm text-[var(--ink-primary)] placeholder:text-[var(--ink-tertiary)] focus:border-[var(--signal)] focus:outline-none focus:ring-2 focus:ring-[var(--synapse)]/30"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter ?? ""}
            onChange={(e) =>
              setStatusFilter((e.target.value || null) as "active" | "inactive" | null)
            }
            className="rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--ink-primary)]"
          >
            <option value="">{t("customers.list.filters.status")}</option>
            <option value="active">{t("users.status.active")}</option>
            <option value="inactive">{t("users.status.inactive")}</option>
          </select>

          <button
            type="button"
            onClick={() => refetch()}
            aria-label={t("common.actions.retry")}
            className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] text-[var(--ink-secondary)] hover:bg-[var(--sunken)]"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Desktop/tablet: table. Mobile: cards. Both share the same rows/state. */}
      <div className="hidden sm:block">
        <CustomersTable
          rows={tableRows}
          isLoading={isLoading}
          hasError={isError}
          onRetry={() => refetch()}
          onClearFilters={handleClearFilters}
          isFiltered={isFiltered}
          sortColumnId={sortColumnId}
          sortDirection={sortDirection}
          onSortChange={(columnId, direction) => {
            setSortColumnId(direction ? columnId : null);
            setSortDirection(direction);
          }}
          onRowClick={(row) => setDrawerTarget({ kind: "details", id: row.id })}
          renderRowActions={renderRowActions}
        />
      </div>

      <div className="flex flex-col gap-3 sm:hidden">
        {tableRows.map((row) => (
          <CustomerCard
            key={row.id}
            customer={row}
            onClick={(id) => setDrawerTarget({ kind: "details", id })}
            renderActions={() => renderRowActions(row)}
          />
        ))}
      </div>

      <CustomerDrawer
        open={drawerTarget?.kind === "create" || drawerTarget?.kind === "edit"}
        onClose={() => setDrawerTarget(null)}
        initialValues={
          editingCustomer
            ? {
              id: editingCustomer.id,
              name: editingCustomer.name,
              contactName: editingCustomer.contactName,
              phone: editingCustomer.phone,
              email: editingCustomer.email,
              address: editingCustomer.address,
              taxNumber: editingCustomer.taxNumber,
              isActive: editingCustomer.isActive,
            }
            : null
        }
        onSubmit={handleDrawerSubmit}
      />

      <CustomerDetailsDrawer
        open={drawerTarget?.kind === "details"}
        onClose={() => setDrawerTarget(null)}
        customer={detailsCustomer ?? null}
        onEdit={(id) => setDrawerTarget({ kind: "edit", id })}
        onSetActive={handleSetActive}
        onDeactivateRequest={requestDeactivate}
        onDeleteRequest={requestDelete}
        canManageAccess={canManageAccess}
      />

      <ConfirmationDialog
        open={confirmTarget?.kind === "deactivate"}
        tone="neutral"
        title={t("customers.dialogs.deactivate.title")}
        body={t("customers.dialogs.deactivate.body")}
        confirmLabel={t("customers.actions.deactivate")}
        cancelLabel={t("users.actions.cancel")}
        isSubmitting={isConfirmSubmitting}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmTarget(null)}
      />

      <ConfirmationDialog
        open={confirmTarget?.kind === "delete"}
        tone="destructive"
        title={t("customers.dialogs.delete.title")}
        body={t("customers.dialogs.delete.body", {
          name: confirmTarget ? (customerById.get(confirmTarget.id)?.name ?? "") : "",
        })}
        confirmLabel={t("customers.actions.delete")}
        cancelLabel={t("users.actions.cancel")}
        isSubmitting={isConfirmSubmitting}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmTarget(null)}
      />
    </div>
  );
}
