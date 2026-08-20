// Project path: src/components/admin/warehouses/WarehouseActionMenu.tsx
//
// View opens the same drawer as Edit — see spec §9 (no second page/drawer
// variant for a 5-field record). Activate/Deactivate are instant + toast,
// no dialog, matching Branches/Departments' existing convention.
//
// The dropdown is rendered through a portal so it is not clipped by
// table overflow. It automatically opens above the button when there
// isn't enough space below, and closes when clicking outside.

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import {
  MoreVertical,
  Eye,
  Pencil,
  CheckCircle2,
  XCircle,
  Trash2,
} from "lucide-react";
import type { WarehouseResponse } from "../../../types/warehouses.types";

interface WarehouseActionMenuProps {
  warehouse: WarehouseResponse;
  onView: (warehouse: WarehouseResponse) => void;
  onEdit: (warehouse: WarehouseResponse) => void;
  onToggleActive: (warehouse: WarehouseResponse) => void;
  onDelete: (warehouse: WarehouseResponse) => void;
}

export function WarehouseActionMenu({
  warehouse,
  onView,
  onEdit,
  onToggleActive,
  onDelete,
}: WarehouseActionMenuProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const [menuPosition, setMenuPosition] = useState({
    top: 0,
    left: 0,
  });

  const updateMenuPosition = () => {
    if (!buttonRef.current || !menuRef.current) return;

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const menuRect = menuRef.current.getBoundingClientRect();

    const spacing = 4;
    const viewportPadding = 8;

    let top = buttonRect.bottom + spacing;
    let left = buttonRect.right - menuRect.width;

    // Open above the button when there isn't enough space below.
    if (
      top + menuRect.height >
      window.innerHeight - viewportPadding
    ) {
      top = buttonRect.top - menuRect.height - spacing;
    }

    // Keep the menu inside the viewport horizontally.
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

    // Keep the menu inside the viewport vertically.
    if (top < viewportPadding) {
      top = viewportPadding;
    }

    setMenuPosition({
      top,
      left,
    });
  };

  // Close the menu when clicking anywhere outside the button/menu.
  useEffect(() => {
    if (!open) return;

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;

      const clickedButton =
        buttonRef.current?.contains(target);

      const clickedMenu =
        menuRef.current?.contains(target);

      if (!clickedButton && !clickedMenu) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, [open]);

  // Keep the menu aligned while scrolling/resizing.
  useEffect(() => {
    if (!open) return;

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
  }, [open]);

  return (
    <>
      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label={t("warehouses.actions.moreActions")}
          className="inline-flex items-center justify-center rounded-md p-1.5 text-[--ink-secondary] hover:bg-[--sunken]"
        >
          <MoreVertical size={16} />
        </button>
      </div>

      {open &&
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
            {/* View */}
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onView(warehouse);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[--ink-primary] hover:bg-[--sunken]"
            >
              <Eye size={15} />
              {t("warehouses.actions.view")}
            </button>

            {/* Edit */}
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onEdit(warehouse);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[--ink-primary] hover:bg-[--sunken]"
            >
              <Pencil size={15} />
              {t("warehouses.actions.edit")}
            </button>

            {/* Activate / Deactivate */}
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onToggleActive(warehouse);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[--ink-primary] hover:bg-[--sunken]"
            >
              {warehouse.isActive ? (
                <>
                  <XCircle size={15} />
                  {t("warehouses.actions.deactivate")}
                </>
              ) : (
                <>
                  <CheckCircle2 size={15} />
                  {t("warehouses.actions.activate")}
                </>
              )}
            </button>

            {/* Delete */}
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onDelete(warehouse);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[--error] hover:bg-[--sunken]"
            >
              <Trash2 size={15} />
              {t("warehouses.actions.delete")}
            </button>
          </div>,
          document.body
        )}
    </>
  );
}