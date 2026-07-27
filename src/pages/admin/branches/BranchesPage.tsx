// src/pages/admin/branches/BranchesPage.tsx
//
// The module's only page. Owns local state (search, status filter, sort,
// drawer targets) and cross-references the already-loaded Departments and
// Users data to compute per-branch Delete-safety flags and Details counts
// — no dedicated backend aggregate exists for either, so this is done
// client-side, same tradeoff flagged for Departments' "hasAssignedUsers".
//
// ASSUMPTION: hook names (useBranchesList, useCreateBranch,
// useUpdateBranch, useDeleteBranch) inferred per the project's stated
// convention, kept distinct from the lookup-only useBranches() built for
// Users/Departments' dropdowns (same naming-collision note as
// useDepartments.crud.ts).

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { RefreshCw } from "lucide-react";
import { BranchesKpiRow } from "../../../components/admin/branches/BranchesKpiRow";
import { BranchesTable, type BranchRow } from "../../../components/admin/branches/BranchesTable";
import { BranchActionMenu } from "../../../components/admin/branches/BranchActionMenu";
import { BranchDrawer, type BranchFormValues } from "../../../components/admin/branches/BranchDrawer";
// BranchDetailsDrawer removed — Branch Details is now a dedicated page
// at /organization/branches/:id (see BranchDetailsPage.tsx). Row click
// and the "View Details" row action both navigate there instead of
// opening a drawer.

// Replace with the project's actual hooks.
import {
  useBranchesList,
  useCreateBranch,
  useUpdateBranch,
  useDeleteBranch,
} from "../../../hooks/useBranches.crud";
import { useDepartmentsList } from "../../../hooks/useDepartments.crud";
import { useUsers } from "../../../hooks/useUsers";

type DrawerTarget =
  | { kind: "create" }
  | { kind: "edit"; id: string }
  | { kind: "duplicate"; id: string }
  | null;

