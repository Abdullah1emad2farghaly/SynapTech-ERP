// Project path: src/components/admin/customers/CustomerActionMenu.tsx

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import {
  MoreVertical,
  Eye,
  Pencil,
  UserX,
  UserCheck,
  Trash2,
} from "lucide-react";
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

  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const [menuPosition, setMenuPosition] = useState({
    top: 0,
    left: 0,
  });

  function closeMenu() {
    setMenuOpen(false);
  }

  function updateMenuPosition() {
    if (!buttonRef.current || !menuRef.current) return;

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const menuRect = menuRef.current.getBoundingClientRect();

    const spacing = 4;
    const viewportPadding = 8;

    let top = buttonRect.bottom + spacing;
    let left = buttonRect.right - menuRect.width;

    // Open above the button if there is not enough space below.
    if (
      top + menuRect.height >
      window.innerHeight - viewportPadding
    ) {
      top = buttonRect.top - menuRect.height - spacing;
    }

    // Keep menu inside the viewport horizontally.
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

    // Keep menu inside viewport vertically.
    if (top < viewportPadding) {
      top = viewportPadding;
    }

    setMenuPosition({
      top,
      left,
    });
  }

  /*
   * Close menu when clicking anywhere outside
   * the button or the menu.
   */
  useEffect(() => {
    if (!menuOpen) return;

    function handleOutsideClick(event: MouseEvent) {
      const target = event.target as Node;

      const clickedButton =
        buttonRef.current?.contains(target);

      const clickedMenu =
        menuRef.current?.contains(target);

      if (!clickedButton && !clickedMenu) {
        closeMenu();
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, [menuOpen]);

  /*
   * Recalculate menu position when opened,
   * scrolling, or resizing.
   */
  useEffect(() => {
    if (!menuOpen) return;

    requestAnimationFrame(() => {
      updateMenuPosition();
    });

    const handleScroll = () => {
      updateMenuPosition();
    };

    const handleResize = () => {
      updateMenuPosition();
    };

    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [menuOpen]);

  async function handleActivate() {
    closeMenu();

    try {
      await onSetActive(customerId, true);

      toast.success(
        t("customers.toast.activated", {
          name: customerName,
        })
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        handleErrors(error.response?.data?.errors);
      }
    }
  }

  return (
    <>
      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-label={t("customers.actions.moreActions")}
          className="inline-flex items-center justify-center rounded-md p-1.5 text-[--ink-secondary] hover:bg-[--sunken]"
        >
          <MoreVertical size={16} />
        </button>
      </div>

      {menuOpen &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            className="fixed z-[9999] w-44 overflow-hidden rounded-md border border-[--hairline] bg-[--panel] py-1 shadow-[var(--elevation-1)]"
            style={{
              top: menuPosition.top,
              left: menuPosition.left,
              visibility:
                menuPosition.top === 0
                  ? "hidden"
                  : "visible",
            }}
          >
            {/* View Details */}
            <button
              role="menuitem"
              type="button"
              onClick={() => {
                closeMenu();
                onViewDetails(customerId);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[--ink-primary] hover:bg-[--sunken]"
            >
              <Eye size={15} />
              {t("customers.actions.viewDetails")}
            </button>

            {/* Edit */}
            <button
              role="menuitem"
              type="button"
              onClick={() => {
                closeMenu();
                onEdit(customerId);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[--ink-primary] hover:bg-[--sunken]"
            >
              <Pencil size={15} />
              {t("customers.actions.edit")}
            </button>

            {/* Deactivate / Activate */}
            {isActive ? (
              <button
                role="menuitem"
                type="button"
                onClick={() => {
                  closeMenu();
                  onDeactivateRequest(customerId);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[--ink-primary] hover:bg-[--sunken]"
              >
                <UserX size={15} />
                {t("customers.actions.deactivate")}
              </button>
            ) : (
              <button
                role="menuitem"
                type="button"
                onClick={handleActivate}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[--ink-primary] hover:bg-[--sunken]"
              >
                <UserCheck size={15} />
                {t("customers.actions.activate")}
              </button>
            )}

            {/* Delete */}
            <button
              role="menuitem"
              type="button"
              onClick={() => {
                closeMenu();
                onDeleteRequest(customerId);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[--error] hover:bg-[--sunken]"
            >
              <Trash2 size={15} />
              {t("customers.actions.delete")}
            </button>
          </div>,
          document.body
        )}
    </>
  );
}