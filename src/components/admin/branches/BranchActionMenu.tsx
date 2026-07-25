// src/components/admin/branches/BranchActionMenu.tsx
//
// Row-level kebab menu: View Details, Edit, Duplicate, Deactivate/Activate,
// Delete. Same conventions as UserActionMenu/DepartmentActionMenu.
// Delete is blocked + explained when the branch is referenced by any
// Department or User (real cross-module check, since both those APIs
// carry branchId), and shows a stronger warning in the confirmation
// dialog itself when the branch isMain.

import { useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import {
  MoreVertical,
  Eye,
  Pencil,
  Copy,
  UserX,
  UserCheck,
  Trash2,
} from "lucide-react";
import { ConfirmationDialog } from "../../common/ConfirmationDialog";

export interface BranchActionMenuProps {
  branchId: string;
  branchName: string;
  isActive: boolean;
  isMain: boolean;
  hasDepartments: boolean;
  hasUsers: boolean;
  onViewDetails: (id: string) => void;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onSetActive: (id: string, active: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

type ConfirmState = { kind: "deactivate" | "delete" } | null;

export function BranchActionMenu({
  branchId,
  branchName,
  isActive,
  isMain,
  hasDepartments,
  hasUsers,
  onViewDetails,
  onEdit,
  onDuplicate,
  onSetActive,
  onDelete,
}: BranchActionMenuProps) {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmState, setConfirmState] = useState<ConfirmState>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const deleteBlocked = hasDepartments || hasUsers;

  function closeMenu() {
    setMenuOpen(false);
  }

  async function handleActivate() {
    closeMenu();
    try {
      await onSetActive(branchId, true);
      toast.success(t("branches.toast.activated", { name: branchName }));
    } catch {
      toast.error(t("common.errors.actionFailed"));
    }
  }

  async function handleConfirm() {
    if (!confirmState) return;
    setIsSubmitting(true);
    try {
      if (confirmState.kind === "deactivate") {
        await onSetActive(branchId, false);
        toast.success(t("branches.toast.deactivated", { name: branchName }));
      } else {
        await onDelete(branchId);
        toast.success(t("branches.toast.deleted", { name: branchName }));
      }
      setConfirmState(null);
    } catch {
      toast.error(t("common.errors.actionFailed"));
    } finally {
      setIsSubmitting(false);
    }
  }

  const deleteBody = isMain
    ? `${t("branches.dialogs.delete.body", { name: branchName })} ${t("branches.dialogs.delete.mainBranchWarning")}`
    : t("branches.dialogs.delete.body", { name: branchName });

  return (
    <div className="relative inline-block text-start">
      <button
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        aria-label={t("branches.actions.moreActions")}
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
                onViewDetails(branchId);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-start text-sm text-[var(--ink-primary)] hover:bg-[var(--sunken)]"
            >
              <Eye size={15} />
              {t("branches.actions.viewDetails")}
            </button>

            <button
              role="menuitem"
              type="button"
              onClick={() => {
                closeMenu();
                onEdit(branchId);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-start text-sm text-[var(--ink-primary)] hover:bg-[var(--sunken)]"
            >
              <Pencil size={15} />
              {t("branches.actions.edit")}
            </button>

            <button
              role="menuitem"
              type="button"
              onClick={() => {
                closeMenu();
                onDuplicate(branchId);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-start text-sm text-[var(--ink-primary)] hover:bg-[var(--sunken)]"
            >
              <Copy size={15} />
              {t("branches.actions.duplicate")}
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
                {t("branches.actions.deactivate")}
              </button>
            ) : (
              <button
                role="menuitem"
                type="button"
                onClick={handleActivate}
                className="flex w-full items-center gap-2 px-3 py-2 text-start text-sm text-[var(--ink-primary)] hover:bg-[var(--sunken)]"
              >
                <UserCheck size={15} />
                {t("branches.actions.activate")}
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
                  ? hasDepartments
                    ? t("branches.dialogs.delete.blockedHasDepartments")
                    : t("branches.dialogs.delete.blockedHasUsers")
                  : undefined
              }
              className="flex w-full items-center gap-2 px-3 py-2 text-start text-sm text-[var(--error)] hover:bg-[var(--sunken)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <Trash2 size={15} />
              {t("branches.actions.delete")}
            </button>
          </div>
        </>
      )}

      <ConfirmationDialog
        open={confirmState?.kind === "deactivate"}
        tone="neutral"
        title={t("branches.dialogs.deactivate.title")}
        body={t("branches.dialogs.deactivate.body")}
        confirmLabel={t("branches.actions.deactivate")}
        cancelLabel={t("users.actions.cancel")}
        isSubmitting={isSubmitting}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmState(null)}
      />

      <ConfirmationDialog
        open={confirmState?.kind === "delete"}
        tone="destructive"
        title={t("branches.dialogs.delete.title")}
        body={deleteBody}
        confirmLabel={t("branches.actions.delete")}
        cancelLabel={t("users.actions.cancel")}
        isSubmitting={isSubmitting}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmState(null)}
      />
    </div>
  );
}
