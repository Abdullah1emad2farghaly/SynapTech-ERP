// src/components/admin/categories/CategoriesTree.tsx
//
// Builds the tree from the flat Categories list (parentCategoryId), owns
// expand/collapse + selection state — same approach as AccountsTree
// (client-built, in-place search highlight + auto-expand matching
// branches), adapted with a renderActions slot per row for the
// three-dot menu (CategoryActionMenu, built separately so this tree
// doesn't own menu logic) and an onContextMenu passthrough for
// right-click support.

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { CategoryTreeNode, type CategoryTreeNodeData } from "./CategoryTreeNode";

export interface CategoryRow {
  id: string;
  name: string;
  parentCategoryId: string | null;
  isActive: boolean;
}

interface TreeNode extends CategoryTreeNodeData {
  parentCategoryId: string | null;
  children: TreeNode[];
}

function buildTree(rows: CategoryRow[]): TreeNode[] {
  const byId = new Map<string, TreeNode>();
  rows.forEach((row) =>
    byId.set(row.id, {
      id: row.id,
      name: row.name,
      isActive: row.isActive,
      parentCategoryId: row.parentCategoryId,
      childrenCount: 0,
      children: [],
    }),
  );

  const roots: TreeNode[] = [];
  byId.forEach((node) => {
    if (node.parentCategoryId && byId.has(node.parentCategoryId)) {
      byId.get(node.parentCategoryId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });
  byId.forEach((node) => {
    node.childrenCount = node.children.length;
  });

  return roots;
}

function nodeMatchesOrHasMatchingDescendant(node: TreeNode, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (node.name.toLowerCase().includes(q)) return true;
  return node.children.some((child) => nodeMatchesOrHasMatchingDescendant(child, query));
}

export interface CategoriesTreeProps {
  rows: CategoryRow[];
  isLoading?: boolean;
  hasError?: boolean;
  onRetry?: () => void;
  isFiltered?: boolean;
  onClearFilters?: () => void;
  searchQuery: string;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onContextMenuRequest?: (id: string, e: React.MouseEvent) => void;
  renderRowActions?: (row: CategoryRow) => React.ReactNode;
}

function SkeletonTreeRows() {
  return (
    <>
      {[0, 1, 1, 2, 0, 1].map((depth, i) => (
        <div
          key={i}
          className="flex items-center gap-3 border-t border-[var(--hairline)] px-3 py-2.5 first:border-t-0"
        >
          <div
            className="h-4 flex-1 max-w-[200px] animate-pulse rounded-[6px] bg-[var(--sunken)]"
            style={{ marginInlineStart: `${depth * 18}px` }}
          />
          <div className="h-4 w-16 animate-pulse rounded-[6px] bg-[var(--sunken)]" />
        </div>
      ))}
    </>
  );
}

export function CategoriesTree({
  rows,
  isLoading,
  hasError,
  onRetry,
  isFiltered,
  onClearFilters,
  searchQuery,
  selectedId,
  onSelect,
  onContextMenuRequest,
  renderRowActions,
}: CategoriesTreeProps) {
  const { t } = useTranslation();
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());

  const tree = useMemo(() => buildTree(rows), [rows]);

  const visibleTree = useMemo(() => {
    if (!searchQuery.trim()) return tree;
    return tree.filter((node) => nodeMatchesOrHasMatchingDescendant(node, searchQuery));
  }, [tree, searchQuery]);

  function toggleCollapsed(id: string) {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function renderNode(node: TreeNode, depth: number): React.ReactNode {
    const isSearching = searchQuery.trim().length > 0;
    const visibleChildren = isSearching
      ? node.children.filter((child) => nodeMatchesOrHasMatchingDescendant(child, searchQuery))
      : node.children;
    const hasChildren = node.children.length > 0;
    const isExpanded = isSearching ? true : !collapsedIds.has(node.id);

    const row: CategoryRow = {
      id: node.id,
      name: node.name,
      parentCategoryId: node.parentCategoryId,
      isActive: node.isActive,
    };

    return (
      <CategoryTreeNode
        key={node.id}
        node={node}
        depth={depth}
        hasChildren={hasChildren}
        isExpanded={isExpanded}
        isSelected={selectedId === node.id}
        searchQuery={searchQuery}
        onToggleExpand={() => toggleCollapsed(node.id)}
        onSelect={() => onSelect(node.id)}
        onContextMenu={
          onContextMenuRequest
            ? (e) => {
                e.preventDefault();
                onContextMenuRequest(node.id, e);
              }
            : undefined
        }
        renderActions={renderRowActions ? () => renderRowActions(row) : undefined}
      >
        {visibleChildren.map((child) => renderNode(child, depth + 1))}
      </CategoryTreeNode>
    );
  }

  if (hasError) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-[16px] border border-[var(--hairline)] bg-[var(--panel)] py-10 text-center">
        <p className="text-sm font-medium text-[var(--error)]">{t("common.errors.loadFailed")}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="text-sm text-[var(--signal)] hover:text-[var(--signal-hover)]"
          >
            {t("common.actions.retry")}
          </button>
        )}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-[16px] border border-[var(--hairline)] bg-[var(--panel)]">
        <SkeletonTreeRows />
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-[16px] border border-[var(--hairline)] bg-[var(--panel)] py-10 text-center">
        <p className="text-sm font-medium text-[var(--ink-primary)]">
          {isFiltered ? t("categories.list.empty.noMatches") : t("categories.list.empty.noCategories")}
        </p>
        {isFiltered && onClearFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="text-sm text-[var(--signal)] hover:text-[var(--signal-hover)]"
          >
            {t("categories.list.empty.clearFilters")}
          </button>
        )}
      </div>
    );
  }

  if (visibleTree.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-[16px] border border-[var(--hairline)] bg-[var(--panel)] py-10 text-center">
        <p className="text-sm font-medium text-[var(--ink-primary)]">
          {t("categories.list.empty.noMatches")}
        </p>
      </div>
    );
  }

  return (
    <div
      role="tree"
      className="overflow-y-auto rounded-[16px] border border-[var(--hairline)] bg-[var(--panel)]"
    >
      {visibleTree.map((node) => renderNode(node, 0))}
    </div>
  );
}
