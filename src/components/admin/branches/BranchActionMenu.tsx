// src/components/admin/branches/BranchActionMenu.tsx
//
// Row-level kebab menu: View Details, Edit, Duplicate, Deactivate/Activate,
// Delete. Same conventions as UserActionMenu/DepartmentActionMenu.
//
// The menu is rendered through a portal so it is not clipped by the table's
// overflow/scroll container. It automatically opens above the row when there
// is not enough space below, stays inside the viewport, and closes when the
// user clicks anywhere outside the menu.
//
// Delete is blocked + explained when the branch is referenced by any
// Department or User, and shows a stronger warning in the confirmation
// dialog itself when the branch isMain.

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
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
import axios from "axios";
import { handleErrors } from "@/utils/HandleErrors";

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

type ConfirmState =
  | { kind: "deactivate" | "delete" }
  | null;

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
  const [confirmState, setConfirmState] =
    useState<ConfirmState>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const [menuPosition, setMenuPosition] = useState({
    top: 0,
    left: 0,
  });

  const deleteBlocked = hasDepartments || hasUsers;

  function closeMenu() {
    setMenuOpen(false);

    requestAnimationFrame(() => {
      buttonRef.current?.focus();
    });
  }

  function updateMenuPosition() {
    if (!buttonRef.current || !menuRef.current) {
      return;
    }

    const buttonRect =
      buttonRef.current.getBoundingClientRect();

    const menuRect =
      menuRef.current.getBoundingClientRect();

    const spacing = 4;
    const viewportPadding = 8;

    // Default position: below the three-dot button.
    let top = buttonRect.bottom + spacing;

    // Align the menu's right edge with the button.
    let left = buttonRect.right - menuRect.width;

    // If there isn't enough space below, open ABOVE the row.
    if (
      top + menuRect.height >
      window.innerHeight - viewportPadding
    ) {
      top =
        buttonRect.top -
        menuRect.height -
        spacing;
    }

    // Prevent the menu from going outside the viewport horizontally.
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

    // Prevent the menu from going outside the viewport vertically.
    if (top < viewportPadding) {
      top = viewportPadding;
    }

    setMenuPosition({
      top,
      left,
    });
  }

  /**
   * Close when clicking anywhere outside this specific menu.
   */
  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        buttonRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }

      setMenuOpen(false);
    };

    const handleEscape = (
      event: globalThis.KeyboardEvent
    ) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    document.addEventListener(
      "keydown",
      handleEscape
    );

    // The portal menu needs to exist before we can measure it.
    requestAnimationFrame(() => {
      updateMenuPosition();
    });

    const handleScroll = () => {
      updateMenuPosition();
    };

    const handleResize = () => {
      updateMenuPosition();
    };

    // Capture scrolling from the table/container as well
    // as normal window scrolling.
    window.addEventListener(
      "scroll",
      handleScroll,
      true
    );

    window.addEventListener(
      "resize",
      handleResize
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );

      document.removeEventListener(
        "keydown",
        handleEscape
      );

      window.removeEventListener(
        "scroll",
        handleScroll,
        true
      );

      window.removeEventListener(
        "resize",
        handleResize
      );
    };
  }, [menuOpen]);

  async function handleActivate() {
    closeMenu();

    try {
      await onSetActive(branchId, true);

      toast.success(
        t("branches.toast.activated", {
          name: branchName,
        })
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        handleErrors(error.response?.data.errors);
      }
    }
  }

  async function handleConfirm() {
    if (!confirmState) return;

    setIsSubmitting(true);

    try {
      if (confirmState.kind === "deactivate") {
        await onSetActive(branchId, false);

        toast.success(
          t("branches.toast.deactivated", {
            name: branchName,
          })
        );
      } else {
        await onDelete(branchId);

        toast.success(
          t("branches.toast.deleted", {
            name: branchName,
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

  const deleteBody = isMain
    ? `${t(
        "branches.dialogs.delete.body",
        { name: branchName }
      )} ${t(
        "branches.dialogs.delete.mainBranchWarning"
      )}`
    : t("branches.dialogs.delete.body", {
        name: branchName,
      });

  const handleMenuKeyDown = (
    event: ReactKeyboardEvent<HTMLDivElement>
  ) => {
    const items = Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>(
        '[role="menuitem"]:not([disabled])'
      ) ?? []
    );

    const current =
      document.activeElement as HTMLElement;

    const index = items.indexOf(current);

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();

        items[
          (index + 1) % items.length
        ]?.focus();

        break;

      case "ArrowUp":
        event.preventDefault();

        items[
          (index - 1 + items.length) %
            items.length
        ]?.focus();

        break;

      case "Home":
        event.preventDefault();
        items[0]?.focus();
        break;

      case "End":
        event.preventDefault();

        items[
          items.length - 1
        ]?.focus();

        break;

      case "Escape":
        event.preventDefault();
        closeMenu();
        break;
    }
  };

  return (
    <>
      <div className="relative inline-block text-start">
        <button
          ref={buttonRef}
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setMenuOpen((v) => !v);
          }}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-label={t(
            "branches.actions.moreActions"
          )}
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
            tabIndex={-1}
            onKeyDown={handleMenuKeyDown}
            className="fixed z-[9999] w-52 rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] py-1 shadow-[var(--elevation-1)]"
            style={{
              top: menuPosition.top,
              left: menuPosition.left,
              visibility:
                menuPosition.top === 0
                  ? "hidden"
                  : "visible",
            }}
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            <button
              role="menuitem"
              type="button"
              onClick={() => {
                closeMenu();
                onViewDetails(branchId);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-start text-sm text-[var(--ink-primary)] hover:bg-[var(--sunken)] focus:bg-[var(--sunken)] focus:outline-none"
            >
              <Eye size={15} />

              {t(
                "branches.actions.viewDetails"
              )}
            </button>

            <button
              role="menuitem"
              type="button"
              onClick={() => {
                closeMenu();
                onEdit(branchId);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-start text-sm text-[var(--ink-primary)] hover:bg-[var(--sunken)] focus:bg-[var(--sunken)] focus:outline-none"
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
              className="flex w-full items-center gap-2 px-3 py-2 text-start text-sm text-[var(--ink-primary)] hover:bg-[var(--sunken)] focus:bg-[var(--sunken)] focus:outline-none"
            >
              <Copy size={15} />

              {t(
                "branches.actions.duplicate"
              )}
            </button>

            {isActive ? (
              <button
                role="menuitem"
                type="button"
                onClick={() => {
                  closeMenu();
                  setConfirmState({
                    kind: "deactivate",
                  });
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-start text-sm text-[var(--ink-primary)] hover:bg-[var(--sunken)] focus:bg-[var(--sunken)] focus:outline-none"
              >
                <UserX size={15} />

                {t(
                  "branches.actions.deactivate"
                )}
              </button>
            ) : (
              <button
                role="menuitem"
                type="button"
                onClick={handleActivate}
                className="flex w-full items-center gap-2 px-3 py-2 text-start text-sm text-[var(--ink-primary)] hover:bg-[var(--sunken)] focus:bg-[var(--sunken)] focus:outline-none"
              >
                <UserCheck size={15} />

                {t(
                  "branches.actions.activate"
                )}
              </button>
            )}

            <button
              role="menuitem"
              type="button"
              disabled={deleteBlocked}
              onClick={() => {
                if (deleteBlocked) return;

                closeMenu();

                setConfirmState({
                  kind: "delete",
                });
              }}
              title={
                deleteBlocked
                  ? hasDepartments
                    ? t(
                        "branches.dialogs.delete.blockedHasDepartments"
                      )
                    : t(
                        "branches.dialogs.delete.blockedHasUsers"
                      )
                  : undefined
              }
              className="flex w-full items-center gap-2 px-3 py-2 text-start text-sm text-[var(--error)] hover:bg-[var(--sunken)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent focus:outline-none"
            >
              <Trash2 size={15} />

              {t("branches.actions.delete")}
            </button>
          </div>,
          document.body
        )}

      <ConfirmationDialog
        open={
          confirmState?.kind === "deactivate"
        }
        tone="neutral"
        title={t(
          "branches.dialogs.deactivate.title"
        )}
        body={t(
          "branches.dialogs.deactivate.body"
        )}
        confirmLabel={t(
          "branches.actions.deactivate"
        )}
        cancelLabel={t(
          "users.actions.cancel"
        )}
        isSubmitting={isSubmitting}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmState(null)}
      />

      <ConfirmationDialog
        open={confirmState?.kind === "delete"}
        tone="destructive"
        title={t(
          "branches.dialogs.delete.title"
        )}
        body={deleteBody}
        confirmLabel={t(
          "branches.actions.delete"
        )}
        cancelLabel={t(
          "users.actions.cancel"
        )}
        isSubmitting={isSubmitting}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmState(null)}
      />
    </>
  );
}