export function BranchesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<"active" | "inactive" | null>(null);
  const [sortColumnId, setSortColumnId] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null);
  const [drawerTarget, setDrawerTarget] = useState<DrawerTarget>(null);

  const { data: branches = [], isLoading, isError, refetch } = useBranchesList();
  const { data: departments = [] } = useDepartmentsList();
  const { data: usersData } = useUsers({
    searchText: "",
    filters: { branchId: null, departmentId: null, roleId: null, status: null },
    page: 1,
    pageSize: 10000, // full set, needed only for client-side per-branch cross-reference
    // sortColumnId: null,
    sortDirection: null,
  });

  const createMutation = useCreateBranch();
  const updateMutation = useUpdateBranch();
  const deleteMutation = useDeleteBranch();

  // const branchNameById = useMemo(() => {
  //   const map = new Map<string, string>();
  //   branches.forEach((b) => map.set(b.id, b.name));
  //   return map;
  // }, [branches]);

  const departmentCountByBranch = useMemo(() => {
    const map = new Map<string, number>();
    departments.forEach((d) => map.set(d.branchId, (map.get(d.branchId) ?? 0) + 1));
    return map;
  }, [departments]);

  const userCountByBranch = useMemo(() => {
    const map = new Map<string, number>();
    (usersData?.items ?? []).forEach((u) => map.set(u.branchId, (map.get(u.branchId) ?? 0) + 1));
    return map;
  }, [usersData]);

  const isFiltered = searchText.trim().length > 0 || statusFilter !== null;

  const filteredBranches = useMemo(() => {
    return branches.filter((b) => {
      const query = searchText.trim().toLowerCase();
      if (
        query &&
        !b.name.toLowerCase().includes(query) &&
        !b.code.toLowerCase().includes(query)
      ) {
        return false;
      }
      if (statusFilter === "active" && !b.isActive) return false;
      if (statusFilter === "inactive" && b.isActive) return false;
      return true;
    });
  }, [branches, searchText, statusFilter]);

  const rows: BranchRow[] = filteredBranches.map((b) => ({
    id: b.id,
    name: b.name,
    code: b.code,
    address: b.address,
    phone: b.phone,
    isMain: b.isMain,
    isActive: b.isActive,
  }));

  const kpis = useMemo(
    () => ({
      total: branches.length,
      active: branches.filter((b) => b.isActive).length,
      inactive: branches.filter((b) => !b.isActive).length,
      mainBranches: branches
        .filter((b) => b.isMain)
        .map((b) => ({ id: b.id, name: b.name })),
    }),
    [branches],
  );

  const currentMainBranch = kpis.mainBranches.length === 1 ? kpis.mainBranches[0] : null;

  function handleClearFilters() {
    setSearchText("");
    setStatusFilter(null);
  }

  async function handleSetActive(id: string, active: boolean) {
    const current = branches.find((b) => b.id === id);
    if (!current) return;
    await updateMutation.mutateAsync({
      id,
      name: current.name,
      code: current.code,
      address: current.address,
      phone: current.phone,
      isMain: current.isMain,
      isActive: active,
    });
    refetch();
  }

  async function handleDelete(id: string) {
    await deleteMutation.mutateAsync(id);
    refetch();
  }

  async function handleDrawerSubmit(values: BranchFormValues, id?: string) {
    if (id) {
      await updateMutation.mutateAsync({ id, ...values });
    } else {
      await createMutation.mutateAsync({
        name: values.name,
        code: values.code,
        address: values.address,
        phone: values.phone,
        isMain: values.isMain,
      });
    }
    setDrawerTarget(null);
    refetch();
  }

  function renderRowActions(row: BranchRow) {
    const hasDepartments = (departmentCountByBranch.get(row.id) ?? 0) > 0;
    const hasUsers = (userCountByBranch.get(row.id) ?? 0) > 0;
    return (
      <BranchActionMenu
        branchId={row.id}
        branchName={row.name}
        isActive={row.isActive}
        isMain={row.isMain}
        hasDepartments={hasDepartments}
        hasUsers={hasUsers}
        onViewDetails={(id) => navigate(`/organization/branches/${id}`)}
        onEdit={(id) => setDrawerTarget({ kind: "edit", id })}
        onDuplicate={(id) => setDrawerTarget({ kind: "duplicate", id })}
        onSetActive={handleSetActive}
        onDelete={handleDelete}
      />
    );
  }

  const editingBranch =
    drawerTarget?.kind === "edit" ? branches.find((b) => b.id === drawerTarget.id) : undefined;
  const duplicatingBranch =
    drawerTarget?.kind === "duplicate" ? branches.find((b) => b.id === drawerTarget.id) : undefined;

  return (
    <div className="flex flex-col gap-4 md:p-6 py-6 px-2">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--ink-primary)]">
            {t("branches.list.title")}
          </h1>
          <p className="text-sm text-[var(--ink-tertiary)]">
            {t("branches.list.subtitleCount", { count: kpis.total })}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDrawerTarget({ kind: "create" })}
          className="rounded-[10px] bg-[var(--signal)] px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-[var(--signal-hover)]"
        >
          {t("branches.list.createBranch")}
        </button>
      </div>

      <BranchesKpiRow
        total={kpis.total}
        active={kpis.active}
        inactive={kpis.inactive}
        mainBranches={kpis.mainBranches}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder={t("branches.list.search.placeholder")}
          className="w-full max-w-sm rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--ink-primary)] placeholder:text-[var(--ink-tertiary)] focus:border-[var(--signal)] focus:outline-none focus:ring-2 focus:ring-[var(--synapse)]/30"
        />

        <div className="flex items-center gap-2">
          <select
            value={statusFilter ?? ""}
            onChange={(e) =>
              setStatusFilter((e.target.value || null) as "active" | "inactive" | null)
            }
            className="rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--ink-primary)]"
          >
            <option value="">{t("branches.list.filters.status")}</option>
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

      <BranchesTable
        rows={rows}
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
        onRowClick={(row) => navigate(`/organization/branches/${row.id}`)}
        renderRowActions={renderRowActions}
      />

      <BranchDrawer
        open={
          drawerTarget?.kind === "create" ||
          drawerTarget?.kind === "edit" ||
          drawerTarget?.kind === "duplicate"
        }
        onClose={() => setDrawerTarget(null)}
        initialValues={
          editingBranch
            ? {
                id: editingBranch.id,
                name: editingBranch.name,
                code: editingBranch.code,
                address: editingBranch.address,
                phone: editingBranch.phone,
                isMain: editingBranch.isMain,
                isActive: editingBranch.isActive,
              }
            : null
        }
        duplicateFrom={
          duplicatingBranch
            ? {
                name: duplicatingBranch.name,
                code: duplicatingBranch.code,
                address: duplicatingBranch.address,
                phone: duplicatingBranch.phone,
                isMain: duplicatingBranch.isMain,
                isActive: duplicatingBranch.isActive,
              }
            : null
        }
        anotherBranchIsMain={
          currentMainBranch && currentMainBranch.id !== editingBranch?.id
            ? { name: currentMainBranch.name }
            : null
        }
        onSubmit={handleDrawerSubmit}
      />
    </div>
  );
}
