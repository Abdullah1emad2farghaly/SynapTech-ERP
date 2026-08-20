// src/components/admin/products/ProductActionMenu.tsx

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import {
  Copy,
  Eye,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { ConfirmationDialog } from "../../common/ConfirmationDialog";
import { useDeleteProduct } from "../../../hooks/useProducts";
import toast from "react-hot-toast";
import type { Product } from "../../../services/api/products.api";
import axios from "axios";
import { handleErrors } from "@/utils/HandleErrors";

export interface ProductActionMenuProps {
  product: Product;
  onEdit: () => void;
  onDuplicate: () => void;
  onViewDetails: () => void;
  onDelete?: () => void;
}

export function ProductActionMenu({
  product,
  onEdit,
  onDuplicate,
  onViewDetails,
}: ProductActionMenuProps) {
  const { t } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const [menuPosition, setMenuPosition] = useState({
    top: 0,
    left: 0,
  });

  const deleteProduct = useDeleteProduct();

  function closeMenu() {
    setIsOpen(false);
  }

  function updateMenuPosition() {
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
  }

  // Close when clicking anywhere outside the button/menu.
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      const clickedButton =
        buttonRef.current?.contains(target);

      const clickedMenu =
        menuRef.current?.contains(target);

      if (!clickedButton && !clickedMenu) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, [isOpen]);

  // Position the menu and keep it aligned while scrolling/resizing.
  useEffect(() => {
    if (!isOpen) return;

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
  }, [isOpen]);

  async function handleConfirmDelete() {
    try {
      await deleteProduct.mutateAsync(product.id);

      toast.success(t("products.toasts.deleteSuccess") ?? "");

      setIsConfirmOpen(false);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        handleErrors(error.response?.data?.errors);
      }
    }
  }

  return (
    <>
      <div className="relative inline-block text-left">
        <button
          ref={buttonRef}
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setIsOpen((prev) => !prev);
          }}
          aria-haspopup="menu"
          aria-expanded={isOpen}
          aria-label={t("common.actions.openMenu") ?? ""}
          className="flex h-9 w-9 items-center justify-center rounded-md text-[var(--ink-secondary)] transition-colors duration-150 ease-out hover:bg-[var(--sunken)] focus:outline-none focus:ring-2 focus:ring-[var(--synapse)]/40"
        >
          <MoreVertical size={16} />
        </button>
      </div>

      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            className="fixed z-[9999] w-44 overflow-hidden rounded-md border border-[var(--hairline)] bg-[var(--panel)] py-1 shadow-[var(--elevation-1)]"
            style={{
              top: menuPosition.top,
              left: menuPosition.left,
              visibility:
                menuPosition.top === 0
                  ? "hidden"
                  : "visible",
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                closeMenu();
                onViewDetails();
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[var(--ink-primary)] hover:bg-[var(--sunken)]"
            >
              <Eye size={14} />
              {t("common.actions.viewDetails")}
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={() => {
                closeMenu();
                onEdit();
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[var(--ink-primary)] hover:bg-[var(--sunken)]"
            >
              <Pencil size={14} />
              {t("common.actions.edit")}
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={() => {
                closeMenu();
                onDuplicate();
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[var(--ink-primary)] hover:bg-[var(--sunken)]"
            >
              <Copy size={14} />
              {t("common.actions.duplicate")}
            </button>

            <div className="my-1 border-t border-[var(--hairline)]" />

            <button
              type="button"
              role="menuitem"
              onClick={() => {
                closeMenu();
                setIsConfirmOpen(true);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[var(--error)] hover:bg-[var(--sunken)]"
            >
              <Trash2 size={14} />
              {t("common.actions.delete")}
            </button>
          </div>,
          document.body
        )}

      <ConfirmationDialog
        open={isConfirmOpen}
        tone="destructive"
        title={t("products.deleteDialog.title")}
        body={t("products.deleteDialog.body", { name: product.name })}
        confirmLabel={t("common.actions.delete")}
        cancelLabel={t("common.actions.cancel")}
        isSubmitting={deleteProduct.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </>
  );
}