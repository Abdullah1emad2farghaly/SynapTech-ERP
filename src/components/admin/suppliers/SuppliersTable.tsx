// Project path: src/components/admin/suppliers/SuppliersTable.tsx
//
// ASSUMPTION: DataTable's row-selection prop names (`selectable`, `selectedIds`,
// `onSelectionChange`) are inferred, same caveat as the Warehouses table —
// verify against DataTable's real prop signature before merging.
//
// Pagination is client-side over the already-fetched full list: GET
// /api/Suppliers has no confirmed query-param contract, so DataTable's
// built-in "server-side pagination" mode doesn't apply here — instead this
// component slices the filtered/sorted array itself and renders simple
// page controls below the table.

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Truck, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { DataTable, type DataTableColumn } from "../../common/DataTable";
import { SupplierStatusBadge } from "./SupplierStatusBadge";
import { SupplierActionMenu } from "./SupplierActionMenu";
import type { SupplierResponse } from "../../../types/suppliers.types";

const PAGE_SIZE = 10;

interface SuppliersTableProps {
  suppliers: SupplierResponse[];
  isLoading: boolean;
  hasActiveFilters: boolean;
  onView: (supplier: SupplierResponse) => void;
  onEdit: (supplier: SupplierResponse) => void;
  onDelete: (supplier: SupplierResponse) => void;
  onBulkDelete: (ids: string[]) => void;
  onCreate: () => void;
}

export function SuppliersTable({
  suppliers,
  isLoading,
  hasActiveFilters,
  onView,
  onEdit,
  onDelete,
  onBulkDelete,
  onCreate,
}: SuppliersTableProps) {
  const { t } = useTranslation();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(suppliers.length / PAGE_SIZE));
  const pageRows = suppliers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const columns: DataTableColumn<SupplierResponse>[] = [
    {
      id: "name",
      header: t("suppliers.table.name"),
      cell: (supplier) => (
        <button
          type="button"
          onClick={() => onView(supplier)}
          className="flex items-center gap-3 text-start"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[--signal]/10 text-[--signal]">
            <Truck size={16} />
          </span>
          <span className="font-medium text-[--ink-primary] hover:text-[--signal]">
            {supplier.name}
          </span>
        </button>
      ),
    },
    {
      id: "contactName",
      header: t("suppliers.table.contactPerson"),
      cell: (supplier) => (
        <span className="text-sm text-[--ink-secondary]">{supplier.contactName || "__"}</span>
      ),
    },
    {
      id: "phone",
      header: t("suppliers.table.phone"),
      cell: (supplier) => (
        <span className="text-sm text-[--ink-secondary]">{supplier.phone || "__"}</span>
      ),
    },
    {
      id: "email",
      header: t("suppliers.table.email"),
      cell: (supplier) => (
        <span className="text-sm text-[--ink-secondary]">{supplier.email || "__"}</span>
      ),
    },
    {
      id: "taxNumber",
      header: t("suppliers.table.taxNumber"),
      cell: (supplier) => (
        <span className="font-mono text-xs text-[--ink-secondary]">
          {supplier.taxNumber || "__"}
        </span>
      ),
    },
    {
      id: "status",
      header: t("suppliers.table.status"),
      cell: (supplier) => <SupplierStatusBadge isActive={supplier.isActive} />,
    },
    {
      id: "actions",
      header: "",
      cell: (supplier) => (
        <SupplierActionMenu
          supplier={supplier}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      {selectedIds.length > 0 && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center justify-between rounded-md border border-[--hairline] bg-[--sunken] px-4 py-2.5"
        >
          <span className="text-sm text-[--ink-primary]">
            {t("suppliers.bulk.selectedCount", { count: selectedIds.length })}
          </span>
          <button
            type="button"
            onClick={() => {
              onBulkDelete(selectedIds);
              setSelectedIds([]);
            }}
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-[--error] hover:bg-[--error]/10"
          >
            <Trash2 size={14} />
            {t("suppliers.bulk.deleteSelected")}
          </button>
        </div>
      )}

      <DataTable
        columns={columns}
        rows={pageRows}
        getRowId={(supplier) => supplier.id}
        isLoading={isLoading}
        skeletonRowCount={6}
        emptyState={
          hasActiveFilters ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <Truck size={32} className="text-[--ink-tertiary]" />
              <p className="font-medium text-[--ink-primary]">
                {t("suppliers.empty.filteredTitle")}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <Truck size={32} className="text-[--ink-tertiary]" />
              <p className="font-medium text-[--ink-primary]">
                {t("suppliers.empty.title")}
              </p>
              <p className="max-w-sm text-sm text-[--ink-secondary]">
                {t("suppliers.empty.description")}
              </p>
              <button
                type="button"
                onClick={onCreate}
                className="mt-1 rounded-md bg-[--signal] px-4 py-2 text-sm font-medium text-white hover:bg-[--signal-hover]"
              >
                {t("suppliers.actions.create")}
              </button>
            </div>
          )
        }
      />

      {suppliers.length > PAGE_SIZE && (
        <div className="flex items-center justify-between text-sm text-[--ink-secondary]">
          <span>
            {t("suppliers.pagination.summary", {
              from: (page - 1) * PAGE_SIZE + 1,
              to: Math.min(page * PAGE_SIZE, suppliers.length),
              total: suppliers.length,
            })}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="inline-flex items-center justify-center rounded-md border border-[--hairline] p-1.5 disabled:opacity-40"
            >
              <ChevronLeft size={16} className="rtl:rotate-180" />
            </button>
            <span className="px-2">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="inline-flex items-center justify-center rounded-md border border-[--hairline] p-1.5 disabled:opacity-40"
            >
              <ChevronRight size={16} className="rtl:rotate-180" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
