// Project path: src/components/admin/roles/RoleActionMenu.tsx
//
// "Duplicate" reads the role and opens Create Role pre-filled — same UI
// composition pattern used for Departments/Branches, not a new endpoint.

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import {
  MoreVertical,
  Eye,
  Pencil,
  KeyRound,
  Copy,
  Trash2,
} from "lucide-react";
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

  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const [menuPosition, setMenuPosition] = useState({
    top: 0,
    left: 0,
  });

  const items = [
    {
      label: t("roles.actions.view"),
      icon: Eye,
      onClick: () => onView(role),
    },
    {
      label: t("roles.actions.edit"),
      icon: Pencil,
      onClick: () => onEdit(role),
    },
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

  function closeMenu() {
    setOpen(false);
  }

  function updateMenuPosition() {
    if (!buttonRef.current || !menuRef.current) return;

    const buttonRect =
      buttonRef.current.getBoundingClientRect();

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

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      if (
        buttonRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }

      setOpen(false);
    }

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
  }, [open]);

  return (
    <>
      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="inline-flex items-center justify-center rounded-md p-1.5 text-[var(--ink-secondary)] transition-colors hover:bg-[var(--sunken)]"
        >
          <MoreVertical size={16} />
        </button>
      </div>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            className="fixed z-[9999] w-48 overflow-hidden rounded-md border border-[var(--hairline)] bg-[var(--panel)] py-1 shadow-[var(--elevation-1)]"
            style={{
              top: menuPosition.top,
              left: menuPosition.left,
              visibility:
                menuPosition.top === 0
                  ? "hidden"
                  : "visible",
            }}
          >
            {items.map(
              ({
                label,
                icon: Icon,
                onClick,
                destructive,
              }) => (
                <button
                  key={label}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    closeMenu();
                    onClick();
                  }}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-[var(--sunken)] ${
                    destructive
                      ? "text-[var(--error)]"
                      : "text-[var(--ink-primary)]"
                  }`}
                >
                  <Icon size={15} />
                  {label}
                </button>
              )
            )}
          </div>,
          document.body
        )}
    </>
  );
}