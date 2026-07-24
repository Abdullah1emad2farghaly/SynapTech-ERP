// src/components/admin/departments/DepartmentsTreeTable.tsx
//
// The default view for the Departments module. Built independently of the
// generic DataTable — a tree doesn't fit a flat, server-paginated rows
// model, and GET /api/Departments returns the full set with no documented
// pagination anyway (org-structure data, not user-record scale). This
// component owns expand/collapse state locally; the parent page owns
// which department is "selected" for drawers/dialogs.
//
// Accessibility: proper ARIA tree semantics (role="tree"/"treeitem",
// aria-expanded, aria-level) rather than relying on visual indentation
// alone, per the design doc's accessibility notes.

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronRight } from "lucide-react";
import { StatusBadge } from "../../common/StatusBadge";

export interface DepartmentRow {
  id: string;
  name: string;
  branchName: string;
  parentDepartmentId: string | null;
  isActive: boolean;
}

interface TreeNode extends DepartmentRow {
  depth: number;
  children: TreeNode[];
}

function buildTree(rows: DepartmentRow[]): TreeNode[] {
  const byId = new Map<string, TreeNode>();
  rows.forEach((row) => byId.set(row.id, { ...row, depth: 0, children: [] }));

  const roots: TreeNode[] = [];
  byId.forEach((node) => {
    if (node.parentDepartmentId && byId.has(node.parentDepartmentId)) {
      byId.get(node.parentDepartmentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  function assignDepth(nodes: TreeNode[], depth: number) {
    for (const node of nodes) {
      node.depth = depth;
      assignDepth(node.children, depth + 1);
    }
  }
  assignDepth(roots, 0);

  return roots;
}

export interface DepartmentsTreeTableProps {
  rows: DepartmentRow[];
  isLoading?: boolean;
  hasError?: boolean;
  onRetry?: () => void;
  onClearFilters?: () => void;
  isFiltered?: boolean;
  onRowClick?: (row: DepartmentRow) => void;
  renderRowActions?: (row: DepartmentRow) => React.ReactNode;
}

function SkeletonTreeRows() {
  return (
    <>
      {[0, 1, 1, 2, 0, 1].map((depth, i) => (
        <div key={i} className="flex items-center gap-3 border-t border-[var(--hairline)] px-4 py-3">
          <div
            className="h-4 flex-1 max-w-[220px] animate-pulse rounded-[6px] bg-[var(--sunken)]"
            style={{ marginInlineStart: `${depth * 20}px` }}
          />
          <div className="h-4 w-24 animate-pulse rounded-[6px] bg-[var(--sunken)]" />
          <div className="h-4 w-16 animate-pulse rounded-[6px] bg-[var(--sunken)]" />
        </div>
      ))}
    </>
  );
}

export function DepartmentsTreeTable({
  rows,
  isLoading,
  hasError,
  onRetry,
  onClearFilters,
  isFiltered,
  onRowClick,
  renderRowActions,
}: DepartmentsTreeTableProps) {
  const { t } = useTranslation();
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());

  const tree = useMemo(() => buildTree(rows), [rows]);

  function toggleCollapsed(id: string) {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function renderNode(node: TreeNode, level: number): React.ReactNode {
    const hasChildren = node.children.length > 0;
    const isCollapsed = collapsedIds.has(node.id);

    return (
      <div key={node.id} role="treeitem" aria-expanded={hasChildren ? !isCollapsed : undefined} aria-level={level + 1}>
        <div
          onClick={() => onRowClick?.(node)}
          className={`flex items-center gap-3 border-t border-[var(--hairline)] px-4 py-3 transition-colors duration-150 hover:bg-[var(--sunken)] ${
            onRowClick ? "cursor-pointer" : ""
          }`}
        >
          <div
            className="flex flex-1 items-center gap-2 min-w-0"
            style={{ paddingInlineStart: `${level * 20}px` }}
          >
            {hasChildren ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCollapsed(node.id);
                }}
                aria-label={isCollapsed ? "Expand" : "Collapse"}
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[4px] text-[var(--ink-secondary)] hover:bg-[var(--panel)]"
              >
                <ChevronRight
                  size={14}
                  className={`shrink-0 transition-transform duration-150 rtl:rotate-180 ${
                    !isCollapsed ? "rotate-90 rtl:rotate-90" : ""
                  }`}
                />
              </button>
            ) : (
              <span className="h-5 w-5 shrink-0" aria-hidden="true" />
            )}
            <span className="truncate font-medium text-[var(--ink-primary)]">{node.name}</span>
          </div>

          <span className="w-32 shrink-0 truncate text-sm text-[var(--ink-secondary)]">
            {node.branchName}
          </span>

          <span className="w-24 shrink-0">
            <StatusBadge
              status={node.isActive ? "active" : "inactive"}
              label={node.isActive ? t("users.status.active") : t("users.status.inactive")}
            />
          </span>

          <span className="w-10 shrink-0" onClick={(e) => e.stopPropagation()}>
            {renderRowActions?.(node)}
          </span>
        </div>

        {hasChildren && !isCollapsed && (
          <div role="group">
            {node.children.map((child) => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="rounded-[16px] border border-[var(--hairline)] px-4 py-10 text-center">
        <p className="font-medium text-[var(--error)]">{t("common.errors.loadFailed")}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-2 text-sm text-[var(--signal)] hover:text-[var(--signal-hover)]"
          >
            {t("common.actions.retry")}
          </button>
        )}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-[16px] border border-[var(--hairline)]">
        <SkeletonTreeRows />
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-[16px] border border-[var(--hairline)] px-4 py-10 text-center">
        <p className="font-medium text-[var(--ink-primary)]">
          {isFiltered ? t("departments.list.empty.noMatches") : t("departments.list.empty.noDepartments")}
        </p>
        {isFiltered && onClearFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="mt-2 text-sm text-[var(--signal)] hover:text-[var(--signal-hover)]"
          >
            {t("departments.list.empty.clearFilters")}
          </button>
        )}
      </div>
    );
  }

  return (
    <div role="tree" className="overflow-y-auto rounded-[16px] border border-[var(--hairline)]">
      <div className="flex items-center gap-3 bg-[var(--sunken)] px-4 py-3 text-xs font-medium text-[var(--ink-secondary)]">
        <span className="flex-1">{t("departments.column.department")}</span>
        <span className="w-32 shrink-0">{t("departments.column.branch")}</span>
        <span className="w-24 shrink-0">{t("departments.column.status")}</span>
        <span className="w-10 shrink-0" />
      </div>
      {tree.map((node) => renderNode(node, 0))}
    </div>
  );
}
