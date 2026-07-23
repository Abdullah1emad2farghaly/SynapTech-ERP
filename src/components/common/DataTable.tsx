// src/components/common/DataTable.tsx
//
// Generic, presentation-only data table shell. Server-side sort and
// pagination only (the system rule: never "load everything" client-side)
// — this component renders whatever page of rows it's given and reports
// sort/page changes upward; it never owns fetching or business logic.
//
// Built once here so any module (Users first, others later) composes it
// with its own column definitions rather than each module hand-rolling
// its own table.

import type { ReactNode } from "react";

export type SortDirection = "asc" | "desc" | null;

export interface DataTableColumn<T> {
  id: string;
  /** Already-translated header label. */
  header: string;
  cell: (row: T) => ReactNode;
  sortable?: boolean;
  /** Tailwind width class, e.g. "w-48". Omit for flexible columns. */
  widthClass?: string;
  /** Hidden via the column-visibility menu; still rendered if false. */
  hidden?: boolean;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  isLoading?: boolean;
  /** Rendered instead of rows when isLoading is false and rows is empty. */
  emptyState?: ReactNode;
  /** Rendered instead of rows/emptyState on a fetch failure. */
  errorState?: ReactNode;
  sortColumnId?: string | null;
  sortDirection?: SortDirection;
  onSortChange?: (columnId: string, direction: SortDirection) => void;
  /** Row selection (for bulk actions). Omit entirely if a table has none. */
  selectedIds?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;
  onRowClick?: (row: T) => void;
  skeletonRowCount?: number;
  className?: string;
}

function SkeletonRow({ columnCount }: { columnCount: number }) {
  return (
    <tr>
      {Array.from({ length: columnCount }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 w-full max-w-[160px] animate-pulse rounded-[6px] bg-[var(--sunken)]" />
        </td>
      ))}
    </tr>
  );
}

export function DataTable<User>({
  columns,
  rows,
  getRowId,
  isLoading = false,
  emptyState,
  errorState,
  sortColumnId = null,
  sortDirection = null,
  onSortChange,
  selectedIds,
  onSelectionChange,
  onRowClick,
  skeletonRowCount = 6,
  className = "",
}: DataTableProps<User>) {
  const visibleColumns = columns.filter((c) => !c.hidden);
  const hasSelection = selectedIds !== undefined && onSelectionChange !== undefined;
  const columnCount = visibleColumns.length + (hasSelection ? 1 : 0);

  const allSelected =
    hasSelection && rows.length > 0 && rows.every((r) => selectedIds!.has(getRowId(r)));

  function toggleAll() {
    if (!hasSelection) return;
    if (allSelected) {
      onSelectionChange!(new Set());
    } else {
      onSelectionChange!(new Set(rows.map(getRowId)));
    }
  }

  function toggleRow(id: string) {
    if (!hasSelection) return;
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectionChange!(next);
  }

  function handleSort(column: DataTableColumn<User>) {
    if (!column.sortable || !onSortChange) return;
    const isSameColumn = sortColumnId === column.id;
    const nextDirection: SortDirection = !isSameColumn
      ? "asc"
      : sortDirection === "asc"
        ? "desc"
        : sortDirection === "desc"
          ? null
          : "asc";
    onSortChange(column.id, nextDirection);
  }

  return (
    <div className={`overflow-x-auto rounded-[16px] border border-[var(--hairline)] ${className}`}>
      <table className="w-full border-collapse text-sm">
        <thead className="sticky top-0 z-10 bg-[var(--sunken)]">
          <tr>
            {hasSelection && (
              <th className="w-10 px-4 py-3 text-start">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  aria-label="Select all rows"
                  className="h-4 w-4 rounded-[4px] border-[var(--hairline)]"
                />
              </th>
            )}
            {visibleColumns.map((column) => {
              const isActive = sortColumnId === column.id;
              return (
                <th
                  key={column.id}
                  scope="col"
                  className={`px-4 py-3 text-start font-medium text-[var(--ink-secondary)] ${column.widthClass ?? ""}`}
                >
                  {column.sortable ? (
                    <button
                      type="button"
                      onClick={() => handleSort(column)}
                      className="inline-flex items-center gap-1 transition-[color] duration-150 hover:text-[var(--ink-primary)]"
                    >
                      {column.header}
                      <span
                        className={`text-[10px] transition-transform duration-150 ${
                          isActive && sortDirection === "desc" ? "rotate-180" : ""
                        }`}
                        aria-hidden="true"
                      >
                        {isActive && sortDirection ? "▲" : "⇅"}
                      </span>
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {errorState ? (
            <tr>
              <td colSpan={columnCount} className="px-4 py-10">
                {errorState}
              </td>
            </tr>
          ) : isLoading ? (
            Array.from({ length: skeletonRowCount }).map((_, i) => (
              <SkeletonRow key={i} columnCount={columnCount} />
            ))
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={columnCount} className="px-4 py-10">
                {emptyState}
              </td>
            </tr>
          ) : (
            rows.map((row) => {
              const id = getRowId(row);
              return (
                <tr
                  key={id}
                  onClick={() => onRowClick?.(row)}
                  className={`border-t border-[var(--hairline)] transition-colors duration-150 hover:bg-[var(--sunken)] ${
                    onRowClick ? "cursor-pointer" : ""
                  }`}
                >
                  {hasSelection && (
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds!.has(id)}
                        onChange={() => toggleRow(id)}
                        aria-label="Select row"
                        className="h-4 w-4 rounded-[4px] border-[var(--hairline)]"
                      />
                    </td>
                  )}
                  {visibleColumns.map((column) => (
                    <td key={column.id} className="px-4 py-3 text-[var(--ink-primary)]">
                      {column.cell(row)}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export interface DataTablePaginationProps {
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: number[];
}

export function DataTablePagination({
  page,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50],
}: DataTablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className="flex items-center justify-between px-4 py-3 text-sm text-[var(--ink-secondary)]">
      <div className="flex items-center gap-2">
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] px-2 py-1"
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded-[10px] px-2 py-1 disabled:opacity-40"
        >
          ‹
        </button>
        <span>
          {page} / {totalPages}
        </span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="rounded-[10px] px-2 py-1 disabled:opacity-40"
        >
          ›
        </button>
      </div>
    </div>
  );
}
