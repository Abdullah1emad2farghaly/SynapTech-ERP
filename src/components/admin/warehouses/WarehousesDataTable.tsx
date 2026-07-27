// Project path: src/components/admin/warehouses/WarehousesDataTable.tsx
//
// Row checkboxes are built for visual/interaction consistency, but no bulk
// action bar is wired up — no bulk endpoint exists yet (see spec §9).
//
// ASSUMPTION: DataTable's row-selection prop names (`selectable`,
// `selectedIds`, `onSelectionChange`) are inferred from the "optional row
// selection" note on the shared DataTable — verify against its real prop
// signature before merging.

import { useTranslation } from "react-i18next";
import { Warehouse as WarehouseIcon } from "lucide-react";
import { DataTable, type DataTableColumn } from "../../common/DataTable";
import { StatusBadge } from "../../common/StatusBadge";
import { WarehouseActionMenu } from "./WarehouseActionMenu";
import type { WarehouseResponse } from "../../../types/warehouses.types";
import { MultiSelectOption } from "@/components/common/MultiSelectSearchable";


interface WarehousesDataTableProps {
  warehouses: WarehouseResponse[];
  branches: MultiSelectOption[];
  isLoading: boolean;
  hasActiveFilters: boolean;
  selectedIds: Set<string> | undefined;
  onSelectionChange: (ids: Set<string>) => void;
  onView: (warehouse: WarehouseResponse) => void;
  onEdit: (warehouse: WarehouseResponse) => void;
  onToggleActive: (warehouse: WarehouseResponse) => void;
  onDelete: (warehouse: WarehouseResponse) => void;
  onCreate: () => void;
  onResetFilters: () => void;
}

export function WarehousesDataTable({
  warehouses,
  branches,
  isLoading,
  hasActiveFilters,
  selectedIds,
  onSelectionChange,
  onView,
  onEdit,
  onToggleActive,
  onDelete,
  onCreate,
  onResetFilters,
}: WarehousesDataTableProps) {
  const { t } = useTranslation();
  const branchById = new Map(branches.map((b) => [b.value, b]));

  const columns: DataTableColumn<WarehouseResponse>[] = [
    {
      id: "name",
      header: t("warehouses.table.name"),
      cell: (warehouse) => (
        <button
          type="button"
          onClick={() => onView(warehouse)}
          className="flex items-center gap-3 text-start"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[--signal]/10 text-[--signal]">
            <WarehouseIcon size={16} />
          </span>
          <span className="font-medium text-[--ink-primary] hover:text-[--signal]">
            {warehouse.name}
          </span>
        </button>
      ),
    },
    {
      id: "code",
      header: t("warehouses.table.code"),
      cell: (warehouse) => (
        <span className="rounded-md bg-[--sunken] px-2 py-0.5 font-mono text-xs text-[--ink-secondary]">
          {warehouse.code}
        </span>
      ),
    },
    {
      id: "branch",
      header: t("warehouses.table.branch"),
      cell: (warehouse) => (
        <span className="rounded-md bg-[--sunken] px-2 py-0.5 text-xs text-[--ink-secondary]">
          {branchById.get(warehouse.branchId)?.label ?? t("warehouses.table.unknownBranch")}
        </span>
      ),
    },
    {
      id: "status",
      header: t("warehouses.table.status"),
      cell: (warehouse) => (
        <StatusBadge 
          status={warehouse.isActive ? "active" : "inactive"} 
          label={warehouse.isActive ? t("users.status.active") : t("users.status.inactive")}
        />
      ),
    },
    {
      id: "actions",
      header: "",
      cell: (warehouse) => (
        <WarehouseActionMenu
          warehouse={warehouse}
          onView={onView}
          onEdit={onEdit}
          onToggleActive={onToggleActive}
          onDelete={onDelete}
        />
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={warehouses}
      getRowId={(warehouse) => warehouse.id}
      isLoading={isLoading}
      skeletonRowCount={6}
      // selectable
      selectedIds={selectedIds}
      onSelectionChange={onSelectionChange}
      emptyState={
        hasActiveFilters ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <WarehouseIcon size={32} className="text-[--ink-tertiary]" />
            <p className="font-medium text-[--ink-primary]">
              {t("warehouses.empty.filteredTitle")}
            </p>
            <button
              type="button"
              onClick={onResetFilters}
              className="text-sm font-medium text-[--signal] hover:underline"
            >
              {t("warehouses.toolbar.reset")}
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <WarehouseIcon size={32} className="text-[--ink-tertiary]" />
            <p className="font-medium text-[--ink-primary]">
              {t("warehouses.empty.title")}
            </p>
            <p className="max-w-sm text-sm text-[--ink-secondary]">
              {t("warehouses.empty.description")}
            </p>
            <button
              type="button"
              onClick={onCreate}
              className="mt-1 rounded-md bg-[--signal] px-4 py-2 text-sm font-medium text-white hover:bg-[--signal-hover]"
            >
              {t("warehouses.actions.create")}
            </button>
          </div>
        )
      }
    />
  );
}
