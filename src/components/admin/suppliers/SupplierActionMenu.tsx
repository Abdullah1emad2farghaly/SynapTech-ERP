// Project path: src/components/admin/suppliers/SupplierActionMenu.tsx

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { MoreVertical, Eye, Pencil, Trash2 } from "lucide-react";
import type { SupplierResponse } from "../../../types/suppliers.types";

interface SupplierActionMenuProps {
  supplier: SupplierResponse;
  onView: (supplier: SupplierResponse) => void;
  onEdit: (supplier: SupplierResponse) => void;
  onDelete: (supplier: SupplierResponse) => void;
}

export function SupplierActionMenu({
  supplier,
  onView,
  onEdit,
  onDelete,
}: SupplierActionMenuProps) {
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
        <div className="absolute end-0 z-10 mt-1 w-40 overflow-hidden rounded-md border border-[--hairline] bg-[--panel] py-1 shadow-[var(--elevation-1)]">
          <button
            type="button"
            onClick={() => onView(supplier)}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[--ink-primary] hover:bg-[--sunken]"
          >
            <Eye size={15} /> {t("suppliers.actions.view")}
          </button>
          <button
            type="button"
            onClick={() => onEdit(supplier)}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[--ink-primary] hover:bg-[--sunken]"
          >
            <Pencil size={15} /> {t("suppliers.actions.edit")}
          </button>
          <button
            type="button"
            onClick={() => onDelete(supplier)}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[--error] hover:bg-[--sunken]"
          >
            <Trash2 size={15} /> {t("suppliers.actions.delete")}
          </button>
        </div>
      )}
    </div>
  );
}
