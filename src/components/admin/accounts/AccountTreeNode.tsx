// src/components/admin/accounts/AccountTreeNode.tsx
//
// One row in the Chart of Accounts tree, including its own connector line
// and children. Split out from AccountsTree so the recursive render and
// the tree-building/state logic aren't in the same file — AccountsTree
// owns expand/collapse + selection state, this component just renders
// one node given its computed depth and children.
//
// Search highlighting is in-place (bold/marked matching substring),
// never structural filtering — browsing the full hierarchy while
// searching has more value here than for a parent-picker, per the design
// doc's explicit reasoning for choosing this over TreeSelect's
// flatten-on-search behavior.

import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { StatusBadge } from "../../common/StatusBadge";
import { AccountTypeBadge } from "../../common/AccountTypeBadge";

export interface AccountTreeNodeData {
  id: string;
  code: string;
  name: string;
  accountType: string;
  isActive: boolean;
  childrenCount: number;
}

export interface AccountTreeNodeProps {
  node: AccountTreeNodeData;
  depth: number;
  hasChildren: boolean;
  isExpanded: boolean;
  isSelected: boolean;
  searchQuery: string;
  onToggleExpand: () => void;
  onSelect: () => void;
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

export function AccountTreeNode({
  node,
  depth,
  hasChildren,
  isExpanded,
  isSelected,
  searchQuery,
  onToggleExpand,
  onSelect,
  children,
}: AccountTreeNodeProps) {
  const { t } = useTranslation();

  return (
    <div role="treeitem" aria-expanded={hasChildren ? isExpanded : undefined} aria-level={depth + 1}>
      <div
        onClick={onSelect}
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
          {/* Connector line for non-root nodes */}
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

          <span className="z-10 shrink-0 font-mono text-xs text-[var(--ink-tertiary)]">
            <HighlightedText text={node.code} query={searchQuery} />
          </span>
          <span className="z-10 truncate font-medium text-[var(--ink-primary)]">
            <HighlightedText text={node.name} query={searchQuery} />
          </span>
        </div>

        <AccountTypeBadge accountType={node.accountType} />
        <StatusBadge
          status={node.isActive ? "active" : "inactive"}
          label={node.isActive ? t("users.status.active") : t("users.status.inactive")}
        />
        {node.childrenCount > 0 && (
          <span className="shrink-0 text-xs text-[var(--ink-tertiary)]">
            {node.childrenCount}
          </span>
        )}
      </div>

      {hasChildren && isExpanded && <div role="group">{children}</div>}
    </div>
  );
}
