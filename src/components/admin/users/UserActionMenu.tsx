// src/components/admin/users/UserActionMenu.tsx

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import {
  MoreVertical,
  UserCog,
  UserX,
  UserCheck,
  Trash2,
} from "lucide-react";
import { ConfirmationDialog } from "../../common/ConfirmationDialog";
import { User } from "@/types/users.types";
import axios from "axios";
import { handleErrors } from "@/utils/HandleErrors";

export interface UserActionMenuProps {
  userId: string;
  userName: string;
  isActive: User;
  onAssignRoles: (userId: string) => void;
  onSetActive: (user: User) => Promise<void>;
  onDelete: (userId: string) => Promise<void>;
}

type ConfirmState =
  | { kind: "deactivate" | "delete" }
  | null;

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
  const [confirmState, setConfirmState] =
    useState<ConfirmState>(null);
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const [menuPosition, setMenuPosition] = useState({
    top: 0,
    left: 0,
  });

  function closeMenu() {
    setMenuOpen(false);
  }

  function updateMenuPosition() {
    if (!triggerRef.current || !menuRef.current) return;

    const buttonRect =
      triggerRef.current.getBoundingClientRect();

    const menuRect =
      menuRef.current.getBoundingClientRect();

    const spacing = 4;
    const viewportPadding = 8;

    let top = buttonRect.bottom + spacing;

    let left = buttonRect.right - menuRect.width;

    if (
      top + menuRect.height >
      window.innerHeight - viewportPadding
    ) {
      top =
        buttonRect.top -
        menuRect.height -
        spacing;
    }

    if (
      left + menuRect.width >
      window.innerWidth - viewportPadding
    ) {
      left =
        window.innerWidth -
        menuRect.width -
        viewportPadding;
    }

    if (left < viewportPadding) {
      left = viewportPadding;
    }

    if (top < viewportPadding) {
      top = viewportPadding;
    }

    setMenuPosition({
      top,
      left,
    });
  }

  async function handleActivate() {
    closeMenu();

    try {
      await onSetActive(isActive);

      toast.success(
        t("users.toast.activated", {
          name: userName,
        })
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        handleErrors(error.response?.data.errors);
      }
    }
  }

  function handleDeactivateClick() {
    closeMenu();
    setConfirmState({
      kind: "deactivate",
    });
  }

  function handleDeleteClick() {
    closeMenu();
    setConfirmState({
      kind: "delete",
    });
  }
    async function handleConfirm() {
    if (!confirmState) return;

    setIsSubmitting(true);

    try {
      if (confirmState.kind === "deactivate") {
        await onSetActive({ ...isActive });

        toast.success(
          isActive.isActive
            ? t("users.toast.deactivated", {
                name: userName,
              })
            : t("users.toast.activated", {
                name: userName,
              })
        );
      } else {
        await onDelete(userId);

        toast.success(
          t("users.toast.deleted", {
            name: userName,
          })
        );
      }

      setConfirmState(null);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        handleErrors(error.response?.data.errors);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      if (
        triggerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }

      setMenuOpen(false);
    }

    if (menuOpen) {
      document.addEventListener(
        "mousedown",
        handleClickOutside
      );

      requestAnimationFrame(() => {
        updateMenuPosition();
      });

      window.addEventListener(
        "scroll",
        updateMenuPosition,
        true
      );

      window.addEventListener(
        "resize",
        updateMenuPosition
      );
    }

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );

      window.removeEventListener(
        "scroll",
        updateMenuPosition,
        true
      );

      window.removeEventListener(
        "resize",
        updateMenuPosition
      );
    };
  }, [menuOpen]);

  return (
    <>
      <div className="relative inline-block">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-label={t("users.actions.moreActions")}
          className="flex h-8 w-8 items-center justify-center rounded-[10px] text-[var(--ink-secondary)] transition-colors duration-150 hover:bg-[var(--sunken)] hover:text-[var(--ink-primary)]"
        >
          <MoreVertical size={16} />
        </button>
      </div>

      {menuOpen &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            className="fixed z-[9999] w-48 rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] py-1 shadow-[var(--elevation-1)]"
            style={{
              top: menuPosition.top,
              left: menuPosition.left,
              visibility:
                menuPosition.top === 0
                  ? "hidden"
                  : "visible",
            }}
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

                {isActive.isActive
                  ? t("users.actions.deactivate")
                  : t("users.actions.activate")}
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
          </div>,
          document.body
        )}

      <ConfirmationDialog
        open={confirmState?.kind === "deactivate"}
        tone="neutral"
        title={
          isActive.isActive
            ? t("users.dialogs.deactivate.title")
            : t("users.dialogs.activate.title")
        }
        body={
          isActive.isActive
            ? t("users.dialogs.deactivate.body")
            : t("users.dialogs.activate.body")
        }
        confirmLabel={
          isActive.isActive
            ? t("users.actions.deactivate")
            : t("users.actions.activate")
        }
        cancelLabel={t("users.actions.cancel")}
        isSubmitting={isSubmitting}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmState(null)}
      />

      <ConfirmationDialog
        open={confirmState?.kind === "delete"}
        tone="destructive"
        title={t("users.dialogs.delete.title")}
        body={t("users.dialogs.delete.body", {
          name: userName,
        })}
        confirmLabel={t("users.dialogs.delete.confirmLabel")}
        cancelLabel={t("users.actions.cancel")}
        isSubmitting={isSubmitting}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmState(null)}
      />
    </>
  );
}