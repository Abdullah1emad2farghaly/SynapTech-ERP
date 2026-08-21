// src/pages/admin/categories/CategoriesPage.tsx
//
// The module's only page. Owns local UI state (search, filters, view
// toggle, selection, drawer/dialog targets) and delegates
// fetching/mutations to hooks over services/api — no direct API calls
// here.
//
// Selected category for the split-view Details Panel is driven by a
// ?categoryId= query param (via useSearchParams), not plain useState —
// CategoryDetailsPanel's parent/child links navigate by changing this
// param, so selection has to live in the URL for those links to work
// and for selection to survive a refresh/share, per that component's
// design note.
//
// Delete-blocked (has children) is computed client-side from the full
// loaded list — no cross-module check the way Departments/Branches had,
// since no Products API (or anything else with a categoryId field) is
// confirmed anywhere in this project.

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router";
import toast from "react-hot-toast";
import { RefreshCw, Search, List, GitBranch as TreeIcon } from "lucide-react";
import { CategoriesKpiRow } from "../../../components/admin/categories/CategoriesKpiRow";
import { CategoriesTree } from "../../../components/admin/categories/CategoriesTree";
import { CategoriesTable, type CategoryFlatRow } from "../../../components/admin/categories/CategoriesTable";
import { CategoryDetailsPanel } from "../../../components/admin/categories/CategoryDetailsPanel";
import { CategoryActionMenu } from "../../../components/admin/categories/CategoryActionMenu";
import { CategoryContextMenu } from "../../../components/admin/categories/CategoryContextMenu";
import { CategoryDrawer, type CategoryFormValues } from "../../../components/admin/categories/CategoryDrawer";
import { MoveCategoryDrawer } from "../../../components/admin/categories/MoveCategoryDrawer";
import { BulkStatusToolbar } from "../../../components/admin/categories/BulkStatusToolbar";
import { ConfirmationDialog } from "../../../components/common/ConfirmationDialog";
import type { TreeSelectNode } from "../../../components/common/TreeSelect";

