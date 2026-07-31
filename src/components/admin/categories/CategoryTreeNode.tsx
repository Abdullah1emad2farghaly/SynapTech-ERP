// src/components/admin/categories/CategoryTreeNode.tsx
//
// One row in the Category tree, adapted from AccountTreeNode's visual
// treatment (connector lines, in-place search highlight) but with a
// three-dot menu slot instead of always-visible action buttons — the
// brief specifically asked for a three-dot + right-click menu here,
// matching a Notion/VS Code Explorer feel rather than Accounts' inline
// button row.

import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { StatusBadge } from "../../common/StatusBadge";

export interface CategoryTreeNodeData {
  id: string;
  name: string;
  isActive: boolean;
  childrenCount: number;
}

export interface CategoryTreeNodeProps {
  node: CategoryTreeNodeData;
  depth: number;
  hasChildren: boolean;
  isExpanded: boolean;
  isSelected: boolean;
  searchQuery: string;
  onToggleExpand: () => void;
  onSelect: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  /** Rendered as the row's three-dot menu — kept as a slot so this component doesn't own menu logic. */
  renderActions?: () => React.ReactNode;
  children?: React.ReactNode;
}

function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const index = text.toLowerCase().indexOf(query.trim().toLowerCase());
  if (index === -1) return <>{text}</>;

  const before = text.slice(0, index);
  const match = text.slice(index, index + query.trim().length);
  const after = text.slice(index + query.trim().length);

  return (
    <>
      {before}
      <mark className="rounded-[3px] bg-[var(--synapse)]/30 text-inherit">{match}</mark>
      {after}
    </>
  );
}

export function CategoryTreeNode({
  node,
  depth,
  hasChildren,
  isExpanded,
  isSelected,
  searchQuery,
  onToggleExpand,
  onSelect,
  onContextMenu,
  renderActions,
  children,
}: CategoryTreeNodeProps) {
  const { t } = useTranslation();

  return (
    <div role="treeitem" aria-expanded={hasChildren ? isExpanded : undefined} aria-level={depth + 1}>
      <div
        onClick={onSelect}
        onContextMenu={onContextMenu}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect();
          }
        }}
        className={`relative flex cursor-pointer items-center gap-2 border-t border-[var(--hairline)] px-3 py-2.5 transition-colors duration-150 first:border-t-0 hover:bg-[var(--sunken)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--synapse)] ${
          isSelected ? "bg-[var(--sunken)]" : ""
        }`}
      >
        <div
          className="flex flex-1 items-center gap-2 min-w-0"
          style={{ paddingInlineStart: `${depth * 18}px` }}
        >
          {depth > 0 && (
            <span
              className="absolute top-0 h-full border-s border-[var(--hairline)]"
              style={{ insetInlineStart: `${(depth - 1) * 18 + 21}px` }}
              aria-hidden="true"
            />
          )}

          {hasChildren ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand();
              }}
              aria-label={isExpanded ? "Collapse" : "Expand"}
              className="z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-[4px] text-[var(--ink-secondary)] hover:bg-[var(--panel)]"
            >
              <ChevronRight
                size={14}
                className={`shrink-0 transition-transform duration-150 rtl:rotate-180 ${
                  isExpanded ? "rotate-90 rtl:rotate-90" : ""
                }`}
              />
            </button>
          ) : (
            <span className="z-10 h-5 w-5 shrink-0" aria-hidden="true" />
          )}

          <span className="z-10 truncate font-medium text-[var(--ink-primary)]">
            <HighlightedText text={node.name} query={searchQuery} />
          </span>
        </div>

        <StatusBadge
          status={node.isActive ? "active" : "inactive"}
          label={node.isActive ? t("users.status.active") : t("users.status.inactive")}
        />
        {node.childrenCount > 0 && (
          <span className="shrink-0 text-xs text-[var(--ink-tertiary)]">{node.childrenCount}</span>
        )}

        {renderActions && (
          <div className="z-10 shrink-0" onClick={(e) => e.stopPropagation()}>
            {renderActions()}
          </div>
        )}
      </div>

      {hasChildren && isExpanded && <div role="group">{children}</div>}
    </div>
  );
}
