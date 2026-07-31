// src/components/admin/products/ProductActionMenu.tsx

import { useEffect, useRef, useState } from "react";
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

  const menuRef = useRef<HTMLDivElement>(null);

  const deleteProduct = useDeleteProduct();

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  function closeMenu() {
    setIsOpen(false);
  }

  async function handleConfirmDelete() {
    try {
      await deleteProduct.mutateAsync(product.id);
      toast.success(t("products.toasts.deleteSuccess") ?? "");
      setIsConfirmOpen(false);
    } catch {
      toast.error(t("common.errors.actionFailed") ?? "");
    }
  }

  return (
    <div
      ref={menuRef}
      className="relative inline-block text-left"
    >
      <button
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

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-44 rounded-md border border-[var(--hairline)] bg-[var(--panel)] py-1 shadow-[var(--elevation-1)]"
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
        </div>
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
    </div>
  );
}