import {
  useCategoriesList,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "../../../hooks/useCategories.crud";
import axios from "axios";
import { handleErrors } from "@/utils/HandleErrors";
import { hasAnyPermission } from "@/utils/permissions";
import { getUserPermissions } from "@/pages/common/LoginPage";

type ViewMode = "tree" | "table";
type DrawerTarget =
  | { kind: "create"; presetParentId?: string | null }
  | { kind: "edit"; id: string }
  | { kind: "move"; id: string }
  | null;
type ConfirmTarget = { kind: "deactivate" | "delete"; id: string } | null;

export function CategoriesPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<"active" | "inactive" | null>(null);
  const [hierarchyFilter, setHierarchyFilter] = useState<"root" | "child" | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("tree");
  const [sortColumnId, setSortColumnId] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [drawerTarget, setDrawerTarget] = useState<DrawerTarget>(null);
  const [confirmTarget, setConfirmTarget] = useState<ConfirmTarget>(null);
  const [isConfirmSubmitting, setIsConfirmSubmitting] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    id: string;
    position: { x: number; y: number };
  } | null>(null);

  const selectedCategoryId = searchParams.get("categoryId");

  const { data: categories = [], isLoading, isError, refetch } = useCategoriesList();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const canManageAccess = hasAnyPermission(["inventory.categories.manage"], getUserPermissions())

  const categoryById = useMemo(() => {
    const map = new Map<string, (typeof categories)[number]>();
    categories.forEach((c) => map.set(c.id, c));
    return map;
  }, [categories]);

  const childIdsByParent = useMemo(() => {
    const map = new Map<string, string[]>();
    categories.forEach((c) => {
      if (!c.parentCategoryId) return;
      const siblings = map.get(c.parentCategoryId) ?? [];
      siblings.push(c.id);
      map.set(c.parentCategoryId, siblings);
    });
    return map;
  }, [categories]);

  const depthById = useMemo(() => {
    const map = new Map<string, number>();
    function computeDepth(id: string): number {
      if (map.has(id)) return map.get(id)!;
      const cat = categoryById.get(id);
      const depth = cat?.parentCategoryId ? computeDepth(cat.parentCategoryId) + 1 : 0;
      map.set(id, depth);
      return depth;
    }
    categories.forEach((c) => computeDepth(c.id));
    return map;
  }, [categories, categoryById]);

  const isFiltered =
    searchText.trim().length > 0 || statusFilter !== null || hierarchyFilter !== null;

  const filteredCategories = useMemo(() => {
    return categories.filter((c) => {
      if (searchText.trim() && !c.name.toLowerCase().includes(searchText.trim().toLowerCase())) {
        return false;
      }
      if (statusFilter === "active" && !c.isActive) return false;
      if (statusFilter === "inactive" && c.isActive) return false;
      if (hierarchyFilter === "root" && c.parentCategoryId) return false;
      if (hierarchyFilter === "child" && !c.parentCategoryId) return false;
      return true;
    });
  }, [categories, searchText, statusFilter, hierarchyFilter]);

  const kpis = useMemo(
    () => ({
      total: categories.length,
      root: categories.filter((c) => !c.parentCategoryId).length,
      child: categories.filter((c) => !!c.parentCategoryId).length,
      active: categories.filter((c) => c.isActive).length,
      inactive: categories.filter((c) => !c.isActive).length,
    }),
    [categories],
  );

  const treeSelectNodes: TreeSelectNode[] = categories.map((c) => ({
    id: c.id,
    label: c.name,
    parentId: c.parentCategoryId,
  }));

  const selectedCategory = selectedCategoryId ? categoryById.get(selectedCategoryId) : undefined;
  const detailsData = selectedCategory
    ? {
      id: selectedCategory.id,
      name: selectedCategory.name,
      isActive: selectedCategory.isActive,
      parent: selectedCategory.parentCategoryId
        ? (() => {
          const p = categoryById.get(selectedCategory.parentCategoryId!);
          return p ? { id: p.id, name: p.name } : null;
        })()
        : null,
      children: (childIdsByParent.get(selectedCategory.id) ?? []).map((childId) => {
        const child = categoryById.get(childId)!;
        return { id: child.id, name: child.name };
      }),
    }
    : null;

  const tableRows: CategoryFlatRow[] = filteredCategories.map((c) => ({
    id: c.id,
    name: c.name,
    parentName: c.parentCategoryId ? (categoryById.get(c.parentCategoryId)?.name ?? null) : null,
    hierarchyLevel: depthById.get(c.id) ?? 0,
    isActive: c.isActive,
    childrenCount: (childIdsByParent.get(c.id) ?? []).length,
  }));

  function handleSelect(id: string) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("categoryId", id);
      return next;
    });
  }

  function handleClearFilters() {
    setSearchText("");
    setStatusFilter(null);
    setHierarchyFilter(null);
  }

  async function handleSetActive(id: string, active: boolean) {
    const current = categoryById.get(id);
    if (!current) return;
    await updateMutation.mutateAsync({
      id,
      name: current.name,
      parentCategoryId: current.parentCategoryId,
      isActive: active,
    });
    refetch();
  }

  async function handleDrawerSubmit(values: CategoryFormValues, id?: string) {
    try {
      if (id) {
        await updateMutation.mutateAsync({ id, ...values });
      } else {
        await createMutation.mutateAsync({
          name: values.name,
          parentCategoryId: values.parentCategoryId,
        });
      }
      setDrawerTarget(null);
      refetch();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        handleErrors(error.response?.data.errors)
      }
    }
  }

  async function handleMoveSubmit(id: string, newParentId: string | null) {
    const current = categoryById.get(id);
    if (!current) return;
    await updateMutation.mutateAsync({
      id,
      name: current.name,
      parentCategoryId: newParentId,
      isActive: current.isActive,
    });
    setDrawerTarget(null);
    refetch();
  }

  function requestDeactivate(id: string) {
    setConfirmTarget({ kind: "deactivate", id });
  }

  function requestDelete(id: string) {
    const hasChildren = (childIdsByParent.get(id) ?? []).length > 0;
    if (hasChildren) {
      toast.error(t("categories.dialogs.delete.blockedHasChildren"));
      return;
    }
    setConfirmTarget({ kind: "delete", id });
  }

  async function handleConfirm() {
    if (!confirmTarget) return;
    setIsConfirmSubmitting(true);
    try {
      if (confirmTarget.kind === "deactivate") {
        await handleSetActive(confirmTarget.id, false);
        toast.success(
          t("categories.toast.deactivated", { name: categoryById.get(confirmTarget.id)?.name ?? "" }),
        );
      } else {
        await deleteMutation.mutateAsync(confirmTarget.id);
        toast.success(
          t("categories.toast.deleted", { name: categoryById.get(confirmTarget.id)?.name ?? "" }),
        );
        if (selectedCategoryId === confirmTarget.id) {
          setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.delete("categoryId");
            return next;
          });
        }
        refetch();
      }
      setConfirmTarget(null);
    } finally {
      setIsConfirmSubmitting(false);
    }
  }

  async function handleBulkActivate() {
    await Promise.all(
      Array.from(selectedIds).map((id) => handleSetActive(id, true)),
    );
    refetch();
  }

  async function handleBulkDeactivate() {
    await Promise.all(
      Array.from(selectedIds).map((id) => handleSetActive(id, false)),
    );
    refetch();
  }

  function renderRowActions(row: { id: string; isActive: boolean }) {
    const hasChildren = (childIdsByParent.get(row.id) ?? []).length > 0;
    return (
      <CategoryActionMenu
        categoryId={row.id}
        categoryName={categoryById.get(row.id)?.name ?? ""}
        isActive={row.isActive}
        deleteDisabled={hasChildren}
        deleteDisabledReason={hasChildren ? t("categories.dialogs.delete.blockedHasChildren") : undefined}
        onViewDetails={handleSelect}
        onEdit={(id) => setDrawerTarget({ kind: "edit", id })}
        onMove={(id) => setDrawerTarget({ kind: "move", id })}
        onAddChild={(parentId) => setDrawerTarget({ kind: "create", presetParentId: parentId })}
        onSetActive={handleSetActive}
        onDeactivateRequest={requestDeactivate}
        onDeleteRequest={requestDelete}
      />
    );
  }

  const editingCategory = drawerTarget?.kind === "edit" ? categoryById.get(drawerTarget.id) : undefined;
  const movingCategory = drawerTarget?.kind === "move" ? categoryById.get(drawerTarget.id) : undefined;
  const contextMenuCategory = contextMenu ? categoryById.get(contextMenu.id) : undefined;
  const contextMenuHasChildren = contextMenu
    ? (childIdsByParent.get(contextMenu.id) ?? []).length > 0
    : false;

  return (
    <div className="flex flex-col gap-4 md:p-6 py-6 px-2">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--ink-primary)]">
            {t("categories.list.title")}
          </h1>
          <p className="text-sm text-[var(--ink-tertiary)]">
            {t("categories.list.subtitleCount", { count: kpis.total })}
          </p>
        </div>
        {
          canManageAccess && (
            <button
              type="button"
              onClick={() => setDrawerTarget({ kind: "create" })}
              className="rounded-[10px] bg-[var(--signal)] px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-[var(--signal-hover)]"
            >
              {t("categories.list.createCategory")}
            </button>
          )
        }
      </div>

      <CategoriesKpiRow
        total={kpis.total}
        root={kpis.root}
        child={kpis.child}
        active={kpis.active}
        inactive={kpis.inactive}
      />

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
            placeholder={t("categories.list.search.placeholder")}
            className="w-full rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] py-2 ps-9 pe-3 text-sm text-[var(--ink-primary)] placeholder:text-[var(--ink-tertiary)] focus:border-[var(--signal)] focus:outline-none focus:ring-2 focus:ring-[var(--synapse)]/30"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter ?? ""}
            onChange={(e) =>
              setStatusFilter((e.target.value || null) as "active" | "inactive" | null)
            }
            className="rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--ink-primary)]"
          >
            <option value="">{t("categories.list.filters.status")}</option>
            <option value="active">{t("users.status.active")}</option>
            <option value="inactive">{t("users.status.inactive")}</option>
          </select>

          <select
            value={hierarchyFilter ?? ""}
            onChange={(e) =>
              setHierarchyFilter((e.target.value || null) as "root" | "child" | null)
            }
            className="rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--ink-primary)]"
          >
            <option value="">{t("categories.list.filters.hierarchy")}</option>
            <option value="root">{t("categories.kpi.root")}</option>
            <option value="child">{t("categories.kpi.child")}</option>
          </select>

          <div className="flex overflow-hidden rounded-[10px] border border-[var(--hairline)]">
            <button
              type="button"
              onClick={() => setViewMode("tree")}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium ${viewMode === "tree"
                ? "bg-[var(--signal)] text-white"
                : "bg-[var(--panel)] text-[var(--ink-secondary)] hover:bg-[var(--sunken)]"
                }`}
            >
              <TreeIcon size={14} />
              {t("categories.list.viewToggle.tree")}
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium ${viewMode === "table"
                ? "bg-[var(--signal)] text-white"
                : "bg-[var(--panel)] text-[var(--ink-secondary)] hover:bg-[var(--sunken)]"
                }`}
            >
              <List size={14} />
              {t("categories.list.viewToggle.table")}
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
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <CategoriesTree
            rows={filteredCategories.map((c) => ({
              id: c.id,
              name: c.name,
              parentCategoryId: c.parentCategoryId,
              isActive: c.isActive,
            }))}
            isLoading={isLoading}
            hasError={isError}
            onRetry={() => refetch()}
            isFiltered={isFiltered}
            onClearFilters={handleClearFilters}
            searchQuery={searchText}
            selectedId={selectedCategoryId}
            onSelect={handleSelect}
            onContextMenuRequest={(id, e) =>
              setContextMenu({ id, position: { x: e.clientX, y: e.clientY } })
            }
            renderRowActions={renderRowActions}
          />

          <CategoryDetailsPanel category={detailsData} />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <BulkStatusToolbar
            selectedCount={selectedIds.size}
            onClearSelection={() => setSelectedIds(new Set())}
            onActivateSelected={handleBulkActivate}
            onDeactivateSelected={handleBulkDeactivate}
          />
          <CategoriesTable
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
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            onRowClick={(row) => handleSelect(row.id)}
            renderRowActions={renderRowActions}
            canManageAccess={canManageAccess}
          />
        </div>
      )}

      <CategoryDrawer
        open={drawerTarget?.kind === "create" || drawerTarget?.kind === "edit"}
        onClose={() => setDrawerTarget(null)}
        initialValues={
          editingCategory
            ? {
              id: editingCategory.id,
              name: editingCategory.name,
              parentCategoryId: editingCategory.parentCategoryId,
              isActive: editingCategory.isActive,
            }
            : null
        }
        presetParentId={drawerTarget?.kind === "create" ? drawerTarget.presetParentId : null}
        allCategories={treeSelectNodes}
        onSubmit={handleDrawerSubmit}
      />

      {movingCategory && (
        <MoveCategoryDrawer
          open={drawerTarget?.kind === "move"}
          onClose={() => setDrawerTarget(null)}
          categoryId={movingCategory.id}
          categoryName={movingCategory.name}
          currentParentId={movingCategory.parentCategoryId}
          allCategories={treeSelectNodes}
          onSubmit={handleMoveSubmit}
        />
      )}

      <ConfirmationDialog
        open={confirmTarget?.kind === "deactivate"}
        tone="neutral"
        title={t("categories.dialogs.deactivate.title")}
        body={t("categories.dialogs.deactivate.body")}
        confirmLabel={t("categories.actions.deactivate")}
        cancelLabel={t("users.actions.cancel")}
        isSubmitting={isConfirmSubmitting}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmTarget(null)}
      />

      <ConfirmationDialog
        open={confirmTarget?.kind === "delete"}
        tone="destructive"
        title={t("categories.dialogs.delete.title")}
        body={t("categories.dialogs.delete.body", {
          name: confirmTarget ? (categoryById.get(confirmTarget.id)?.name ?? "") : "",
        })}
        confirmLabel={t("categories.actions.delete")}
        cancelLabel={t("users.actions.cancel")}
        isSubmitting={isConfirmSubmitting}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmTarget(null)}
      />

      {contextMenu && contextMenuCategory && (
        <CategoryContextMenu
          open={true}
          position={contextMenu.position}
          categoryId={contextMenuCategory.id}
          categoryName={contextMenuCategory.name}
          isActive={contextMenuCategory.isActive}
          deleteDisabled={contextMenuHasChildren}
          deleteDisabledReason={
            contextMenuHasChildren ? t("categories.dialogs.delete.blockedHasChildren") : undefined
          }
          onClose={() => setContextMenu(null)}
          onViewDetails={handleSelect}
          onEdit={(id) => setDrawerTarget({ kind: "edit", id })}
          onMove={(id) => setDrawerTarget({ kind: "move", id })}
          onAddChild={(parentId) => setDrawerTarget({ kind: "create", presetParentId: parentId })}
          onSetActive={handleSetActive}
          onDeactivateRequest={requestDeactivate}
          onDeleteRequest={requestDelete}
        />
      )}
    </div>
  );
}
