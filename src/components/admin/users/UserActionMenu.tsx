

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { MoreVertical, UserCog, UserX, UserCheck, Trash2 } from "lucide-react";
import { ConfirmationDialog } from "../../common/ConfirmationDialog";
import { User } from "@/types/users.types";

export interface UserActionMenuProps {
  userId: string;
  userName: string;
  isActive: User;
  onAssignRoles: (userId: string) => void;
  /** Should perform the actual PUT and resolve/reject; menu handles UI state. */
  onSetActive: (user: User) => Promise<void>;
  /** Should perform the actual DELETE and resolve/reject. */
  onDelete: (userId: string) => Promise<void>;
}

type ConfirmState = { kind: "deactivate" | "delete" } | null;

export function UserActionMenu({
  userId,
  userName,
  isActive,
  onAssignRoles,
  onSetActive,
  onDelete,
}: UserActionMenuProps) {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmState, setConfirmState] = useState<ConfirmState>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  function closeMenu() {
    setMenuOpen(false);
  }

  async function handleActivate() {
    closeMenu();
    try {
      await onSetActive(isActive);
      toast.success(t("users.toast.activated", { name: userName }));
    } catch {
      toast.error(t("common.errors.actionFailed"));
    }
  }

  function handleDeactivateClick() {
    closeMenu();
    setConfirmState({ kind: "deactivate" });
  }

  function handleDeleteClick() {
    closeMenu();
    setConfirmState({ kind: "delete" });
  }

  async function handleConfirm() {
    if (!confirmState) return;
    setIsSubmitting(true);
    try {
      if (confirmState.kind === "deactivate") {
        await onSetActive({ ...isActive });
        toast.success(isActive.isActive ? t("users.toast.deactivated", { name: userName }) : t("users.toast.activated", { name: userName }));
      } else {
        await onDelete(userId);
        toast.success(t("users.toast.deleted", { name: userName }));
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
    <div  ref={menuRef} className="relative inline-block text-start">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        aria-label={t("users.actions.moreActions")}
        className="flex edit h-8 w-8 items-center justify-center rounded-[10px] text-[var(--ink-secondary)] transition-colors duration-150 hover:bg-[var(--sunken)] hover:text-[var(--ink-primary)]"
      >
        <MoreVertical size={16} />
      </button>

      {menuOpen && (
        <>
          {/* Click-outside catcher */}
          <div
            role="menu"
            className="absolute end-0 z-10 mt-1 w-48 rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] py-1 shadow-[var(--elevation-1)]"
          >
            <button
              role="menuitem"
              type="button"
              onClick={() => {
                closeMenu();
                onAssignRoles(userId);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-start text-sm text-[var(--ink-primary)] hover:bg-[var(--sunken)]"
            >
              <UserCog size={15} />
              {t("users.actions.assignRoles")}
            </button>

            {isActive ? (
              <button
                role="menuitem"
                type="button"
                onClick={handleDeactivateClick}
                className="flex w-full items-center gap-2 px-3 py-2 text-start text-sm text-[var(--ink-primary)] hover:bg-[var(--sunken)]"
              >
                <UserX size={15} />
                {
                  isActive.isActive ? t("users.actions.deactivate") : t("users.actions.activate")
                }
              </button>
            ) : (
              <button
                role="menuitem"
                type="button"
                onClick={handleActivate}
                className="flex w-full items-center gap-2 px-3 py-2 text-start text-sm text-[var(--ink-primary)] hover:bg-[var(--sunken)]"
              >
                <UserCheck size={15} />
                {t("users.actions.activate")}
              </button>
            )}

            <button
              role="menuitem"
              type="button"
              onClick={handleDeleteClick}
              className="flex w-full items-center gap-2 px-3 py-2 text-start text-sm text-[var(--error)] hover:bg-[var(--sunken)]"
            >
              <Trash2 size={15} />
              {t("users.actions.delete")}
            </button>
          </div>
        </>
      )}

      <ConfirmationDialog
        open={confirmState?.kind === "deactivate"}
        tone="neutral"
        title={isActive.isActive ? t("users.dialogs.deactivate.title") : t("users.dialogs.activate.title")}
        body={isActive.isActive ? t("users.dialogs.deactivate.body") : t("users.dialogs.activate.body")}
        confirmLabel={isActive.isActive ? t("users.actions.deactivate") : t("users.actions.activate")}
        cancelLabel={t("users.actions.cancel")}
        isSubmitting={isSubmitting}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmState(null)}
      />

      <ConfirmationDialog
        open={confirmState?.kind === "delete"}
        tone="destructive"
        title={t("users.dialogs.delete.title")}
        body={t("users.dialogs.delete.body", { name: userName })}
        confirmLabel={t("users.dialogs.delete.confirmLabel")}
        cancelLabel={t("users.actions.cancel")}
        isSubmitting={isSubmitting}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmState(null)}
      />
    </div>
  );
}
