// src/pages/admin/departments/DepartmentsPage.tsx
//
// The module's only page. Owns all local UI state (search, filters, view
// toggle, drawer/dialog targets) and delegates fetching/mutations to
// hooks over services/api — no direct API calls here, per the
// architecture rule.
//
// ASSUMPTION: hook names (useDepartments, useCreateDepartment,
// useUpdateDepartment, useDeleteDepartment) inferred per the project's
// stated convention. useDepartments here refers to the FULL Departments
// CRUD hook set — not the lookup-only useDepartments() built earlier for
// Users' Branch/Department dropdowns (that one only maps to
// MultiSelectOption; this page needs the richer shape). Rename either to
// avoid a collision if you wire both into the same project.

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { RefreshCw } from "lucide-react";
import { DepartmentsKpiRow } from "../../../components/admin/departments/DepartmentsKpiRow";
import { DepartmentsTreeTable } from "../../../components/admin/departments/DepartmentsTreeTable";
import {
  DepartmentsFlatTable,
  type DepartmentFlatRow,
} from "../../../components/admin/departments/DepartmentsFlatTable";
import { DepartmentActionMenu } from "../../../components/admin/departments/DepartmentActionMenu";
import { DepartmentDrawer, type DepartmentFormValues } from "../../../components/admin/departments/DepartmentDrawer";
import { MoveDepartmentDrawer } from "../../../components/admin/departments/MoveDepartmentDrawer";
import { DepartmentDetailsDrawer } from "../../../components/admin/departments/DepartmentDetailsDrawer";
import type { TreeSelectNode } from "../../../components/common/TreeSelect";

// Replace with the project's actual hooks.
import {
  useDepartmentsList,
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
} from "../../../hooks/useDepartments.crud";
import { useBranches } from "../../../hooks/useBranches";
import { useUsers } from "../../../hooks/useUsers"; // used only to check hasAssignedUsers before allowing delete

type ViewMode = "tree" | "flat";
type DrawerTarget =
  | { kind: "create" }
  | { kind: "edit"; id: string }
  | { kind: "duplicate"; id: string }
  | { kind: "move"; id: string }
  | { kind: "details"; id: string }
  | null;

