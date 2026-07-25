// Project path: src/components/admin/roles/RoleActionMenu.tsx
//
// "Duplicate" reads the role and opens Create Role pre-filled — same UI
// composition pattern used for Departments/Branches, not a new endpoint.

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { MoreVertical, Eye, Pencil, KeyRound, Copy, Trash2 } from "lucide-react";
import type { RoleResponse } from "../../../types/roles.types";

interface RoleActionMenuProps {
  role: RoleResponse;
  onView: (role: RoleResponse) => void;
  onEdit: (role: RoleResponse) => void;
  onManagePermissions: (role: RoleResponse) => void;
  onDuplicate: (role: RoleResponse) => void;
  onDelete: (role: RoleResponse) => void;
}

export function RoleActionMenu({
  role,
  onView,
  onEdit,
  onManagePermissions,
  onDuplicate,
  onDelete,
}: RoleActionMenuProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const items = [
    { label: t("roles.actions.view"), icon: Eye, onClick: () => onView(role) },
    { label: t("roles.actions.edit"), icon: Pencil, onClick: () => onEdit(role) },
    {
      label: t("roles.actions.managePermissions"),
      icon: KeyRound,
      onClick: () => onManagePermissions(role),
    },
    {
      label: t("roles.actions.duplicate"),
      icon: Copy,
      onClick: () => onDuplicate(role),
    },
    {
      label: t("roles.actions.delete"),
      icon: Trash2,
      onClick: () => onDelete(role),
      destructive: true,
    },
  ];

  return (
    <div className="relative">
      <button
        type="button"
        role="menu"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        className="inline-flex items-center justify-center rounded-md p-1.5 text-[--ink-secondary] transition-colors hover:bg-[--sunken]"
      >
        <MoreVertical size={16} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute end-0 z-10 mt-1 w-48 overflow-hidden rounded-md border border-[--hairline] bg-[--panel] py-1 shadow-[var(--elevation-1)]"
        >
          {items.map(({ label, icon: Icon, onClick, destructive }) => (
            <button
              key={label}
              type="button"
              role="menuitem"
              onClick={onClick}
              className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-[--sunken] ${
                destructive ? "text-[--error]" : "text-[--ink-primary]"
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
