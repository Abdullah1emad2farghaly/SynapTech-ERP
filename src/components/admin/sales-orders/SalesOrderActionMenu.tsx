// Project path: src/components/admin/sales-orders/SalesOrderActionMenu.tsx

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import {
  MoreVertical,
  Eye,
  Pencil,
  Send,
  CheckCircle2,
  PackageOpen,
  XCircle,
  Printer,
  Copy,
} from "lucide-react";
import { getAvailableSalesOrderActions } from "../../../utils/salesOrderWorkflow";
import type { SalesOrderResponse } from "../../../types/salesOrders.types";
import { hasAnyPermission } from "@/utils/permissions";
import { getUserPermissions } from "@/pages/common/LoginPage";

interface SalesOrderActionMenuProps {
  order: SalesOrderResponse;
  onView: (order: SalesOrderResponse) => void;
  onEdit: (order: SalesOrderResponse) => void;
  onSubmit: (order: SalesOrderResponse) => void;
  onApprove: (order: SalesOrderResponse) => void;
  onShip: (order: SalesOrderResponse) => void;
  onCancel: (order: SalesOrderResponse) => void;
  onPrint: (order: SalesOrderResponse) => void;
  onDuplicate: (order: SalesOrderResponse) => void;
}

export function SalesOrderActionMenu({
  order,
  onView,
  onEdit,
  onSubmit,
  onApprove,
  onShip,
  onCancel,
  onPrint,
  onDuplicate,
}: SalesOrderActionMenuProps) {
  const { t } = useTranslation();

  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({
    top: 0,
    left: 0,
  });
  

  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
   const canCreateAccess = hasAnyPermission(["sales.orders.create"], getUserPermissions());
  const canCancelAccess = hasAnyPermission(["sales.orders.cancel"], getUserPermissions());
  const canShipAccess = hasAnyPermission(["sales.orders.ship"], getUserPermissions());
  const canApproveAccess = hasAnyPermission(["sales.orders.approve"], getUserPermissions());

  const available = getAvailableSalesOrderActions(order.status,{
    canCreateAccess,
    canCancelAccess,
    canShipAccess,
    canApproveAccess
  } );

  const items = [
    {
      key: "view",
      label: t("salesOrders.actions.view"),
      icon: Eye,
      onClick: onView,
    },
    {
      key: "edit",
      label: t("salesOrders.actions.edit"),
      icon: Pencil,
      onClick: onEdit,
    },
    {
      key: "submit",
      label: t("salesOrders.actions.submit"),
      icon: Send,
      onClick: onSubmit,
    },
    {
      key: "approve",
      label: t("salesOrders.actions.approve"),
      icon: CheckCircle2,
      onClick: onApprove,
    },
    {
      key: "ship",
      label: t("salesOrders.actions.ship"),
      icon: PackageOpen,
      onClick: onShip,
    },
    {
      key: "print",
      label: t("salesOrders.actions.print"),
      icon: Printer,
      onClick: onPrint,
    },
    {
      key: "duplicate",
      label: t("salesOrders.actions.duplicate"),
      icon: Copy,
      onClick: onDuplicate,
    },
    {
      key: "cancel",
      label: t("salesOrders.actions.cancel"),
      icon: XCircle,
      onClick: onCancel,
      destructive: true,
    },
  ].filter((item) => available.includes(item.key as never));

  const updateMenuPosition = () => {
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

  // Close when clicking anywhere outside the button/menu.
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

  // Position the menu and keep it aligned while scrolling/resizing.
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
            {items.map(
              ({
                key,
                label,
                icon: Icon,
                onClick,
                destructive,
              }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    onClick(order);
                  }}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-[--sunken] ${destructive
                      ? "text-[--error]"
                      : "text-[--ink-primary]"
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