// Project path: src/components/admin/purchase-orders/PurchaseOrderActionMenu.tsx

import { useState } from "react";
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
  const [open, setOpen] = useState(false);
  const available = getAvailablePurchaseOrderActions(order.status);

  const items = [
    { key: "view", label: t("purchaseOrders.actions.view"), icon: Eye, onClick: onView },
    { key: "edit", label: t("purchaseOrders.actions.edit"), icon: Pencil, onClick: onEdit },
    { key: "submit", label: t("purchaseOrders.actions.submit"), icon: Send, onClick: onSubmit },
    { key: "approve", label: t("purchaseOrders.actions.approve"), icon: CheckCircle2, onClick: onApprove },
    { key: "receive", label: t("purchaseOrders.actions.receive"), icon: PackageOpen, onClick: onReceive },
    { key: "print", label: t("purchaseOrders.actions.print"), icon: Printer, onClick: onPrint },
    { key: "duplicate", label: t("purchaseOrders.actions.duplicate"), icon: Copy, onClick: onDuplicate },
    { key: "cancel", label: t("purchaseOrders.actions.cancel"), icon: XCircle, onClick: onCancel, destructive: true },
  ].filter((item) => available.includes(item.key as never));

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        className="inline-flex items-center justify-center rounded-md p-1.5 text-[--ink-secondary] hover:bg-[--sunken]"
      >
        <MoreVertical size={16} />
      </button>

      {open && (
        <div className="absolute end-0 z-10 mt-1 w-44 overflow-hidden rounded-md border border-[--hairline] bg-[--panel] py-1 shadow-[var(--elevation-1)]">
          {items.map(({ key, label, icon: Icon, onClick, destructive }) => (
            <button
              key={key}
              type="button"
              onClick={() => onClick(order)}
              className={`flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-[--sunken] ${
                destructive ? "text-[--error]" : "text-[--ink-primary]"
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
