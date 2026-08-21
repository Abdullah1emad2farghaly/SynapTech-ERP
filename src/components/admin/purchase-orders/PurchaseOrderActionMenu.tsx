// Project path: src/components/admin/purchase-orders/PurchaseOrderActionMenu.tsx

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
import { getAvailablePurchaseOrderActions } from "../../../utils/purchaseOrderWorkflow";
import type { PurchaseOrderResponse } from "../../../types/purchaseOrders.types";
import { hasAnyPermission } from "@/utils/permissions";
import { getUserPermissions } from "@/pages/common/LoginPage";

interface PurchaseOrderActionMenuProps {
  order: PurchaseOrderResponse;
  onView: (order: PurchaseOrderResponse) => void;
  onEdit: (order: PurchaseOrderResponse) => void;
  onSubmit: (order: PurchaseOrderResponse) => void;
  onApprove: (order: PurchaseOrderResponse) => void;
  onReceive: (order: PurchaseOrderResponse) => void;
  onCancel: (order: PurchaseOrderResponse) => void;
  onPrint: (order: PurchaseOrderResponse) => void;
  onDuplicate: (order: PurchaseOrderResponse) => void;
}

export function PurchaseOrderActionMenu({
  order,
  onView,
  onEdit,
  onSubmit,
  onApprove,
  onReceive,
  onCancel,
  onPrint,
  onDuplicate,
}: PurchaseOrderActionMenuProps) {
  const { t } = useTranslation();
  const canManageAccess = hasAnyPermission(["purchasing.orders.manage"], getUserPermissions())
    const canCteateAccess = hasAnyPermission(["purchasing.orders.create"], getUserPermissions())
    const canApproveAccess = hasAnyPermission(["purchasing.orders.approve"], getUserPermissions())
    const canCancelAccess = hasAnyPermission(["purchasing.orders.cancel"], getUserPermissions())
    const canReceiveAccess = hasAnyPermission(["purchasing.orders.receive"], getUserPermissions())
  
    const access = {
      canManageAccess,
      canCteateAccess,
      canApproveAccess,
      canCancelAccess,
      canReceiveAccess
    }

  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({
    top: 0,
    left: 0,
  });

  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const available = getAvailablePurchaseOrderActions(order.status, access);

  const items = [
    {
      key: "view",
      label: t("purchaseOrders.actions.view"),
      icon: Eye,
      onClick: onView,
    },
    {
      key: "edit",
      label: t("purchaseOrders.actions.edit"),
      icon: Pencil,
      onClick: onEdit,
    },
    {
      key: "submit",
      label: t("purchaseOrders.actions.submit"),
      icon: Send,
      onClick: onSubmit,
    },
    {
      key: "approve",
      label: t("purchaseOrders.actions.approve"),
      icon: CheckCircle2,
      onClick: onApprove,
    },
    {
      key: "receive",
      label: t("purchaseOrders.actions.receive"),
      icon: PackageOpen,
      onClick: onReceive,
    },
    {
      key: "print",
      label: t("purchaseOrders.actions.print"),
      icon: Printer,
      onClick: onPrint,
    },
    {
      key: "duplicate",
      label: t("purchaseOrders.actions.duplicate"),
      icon: Copy,
      onClick: onDuplicate,
    },
    {
      key: "cancel",
      label: t("purchaseOrders.actions.cancel"),
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

  // Close the menu when clicking anywhere outside it.
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

  // Keep the menu aligned with the button while scrolling/resizing.
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
                  role="menuitem"
                  onClick={() => {
                    setOpen(false);
                    onClick(order);
                  }}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-[--sunken] ${
                    destructive
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