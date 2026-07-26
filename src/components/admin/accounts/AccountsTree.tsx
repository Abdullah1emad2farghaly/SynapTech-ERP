// src/components/admin/accounts/AccountsTree.tsx
//
// Builds the tree from the flat Accounts list (parentAccountId), owns
// expand/collapse + selection state, and renders AccountTreeNode
// recursively. Bespoke, not built on the generic DataTable, same
// reasoning as DepartmentsTreeTable — hierarchical data doesn't fit a
// flat paginated-rows model. Loads the full set client-side since
// GET /api/Accounts documents no pagination (org-structure-scale data,
// same assumption as Departments).
//
// Search highlights matches in-place rather than filtering the tree
// structurally — see the design doc's reasoning: losing hierarchy
// context while searching a Chart of Accounts is worse than it was for
// a parent-picker, where flattening on search was the right call.

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AccountTreeNode, type AccountTreeNodeData } from "./AccountTreeNode";

export interface AccountRow {
  id: string;
  code: string;
  name: string;
  accountType: string;
  parentAccountId: string | null;
  isActive: boolean;
}

interface TreeNode extends AccountTreeNodeData {
  parentAccountId: string | null;
  children: TreeNode[];
}

function buildTree(rows: AccountRow[]): TreeNode[] {
  const byId = new Map<string, TreeNode>();
  rows.forEach((row) =>
    byId.set(row.id, {
      id: row.id,
      code: row.code,
      name: row.name,
      accountType: row.accountType,
      isActive: row.isActive,
      parentAccountId: row.parentAccountId,
      childrenCount: 0,
      children: [],
    }),
  );

  const roots: TreeNode[] = [];
  byId.forEach((node) => {
    if (node.parentAccountId && byId.has(node.parentAccountId)) {
      byId.get(node.parentAccountId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });
  byId.forEach((node) => {
    node.childrenCount = node.children.length;
  });

  return roots;
}

// When actively searching, any node whose own text OR any descendant's
// text matches stays visible — this keeps the ancestor chain of a match
// intact so hierarchy context isn't lost, rather than pruning to only
// the exact matching nodes.
function nodeMatchesOrHasMatchingDescendant(node: TreeNode, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const selfMatches =
    node.name.toLowerCase().includes(q) || node.code.toLowerCase().includes(q);
  if (selfMatches) return true;
  return node.children.some((child) => nodeMatchesOrHasMatchingDescendant(child, query));
}

export interface AccountsTreeProps {
  rows: AccountRow[];
  isLoading?: boolean;
  hasError?: boolean;
  onRetry?: () => void;
  searchQuery: string;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

function SkeletonTreeRows() {
  return (
    <>
      {[0, 1, 1, 2, 0, 1].map((depth, i) => (
        <div key={i} className="flex items-center gap-3 border-t border-[var(--hairline)] px-3 py-2.5 first:border-t-0">
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

export function AccountsTree({
  rows,
  isLoading,
  hasError,
  onRetry,
  searchQuery,
  selectedId,
  onSelect,
}: AccountsTreeProps) {
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
    // While searching, auto-expand any node with a matching descendant so
    // the match is actually visible without the person manually expanding
    // every ancestor first.
    const isExpanded = isSearching ? true : !collapsedIds.has(node.id);

    return (
      <AccountTreeNode
        key={node.id}
        node={node}
        depth={depth}
        hasChildren={hasChildren}
        isExpanded={isExpanded}
        isSelected={selectedId === node.id}
        searchQuery={searchQuery}
        onToggleExpand={() => toggleCollapsed(node.id)}
        onSelect={() => onSelect(node.id)}
      >
        {visibleChildren.map((child) => renderNode(child, depth + 1))}
      </AccountTreeNode>
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
          {t("accounts.tree.empty")}
        </p>
      </div>
    );
  }

  if (visibleTree.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-[16px] border border-[var(--hairline)] bg-[var(--panel)] py-10 text-center">
        <p className="text-sm font-medium text-[var(--ink-primary)]">
          {t("accounts.tree.noMatches")}
        </p>
      </div>
    );
  }

  return (
    <div role="tree" className="overflow-hidden rounded-[16px] border border-[var(--hairline)] bg-[var(--panel)]">
      {visibleTree.map((node) => renderNode(node, 0))}
    </div>
  );
}
