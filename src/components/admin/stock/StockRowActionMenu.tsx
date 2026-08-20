// src/components/admin/stock/StockRowActionMenu.tsx

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
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

  const [menuPosition, setMenuPosition] = useState({
    top: 0,
    left: 0,
  });

  const closeMenu = () => {
    setOpen(false);

    requestAnimationFrame(() => {
      buttonRef.current?.focus();
    });
  };

  const updateMenuPosition = () => {
    if (!buttonRef.current || !menuRef.current) return;

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const menuRect = menuRef.current.getBoundingClientRect();

    const spacing = 8;
    const viewportPadding = 8;

    let top = buttonRect.bottom + spacing;
    let left = buttonRect.right - menuRect.width;

    // Open above the button if there isn't enough space below.
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

  useEffect(() => {
    if (!open) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;

      if (
        menuRef.current?.contains(target) ||
        buttonRef.current?.contains(target)
      ) {
        return;
      }

      setOpen(false);
    };

    const handleEscape = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        closeMenu();
      }
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEscape);

    requestAnimationFrame(() => {
      updateMenuPosition();

      menuRef.current
        ?.querySelector<HTMLElement>('[role="menuitem"]')
        ?.focus();
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
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEscape);

      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [open]);

  const handleMenuKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const items = Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>(
        '[role="menuitem"]'
      ) ?? []
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
    <>
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
      </div>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            id={menuId}
            role="menu"
            aria-labelledby={`${menuId}-button`}
            tabIndex={-1}
            onKeyDown={handleMenuKeyDown}
            className="fixed z-[9999] w-56  rounded-xl border border-[var(--hairline)] bg-[var(--panel)] p-1 shadow-xl animate-in fade-in zoom-in-95 duration-100"
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
          </div>,
          document.body
        )}
    </>
  );
}