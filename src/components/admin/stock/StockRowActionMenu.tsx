// src/components/admin/stock/StockRowActionMenu.tsx

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { useTranslation } from "react-i18next";
import {
  MoreVertical,
  ArrowLeftRight,
  Repeat,
  Package,
  Warehouse,
} from "lucide-react";

export interface StockRowActionMenuProps {
  productId: string;
  productName: string;
  warehouseId: string;
  warehouseName: string;

  onRecordMovement: (productId: string, warehouseId: string) => void;
  onTransfer: (productId: string, warehouseId: string) => void;
  onViewProduct: (productId: string) => void;
  onViewWarehouse?: (warehouseId: string) => void;

  hideViewWarehouse?: boolean;
}

export function StockRowActionMenu({
  productId,
  productName,
  warehouseId,
  warehouseName,
  onRecordMovement,
  onTransfer,
  onViewProduct,
  onViewWarehouse,
  hideViewWarehouse = false,
}: StockRowActionMenuProps) {
  const { t } = useTranslation();

  const [open, setOpen] = useState(false);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const menuId = useId();

  const closeMenu = () => {
    setOpen(false);
    requestAnimationFrame(() => buttonRef.current?.focus());
  };

  useEffect(() => {
    if (!open) return;

    const handleClick = (e: MouseEvent) => {
      if (
        menuRef.current?.contains(e.target as Node) ||
        buttonRef.current?.contains(e.target as Node)
      ) {
        return;
      }

      setOpen(false);
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeMenu();
      }
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEscape as any);

    requestAnimationFrame(() => {
      menuRef.current
        ?.querySelector<HTMLElement>('[role="menuitem"]')
        ?.focus();
    });

    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEscape as any);
    };
  }, [open]);

  const handleMenuKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const items = Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []
    );

    const current = document.activeElement as HTMLElement;
    const index = items.indexOf(current);

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        items[(index + 1) % items.length]?.focus();
        break;

      case "ArrowUp":
        e.preventDefault();
        items[(index - 1 + items.length) % items.length]?.focus();
        break;

      case "Home":
        e.preventDefault();
        items[0]?.focus();
        break;

      case "End":
        e.preventDefault();
        items[items.length - 1]?.focus();
        break;

      case "Escape":
        e.preventDefault();
        closeMenu();
        break;
    }
  };

  const itemClass =
    "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm text-[var(--ink-primary)] transition-colors hover:bg-[var(--surface-hover)] focus:bg-[var(--surface-hover)] focus:outline-none";

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        id={`${menuId}-button`}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={t("stock.actions.moreActions", {
          product: productName,
        })}
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--ink-secondary)] transition hover:bg-[var(--surface-hover)] hover:text-[var(--ink-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
      >
        <MoreVertical size={16} />
      </button>

      {open && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-labelledby={`${menuId}-button`}
          tabIndex={-1}
          onKeyDown={handleMenuKeyDown}
          className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-xl border border-[var(--hairline)] bg-[var(--panel)] p-1 shadow-xl animate-in fade-in zoom-in-95 duration-100"
        >
          <button
            role="menuitem"
            type="button"
            className={itemClass}
            onClick={() => {
              closeMenu();
              onRecordMovement(productId, warehouseId);
            }}
          >
            <Repeat size={16} />
            {t("stock.actions.recordMovement")}
          </button>

          <button
            role="menuitem"
            type="button"
            className={itemClass}
            onClick={() => {
              closeMenu();
              onTransfer(productId, warehouseId);
            }}
          >
            <ArrowLeftRight size={16} />
            {t("stock.actions.transfer")}
          </button>

          <div className="my-1 border-t border-[var(--hairline)]" />

          <button
            role="menuitem"
            type="button"
            className={itemClass}
            onClick={() => {
              closeMenu();
              onViewProduct(productId);
            }}
          >
            <Package size={16} />
            {t("stock.actions.viewProduct", {
              name: productName,
            })}
          </button>

          {!hideViewWarehouse && onViewWarehouse && (
            <button
              role="menuitem"
              type="button"
              className={itemClass}
              onClick={() => {
                closeMenu();
                onViewWarehouse(warehouseId);
              }}
            >
              <Warehouse size={16} />
              {t("stock.actions.viewWarehouse", {
                name: warehouseName,
              })}
            </button>
          )}
        </div>
      )}
    </div>
  );
}