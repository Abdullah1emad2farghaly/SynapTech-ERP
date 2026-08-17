// src/components/admin/customers/CustomerActionMenu.tsx
//
// Three-dot menu: View Details, Edit, Deactivate/Activate, Delete. Same
// conventions as every other module's action menu — Deactivate/Delete
// bubble up as requests to the page (which owns the ConfirmationDialogs),
// Activate fires immediately with a toast. No blocked-delete guard here
// — unlike Departments/Branches, nothing in this project has a confirmed
// field referencing a customerId, so there's no real relationship to
// check before allowing deletion.

import { useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { MoreVertical, Eye, Pencil, UserX, UserCheck, Trash2 } from "lucide-react";
import axios from "axios";
import { handleErrors } from "@/utils/HandleErrors";

export interface CustomerActionMenuProps {
  customerId: string;
  customerName: string;
  isActive: boolean;
  onViewDetails: (id: string) => void;
  onEdit: (id: string) => void;
  onSetActive: (id: string, active: boolean) => Promise<void>;
  onDeactivateRequest: (id: string) => void;
  onDeleteRequest: (id: string) => void;
}

export function CustomerActionMenu({
  customerId,
  customerName,
  isActive,
  onViewDetails,
  onEdit,
  onSetActive,
  onDeactivateRequest,
  onDeleteRequest,
}: CustomerActionMenuProps) {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  async function handleActivate() {
    closeMenu();
    try {
      await onSetActive(customerId, true);
      toast.success(t("customers.toast.activated", { name: customerName }));
    } catch (error) {
      if(axios.isAxiosError(error)){
        handleErrors(error.response?.data.errors)
      }
    }
  }

  return (
    <div className="relative inline-block text-start">
      <button
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        aria-label={t("customers.actions.moreActions")}
        className="flex h-8 w-8 items-center justify-center rounded-[10px] text-[var(--ink-secondary)] transition-colors duration-150 hover:bg-[var(--sunken)] hover:text-[var(--ink-primary)]"
      >
        <MoreVertical size={16} />
      </button>

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={closeMenu} aria-hidden="true" />
          <div
            role="menu"
            className="absolute end-0 z-20 mt-1 w-52 rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] py-1 shadow-[var(--elevation-1)]"
          >
            <button
              role="menuitem"
              type="button"
              onClick={() => {
                closeMenu();
                onViewDetails(customerId);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-start text-sm text-[var(--ink-primary)] hover:bg-[var(--sunken)]"
            >
              <Eye size={15} />
              {t("customers.actions.viewDetails")}
            </button>

            <button
              role="menuitem"
              type="button"
              onClick={() => {
                closeMenu();
                onEdit(customerId);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-start text-sm text-[var(--ink-primary)] hover:bg-[var(--sunken)]"
            >
              <Pencil size={15} />
              {t("customers.actions.edit")}
            </button>

            {isActive ? (
              <button
                role="menuitem"
                type="button"
                onClick={() => {
                  closeMenu();
                  onDeactivateRequest(customerId);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-start text-sm text-[var(--ink-primary)] hover:bg-[var(--sunken)]"
              >
                <UserX size={15} />
                {t("customers.actions.deactivate")}
              </button>
            ) : (
              <button
                role="menuitem"
                type="button"
                onClick={handleActivate}
                className="flex w-full items-center gap-2 px-3 py-2 text-start text-sm text-[var(--ink-primary)] hover:bg-[var(--sunken)]"
              >
                <UserCheck size={15} />
                {t("customers.actions.activate")}
              </button>
            )}

            <button
              role="menuitem"
              type="button"
              onClick={() => {
                closeMenu();
                onDeleteRequest(customerId);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-start text-sm text-[var(--error)] hover:bg-[var(--sunken)]"
            >
              <Trash2 size={15} />
              {t("customers.actions.delete")}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
