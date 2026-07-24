// src/components/common/TreeSelect.tsx
//
// Generic, presentation-only single-select hierarchical picker. Built for
// the Departments module's Parent Department field and Move flow, but
// kept generic (no Department-specific types) so any future hierarchical
// picker (e.g. an Org Chart elsewhere) can reuse it.
//
// Renders a searchable, indented list built from a flat array of nodes
// carrying their own parent references — the caller (Departments module)
// is responsible for building this array from the loaded department set
// and for excluding self/descendants before it ever reaches this
// component (see the "excludedIds" prop, which this component treats as
// authoritative — it doesn't recompute the exclusion itself).

import { useMemo, useState } from "react";
import { Search, ChevronRight } from "lucide-react";

export interface TreeSelectNode {
  id: string;
  label: string;
  parentId: string | null;
}

export interface TreeSelectProps {
  nodes: TreeSelectNode[];
  /** Currently selected node id, or null for "no parent / none". */
  value: string | null;
  onChange: (value: string | null) => void;
  searchPlaceholder: string;
  /** Label for the "no parent" option at the top of the list. */
  noneLabel: string;
  /**
   * Ids to hide entirely (not just disable) — e.g. the department being
   * moved and all of its descendants, computed by the caller. Rendering
   * them as visibly-disabled-but-present would raise a "why can't I pick
   * this" question with no explanation; omitting them avoids that.
   */
  excludedIds?: Set<string>;
  emptyResultsLabel?: string;
}

interface TreeRow extends TreeSelectNode {
  depth: number;
}

function buildVisibleRows(
  nodes: TreeSelectNode[],
  excludedIds: Set<string>,
): TreeRow[] {
  const byParent = new Map<string | null, TreeSelectNode[]>();
  for (const node of nodes) {
    if (excludedIds.has(node.id)) continue;
    const key = node.parentId;
    const siblings = byParent.get(key) ?? [];
    siblings.push(node);
    byParent.set(key, siblings);
  }

  const rows: TreeRow[] = [];
  function walk(parentId: string | null, depth: number) {
    const children = byParent.get(parentId) ?? [];
    for (const child of children) {
      rows.push({ ...child, depth });
      walk(child.id, depth + 1);
    }
  }
  walk(null, 0);
  return rows;
}

export function TreeSelect({
  nodes,
  value,
  onChange,
  searchPlaceholder,
  noneLabel,
  excludedIds = new Set(),
  emptyResultsLabel = "No results",
}: TreeSelectProps) {
  const [query, setQuery] = useState("");

  const allRows = useMemo(() => buildVisibleRows(nodes, excludedIds), [nodes, excludedIds]);

  // Search flattens the tree — when actively searching, hierarchy depth
  // stops being useful (results may span many branches), so matches are
  // shown as a flat, filtered list instead of a pruned tree.
  const filteredRows = useMemo(() => {
    if (!query.trim()) return allRows;
    const q = query.trim().toLowerCase();
    return allRows
      .filter((row) => row.label.toLowerCase().includes(q))
      .map((row) => ({ ...row, depth: 0 }));
  }, [allRows, query]);

  return (
    <div>
      <div className="relative mb-2">
        <Search
          size={15}
          className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[var(--ink-tertiary)]"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] py-2 ps-9 pe-3 text-sm text-[var(--ink-primary)] placeholder:text-[var(--ink-tertiary)] focus:border-[var(--signal)] focus:outline-none focus:ring-2 focus:ring-[var(--synapse)]/30"
        />
      </div>

      <div
        role="listbox"
        className="max-h-64 overflow-y-auto rounded-[10px] border border-[var(--hairline)]"
      >
        {!query.trim() && (
          <label
            role="option"
            aria-selected={value === null}
            className="flex cursor-pointer items-center gap-2 border-b border-[var(--hairline)] px-3 py-2 text-sm text-[var(--ink-primary)] hover:bg-[var(--sunken)]"
          >
            <input
              type="radio"
              name="tree-select"
              checked={value === null}
              onChange={() => onChange(null)}
              className="h-4 w-4 border-[var(--hairline)]"
            />
            <span className="italic text-[var(--ink-tertiary)]">{noneLabel}</span>
          </label>
        )}

        {filteredRows.length === 0 ? (
          <p className="px-3 py-4 text-center text-sm text-[var(--ink-tertiary)]">
            {emptyResultsLabel}
          </p>
        ) : (
          filteredRows.map((row) => {
            const isSelected = value === row.id;
            return (
              <label
                key={row.id}
                role="option"
                aria-selected={isSelected}
                className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-[var(--ink-primary)] hover:bg-[var(--sunken)]"
                style={{ paddingInlineStart: `${12 + row.depth * 20}px` }}
              >
                <input
                  type="radio"
                  name="tree-select"
                  checked={isSelected}
                  onChange={() => onChange(row.id)}
                  className="h-4 w-4 border-[var(--hairline)]"
                />
                {row.depth > 0 && !query.trim() && (
                  <ChevronRight
                    size={12}
                    className="shrink-0 text-[var(--ink-tertiary)] rtl:rotate-180"
                    aria-hidden="true"
                  />
                )}
                {row.label}
              </label>
            );
          })
        )}
      </div>
    </div>
  );
}

/**
 * Utility for callers: given the full flat department list and the id of
 * the department being moved/edited, returns the set of ids to exclude
 * (itself + every descendant) so a circular hierarchy can never be
 * selected. Kept here since it's tightly coupled to TreeSelectNode shape,
 * though it contains no Department-specific naming.
 */
export function getSelfAndDescendantIds(
  nodes: TreeSelectNode[],
  rootId: string,
): Set<string> {
  const childrenByParent = new Map<string, string[]>();
  for (const node of nodes) {
    if (node.parentId === null) continue;
    const siblings = childrenByParent.get(node.parentId) ?? [];
    siblings.push(node.id);
    childrenByParent.set(node.parentId, siblings);
  }

  const result = new Set<string>([rootId]);
  const stack = [rootId];
  while (stack.length > 0) {
    const current = stack.pop()!;
    const children = childrenByParent.get(current) ?? [];
    for (const childId of children) {
      if (!result.has(childId)) {
        result.add(childId);
        stack.push(childId);
      }
    }
  }
  return result;
}