export function DepartmentsPage() {
  const { t } = useTranslation();

  const [searchText, setSearchText] = useState("");
  const [branchFilter, setBranchFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"active" | "inactive" | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("tree");
  const [sortColumnId, setSortColumnId] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null);
  const [drawerTarget, setDrawerTarget] = useState<DrawerTarget>(null);

  const { data: departments = [], isLoading, isError, refetch } = useDepartmentsList();
  const { data: branchOptions = [] } = useBranches();
  const { data: usersData } = useUsers({
    searchText: "",
    filters: { branchId: null, departmentId: null, roleId: null, status: null },
    page: 1,
    pageSize: 10000, // full set, needed only to compute per-department assignment counts client-side
    // sortColumnId: null,
    sortDirection: null,
  });

  const createMutation = useCreateDepartment();
  const updateMutation = useUpdateDepartment();
  const deleteMutation = useDeleteDepartment();

  const branchNameById = useMemo(() => {
    const map = new Map<string, string>();
    branchOptions.forEach((b) => map.set(b.value, b.label));
    return map;
  }, [branchOptions]);

  const departmentNameById = useMemo(() => {
    const map = new Map<string, string>();
    departments.forEach((d) => map.set(d.id, d.name));
    return map;
  }, [departments]);

  const childIdsByParent = useMemo(() => {
    const map = new Map<string, string[]>();
    departments.forEach((d) => {
      if (!d.parentDepartmentId) return;
      const siblings = map.get(d.parentDepartmentId) ?? [];
      siblings.push(d.id);
      map.set(d.parentDepartmentId, siblings);
    });
    return map;
  }, [departments]);

  const departmentIdsWithUsers = useMemo(() => {
    const set = new Set<string>();
    (usersData?.items ?? []).forEach((u) => set.add(u.departmentId));
    return set;
  }, [usersData]);

  const isFiltered =
    searchText.trim().length > 0 || branchFilter !== null || statusFilter !== null;

  const filteredDepartments = useMemo(() => {
    return departments.filter((d) => {
      if (searchText.trim() && !d.name.toLowerCase().includes(searchText.trim().toLowerCase())) {
        return false;
      }
      if (branchFilter && d.branchId !== branchFilter) return false;
      if (statusFilter === "active" && !d.isActive) return false;
      if (statusFilter === "inactive" && d.isActive) return false;
      return true;
    });
  }, [departments, searchText, branchFilter, statusFilter]);

  const treeRows = filteredDepartments.map((d) => ({
    id: d.id,
    name: d.name,
    branchName: branchNameById.get(d.branchId) ?? "—",
    parentDepartmentId: d.parentDepartmentId,
    isActive: d.isActive,
  }));

  const flatRows: DepartmentFlatRow[] = filteredDepartments.map((d) => ({
    id: d.id,
    name: d.name,
    branchName: branchNameById.get(d.branchId) ?? "—",
    parentDepartmentName: d.parentDepartmentId
      ? (departmentNameById.get(d.parentDepartmentId) ?? null)
      : null,
    isActive: d.isActive,
  }));

  const treeSelectNodes: TreeSelectNode[] = departments.map((d) => ({
    id: d.id,
    label: d.name,
    parentId: d.parentDepartmentId,
  }));

  const kpis = useMemo(
    () => ({
      total: departments.length,
      active: departments.filter((d) => d.isActive).length,
      inactive: departments.filter((d) => !d.isActive).length,
      root: departments.filter((d) => d.parentDepartmentId === null).length,
    }),
    [departments],
  );

  function handleClearFilters() {
    setSearchText("");
    setBranchFilter(null);
    setStatusFilter(null);
  }

  async function handleSetActive(id: string, active: boolean) {
    const current = departments.find((d) => d.id === id);
    if (!current) return;
    await updateMutation.mutateAsync({
      id,
      name: current.name,
      branchId: current.branchId,
      parentDepartmentId: current.parentDepartmentId,
      isActive: active,
    });
    refetch();
  }

  async function handleDelete(id: string) {
    await deleteMutation.mutateAsync(id);
    refetch();
  }

  async function handleDrawerSubmit(values: DepartmentFormValues, id?: string) {
    if (id) {
      await updateMutation.mutateAsync({ id, ...values });
    } else {
      await createMutation.mutateAsync({
        name: values.name,
        branchId: values.branchId,
        parentDepartmentId: values.parentDepartmentId,
      });
    }
    setDrawerTarget(null);
    refetch();
  }

  async function handleMoveSubmit(id: string, newParentId: string | null) {
    const current = departments.find((d) => d.id === id);
    if (!current) return;
    await updateMutation.mutateAsync({
      id,
      name: current.name,
      branchId: current.branchId,
      parentDepartmentId: newParentId,
      isActive: current.isActive,
    });
    setDrawerTarget(null);
    refetch();
  }

  function renderRowActions(row: { id: string; isActive: boolean }) {
    const hasChildren = (childIdsByParent.get(row.id) ?? []).length > 0;
    const hasAssignedUsers = departmentIdsWithUsers.has(row.id);
    return (
      <DepartmentActionMenu
        departmentId={row.id}
        departmentName={departmentNameById.get(row.id) ?? ""}
        isActive={row.isActive}
        hasChildren={hasChildren}
        hasAssignedUsers={hasAssignedUsers}
        onViewDetails={(id) => setDrawerTarget({ kind: "details", id })}
        onEdit={(id) => setDrawerTarget({ kind: "edit", id })}
        onMove={(id) => setDrawerTarget({ kind: "move", id })}
        onDuplicate={(id) => setDrawerTarget({ kind: "duplicate", id })}
        onSetActive={handleSetActive}
        onDelete={handleDelete}
      />
    );
  }

  const editingDepartment =
    drawerTarget?.kind === "edit" ? departments.find((d) => d.id === drawerTarget.id) : undefined;
  const duplicatingDepartment =
    drawerTarget?.kind === "duplicate"
      ? departments.find((d) => d.id === drawerTarget.id)
      : undefined;
  const movingDepartment =
    drawerTarget?.kind === "move" ? departments.find((d) => d.id === drawerTarget.id) : undefined;
  const detailsDepartment =
    drawerTarget?.kind === "details" ? departments.find((d) => d.id === drawerTarget.id) : undefined;

  return (
    <div className="flex flex-col gap-4 p-6 overflow-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--ink-primary)]">
            {t("departments.list.title")}
          </h1>
          <p className="text-sm text-[var(--ink-tertiary)]">
            {t("departments.list.subtitleCount", { count: kpis.total })}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDrawerTarget({ kind: "create" })}
          className="rounded-[10px] bg-[var(--signal)] px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-[var(--signal-hover)]"
        >
          {t("departments.list.createDepartment")}
        </button>
      </div>

      <DepartmentsKpiRow
        total={kpis.total}
        active={kpis.active}
        inactive={kpis.inactive}
        root={kpis.root}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder={t("departments.list.search.placeholder")}
          className="w-full max-w-sm rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--ink-primary)] placeholder:text-[var(--ink-tertiary)] focus:border-[var(--signal)] focus:outline-none focus:ring-2 focus:ring-[var(--synapse)]/30"
        />

        <div className="flex items-center gap-2">
          <select
            value={branchFilter ?? ""}
            onChange={(e) => setBranchFilter(e.target.value || null)}
            className="rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--ink-primary)]"
          >
            <option value="">{t("departments.list.filters.branch")}</option>
            {branchOptions.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </select>

          <select
            value={statusFilter ?? ""}
            onChange={(e) =>
              setStatusFilter((e.target.value || null) as "active" | "inactive" | null)
            }
            className="rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--ink-primary)]"
          >
            <option value="">{t("departments.list.filters.status")}</option>
            <option value="active">{t("users.status.active")}</option>
            <option value="inactive">{t("users.status.inactive")}</option>
          </select>

          <div className="flex overflow-hidden rounded-[10px] border border-[var(--hairline)]">
            <button
              type="button"
              onClick={() => setViewMode("tree")}
              className={`px-3 py-2 text-sm font-medium ${
                viewMode === "tree"
                  ? "bg-[var(--signal)] text-white"
                  : "bg-[var(--panel)] text-[var(--ink-secondary)] hover:bg-[var(--sunken)]"
              }`}
            >
              {t("departments.list.viewToggle.tree")}
            </button>
            <button
              type="button"
              onClick={() => setViewMode("flat")}
              className={`px-3 py-2 text-sm font-medium ${
                viewMode === "flat"
                  ? "bg-[var(--signal)] text-white"
                  : "bg-[var(--panel)] text-[var(--ink-secondary)] hover:bg-[var(--sunken)]"
              }`}
            >
              {t("departments.list.viewToggle.flat")}
            </button>
          </div>

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

      {viewMode === "tree" ? (
        <DepartmentsTreeTable
          rows={treeRows}
          isLoading={isLoading}
          hasError={isError}
          onRetry={() => refetch()}
          onClearFilters={handleClearFilters}
          isFiltered={isFiltered}
          onRowClick={(row) => setDrawerTarget({ kind: "details", id: row.id })}
          renderRowActions={renderRowActions}
        />
      ) : (
        <DepartmentsFlatTable
          rows={flatRows}
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
      )}

      <DepartmentDrawer
        open={drawerTarget?.kind === "create" || drawerTarget?.kind === "edit" || drawerTarget?.kind === "duplicate"}
        onClose={() => setDrawerTarget(null)}
        initialValues={
          editingDepartment
            ? {
                id: editingDepartment.id,
                name: editingDepartment.name,
                branchId: editingDepartment.branchId,
                parentDepartmentId: editingDepartment.parentDepartmentId,
                isActive: editingDepartment.isActive,
              }
            : null
        }
        duplicateFrom={
          duplicatingDepartment
            ? {
                name: duplicatingDepartment.name,
                branchId: duplicatingDepartment.branchId,
                parentDepartmentId: duplicatingDepartment.parentDepartmentId,
                isActive: duplicatingDepartment.isActive,
              }
            : null
        }
        branchOptions={branchOptions}
        allDepartments={treeSelectNodes}
        onSubmit={handleDrawerSubmit}
      />

      {movingDepartment && (
        <MoveDepartmentDrawer
          open={drawerTarget?.kind === "move"}
          onClose={() => setDrawerTarget(null)}
          departmentId={movingDepartment.id}
          departmentName={movingDepartment.name}
          currentParentId={movingDepartment.parentDepartmentId}
          allDepartments={treeSelectNodes}
          onSubmit={handleMoveSubmit}
        />
      )}

      <DepartmentDetailsDrawer
        open={drawerTarget?.kind === "details"}
        onClose={() => setDrawerTarget(null)}
        department={
          detailsDepartment
            ? {
                id: detailsDepartment.id,
                name: detailsDepartment.name,
                branchName: branchNameById.get(detailsDepartment.branchId) ?? "—",
                parentDepartmentName: detailsDepartment.parentDepartmentId
                  ? (departmentNameById.get(detailsDepartment.parentDepartmentId) ?? null)
                  : null,
                isActive: detailsDepartment.isActive,
              }
            : null
        }
        childDepartments={
          detailsDepartment
            ? (childIdsByParent.get(detailsDepartment.id) ?? []).map((childId) => ({
                id: childId,
                name: departmentNameById.get(childId) ?? "",
              }))
            : []
        }
        onEdit={(id) => setDrawerTarget({ kind: "edit", id })}
        onMove={(id) => setDrawerTarget({ kind: "move", id })}
        onDuplicate={(id) => setDrawerTarget({ kind: "duplicate", id })}
      />
    </div>
  );
}
