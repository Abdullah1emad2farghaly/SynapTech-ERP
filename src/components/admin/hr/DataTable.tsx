import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

export interface DataTableColumn<T> {
  id: string;
  header: string;
  accessor: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  isLoading?: boolean;
  emptyState?: ReactNode;
  onRowClick?: (row: T) => void;
  pageSize?: number;
}

// Sortable, sticky-header, paginated. Column-visibility and bulk-select
// toolbars are intentionally left as a follow-up extension point (see the
// `selectable` prop shape noted in the module design doc) — this covers the
// read/browse case every HR list needs first.
export function DataTable<T>({
  columns,
  rows,
  getRowId,
  isLoading,
  emptyState,
  onRowClick,
  pageSize = 10,
}: DataTableProps<T>) {
  const [sort, setSort] = useState<{ columnId: string; direction: "asc" | "desc" } | null>(null);
  const [page, setPage] = useState(1);

  const sortedRows = useMemo(() => {
    if (!sort) return rows;
    const column = columns.find((c) => c.id === sort.columnId);
    if (!column?.sortValue) return rows;
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = column.sortValue!(a);
      const bv = column.sortValue!(b);
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sort.direction === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [rows, sort, columns]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const pageRows = sortedRows.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (columnId: string) => {
    setSort((prev) => {
      if (prev?.columnId !== columnId) return { columnId, direction: "asc" };
      if (prev.direction === "asc") return { columnId, direction: "desc" };
      return null;
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-hairline py-16">
        <LoadingSpinner />
      </div>
    );
  }

  if (rows.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-hairline">
      <div className="overflow-x-auto">
        <table className="w-full text-start text-[0.8125rem]">
          <thead className="sticky top-0 bg-sunken">
            <tr>
              {columns.map((col) => (
                <th key={col.id} scope="col" className="px-4 py-3 text-start font-medium text-ink-secondary">
                  {col.sortValue ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(col.id)}
                      className="inline-flex items-center gap-1 hover:text-ink-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-synapse rounded"
                    >
                      {col.header}
                      {sort?.columnId === col.id ? (
                        sort.direction === "asc" ? (
                          <ArrowUp className="h-3 w-3" aria-hidden="true" />
                        ) : (
                          <ArrowDown className="h-3 w-3" aria-hidden="true" />
                        )
                      ) : (
                        <ChevronsUpDown className="h-3 w-3 opacity-40" aria-hidden="true" />
                      )}
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {pageRows.map((row) => (
              <tr
                key={getRowId(row)}
                onClick={() => onRowClick?.(row)}
                className={onRowClick ? "cursor-pointer hover:bg-sunken/60" : ""}
              >
                {columns.map((col) => (
                  <td key={col.id} className="px-4 py-3 text-ink-primary">
                    {col.accessor(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 ? (
        <div className="flex items-center justify-between border-t border-hairline px-4 py-3 text-[0.8125rem] text-ink-secondary">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded px-2 py-1 hover:bg-sunken disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-synapse"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded px-2 py-1 hover:bg-sunken disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-synapse"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
