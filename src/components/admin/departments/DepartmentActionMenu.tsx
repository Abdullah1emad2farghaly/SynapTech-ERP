// src/components/admin/departments/DepartmentActionMenu.tsx
//
// Row-level kebab menu: View Details, Edit, Move, Duplicate,
// Deactivate/Activate, Delete. Same confirmation-dialog conventions as
// Users' UserActionMenu (Deactivate = dialog, Activate = instant + toast),
// plus one extra rule Users didn't need: Delete is blocked with an
// explanation if the department has children or assigned users, since the
// API doesn't confirm cascade behavior on delete.

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import {
  MoreVertical,
  Eye,
  Pencil,
  FolderTree,
  Copy,
  UserX,
  UserCheck,
  Trash2,
} from "lucide-react";
import { ConfirmationDialog } from "../../common/ConfirmationDialog";

export interface DepartmentActionMenuProps {
  departmentId: string;
  departmentName: string;
  isActive: boolean;
  /** Computed by the parent from the full loaded set — see DepartmentsPage. */
  hasChildren: boolean;
  hasAssignedUsers: boolean;
  onViewDetails: (id: string) => void;
  onEdit: (id: string) => void;
  onMove: (id: string) => void;
  onDuplicate: (id: string) => void;
  onSetActive: (id: string, active: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

type ConfirmState = { kind: "deactivate" | "delete" } | null;

export function DepartmentActionMenu({
  departmentId,
  departmentName,
  isActive,
  hasChildren,
  hasAssignedUsers,
  onViewDetails,
  onEdit,
  onMove,
  onDuplicate,
  onSetActive,
  onDelete,
}: DepartmentActionMenuProps) {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmState, setConfirmState] = useState<ConfirmState>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const deleteBlocked = hasChildren || hasAssignedUsers;

  function closeMenu() {
    setMenuOpen(false);
  }

  async function handleActivate() {
    closeMenu();
    try {
      await onSetActive(departmentId, true);
      toast.success(t("departments.toast.activated", { name: departmentName }));
    } catch {
      toast.error(t("common.errors.actionFailed"));
    }
  }

  async function handleConfirm() {
    if (!confirmState) return;
    setIsSubmitting(true);
    try {
      if (confirmState.kind === "deactivate") {
        await onSetActive(departmentId, false);
        toast.success(t("departments.toast.deactivated", { name: departmentName }));
      } else {
        await onDelete(departmentId);
        toast.success(t("departments.toast.deleted", { name: departmentName }));
      }
      setConfirmState(null);
    } catch {
      toast.error(t("common.errors.actionFailed"));
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={menuRef} className="relative inline-block text-start">
      <button
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        aria-label={t("departments.actions.moreActions")}
        className="flex h-8 w-8 items-center justify-center rounded-[10px] text-[var(--ink-secondary)] transition-colors duration-150 hover:bg-[var(--sunken)] hover:text-[var(--ink-primary)]"
      >
        <MoreVertical size={16} />
      </button>

      {menuOpen && (
        <>
          {/* <div className="fixed inset-0 z-10" onClick={closeMenu} aria-hidden="true" /> */}
          <div
            role="menu"
            className="absolute end-0 z-20 mt-1 w-52 rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] py-1 shadow-[var(--elevation-1)]"
          >
            <button
              role="menuitem"
              type="button"
              onClick={() => {
                closeMenu();
                onViewDetails(departmentId);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-start text-sm text-[var(--ink-primary)] hover:bg-[var(--sunken)]"
            >
              <Eye size={15} />
              {t("departments.actions.viewDetails")}
            </button>

            <button
              role="menuitem"
              type="button"
              onClick={() => {
                closeMenu();
                onEdit(departmentId);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-start text-sm text-[var(--ink-primary)] hover:bg-[var(--sunken)]"
            >
              <Pencil size={15} />
              {t("departments.actions.edit")}
            </button>

            <button
              role="menuitem"
              type="button"
              onClick={() => {
                closeMenu();
                onMove(departmentId);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-start text-sm text-[var(--ink-primary)] hover:bg-[var(--sunken)]"
            >
              <FolderTree size={15} />
              {t("departments.actions.move")}
            </button>

            <button
              role="menuitem"
              type="button"
              onClick={() => {
                closeMenu();
                onDuplicate(departmentId);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-start text-sm text-[var(--ink-primary)] hover:bg-[var(--sunken)]"
            >
              <Copy size={15} />
              {t("departments.actions.duplicate")}
            </button>

            {isActive ? (
              <button
                role="menuitem"
                type="button"
                onClick={() => {
                  closeMenu();
                  setConfirmState({ kind: "deactivate" });
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-start text-sm text-[var(--ink-primary)] hover:bg-[var(--sunken)]"
              >
                <UserX size={15} />
                {t("departments.actions.deactivate")}
              </button>
            ) : (
              <button
                role="menuitem"
                type="button"
                onClick={handleActivate}
                className="flex w-full items-center gap-2 px-3 py-2 text-start text-sm text-[var(--ink-primary)] hover:bg-[var(--sunken)]"
              >
                <UserCheck size={15} />
                {t("departments.actions.activate")}
              </button>
            )}

            <button
              role="menuitem"
              type="button"
              disabled={deleteBlocked}
              onClick={() => {
                closeMenu();
                setConfirmState({ kind: "delete" });
              }}
              title={
                deleteBlocked
                  ? hasChildren
                    ? t("departments.dialogs.delete.blockedHasChildren")
                    : t("departments.dialogs.delete.blockedHasUsers")
                  : undefined
              }
              className="flex w-full items-center gap-2 px-3 py-2 text-start text-sm text-[var(--error)] hover:bg-[var(--sunken)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <Trash2 size={15} />
              {t("departments.actions.delete")}
            </button>
          </div>
        </>
      )}

      <ConfirmationDialog
        open={confirmState?.kind === "deactivate"}
        tone="neutral"
        title={t("departments.dialogs.deactivate.title")}
        body={t("departments.dialogs.deactivate.body")}
        confirmLabel={t("departments.actions.deactivate")}
        cancelLabel={t("users.actions.cancel")}
        isSubmitting={isSubmitting}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmState(null)}
      />

      <ConfirmationDialog
        open={confirmState?.kind === "delete"}
        tone="destructive"
        title={t("departments.dialogs.delete.title")}
        body={t("departments.dialogs.delete.body", { name: departmentName })}
        confirmLabel={t("departments.actions.delete")}
        cancelLabel={t("users.actions.cancel")}
        isSubmitting={isSubmitting}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmState(null)}
      />
    </div>
  );
}
