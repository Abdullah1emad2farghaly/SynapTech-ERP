// Project path: src/components/admin/warehouses/WarehouseActionMenu.tsx
//
// View opens the same drawer as Edit — see spec §9 (no second page/drawer
// variant for a 5-field record). Activate/Deactivate are instant + toast,
// no dialog, matching Branches/Departments' existing convention.

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { MoreVertical, Eye, Pencil, CheckCircle2, XCircle, Trash2 } from "lucide-react";
import type { WarehouseResponse } from "../../../types/warehouses.types";

interface WarehouseActionMenuProps {
  warehouse: WarehouseResponse;
  onView: (warehouse: WarehouseResponse) => void;
  onEdit: (warehouse: WarehouseResponse) => void;
  onToggleActive: (warehouse: WarehouseResponse) => void;
  onDelete: (warehouse: WarehouseResponse) => void;
}

export function WarehouseActionMenu({
  warehouse,
  onView,
  onEdit,
  onToggleActive,
  onDelete,
}: WarehouseActionMenuProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        className="inline-flex items-center justify-center rounded-md p-1.5 text-[--ink-secondary] hover:bg-[--sunken]"
      >
        <MoreVertical size={16} />
      </button>

      {open && (
        <div className="absolute end-0 z-10 mt-1 w-44 overflow-hidden rounded-md border border-[--hairline] bg-[--panel] py-1 shadow-[var(--elevation-1)]">
          <button
            type="button"
            onClick={() => onView(warehouse)}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[--ink-primary] hover:bg-[--sunken]"
          >
            <Eye size={15} /> {t("warehouses.actions.view")}
          </button>
          <button
            type="button"
            onClick={() => onEdit(warehouse)}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[--ink-primary] hover:bg-[--sunken]"
          >
            <Pencil size={15} /> {t("warehouses.actions.edit")}
          </button>
          <button
            type="button"
            onClick={() => onToggleActive(warehouse)}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[--ink-primary] hover:bg-[--sunken]"
          >
            {warehouse.isActive ? (
              <>
                <XCircle size={15} /> {t("warehouses.actions.deactivate")}
              </>
            ) : (
              <>
                <CheckCircle2 size={15} /> {t("warehouses.actions.activate")}
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => onDelete(warehouse)}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[--error] hover:bg-[--sunken]"
          >
            <Trash2 size={15} /> {t("warehouses.actions.delete")}
          </button>
        </div>
      )}
    </div>
  );
}
