// Project path: src/components/admin/sales-orders/SalesOrderActionMenu.tsx

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
import { getAvailableSalesOrderActions } from "../../../utils/salesOrderWorkflow";
import type { SalesOrderResponse } from "../../../types/salesOrders.types";

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
  const available = getAvailableSalesOrderActions(order.status);

  const items = [
    { key: "view", label: t("salesOrders.actions.view"), icon: Eye, onClick: onView },
    { key: "edit", label: t("salesOrders.actions.edit"), icon: Pencil, onClick: onEdit },
    { key: "submit", label: t("salesOrders.actions.submit"), icon: Send, onClick: onSubmit },
    { key: "approve", label: t("salesOrders.actions.approve"), icon: CheckCircle2, onClick: onApprove },
    { key: "ship", label: t("salesOrders.actions.ship"), icon: PackageOpen, onClick: onShip },
    { key: "print", label: t("salesOrders.actions.print"), icon: Printer, onClick: onPrint },
    { key: "duplicate", label: t("salesOrders.actions.duplicate"), icon: Copy, onClick: onDuplicate },
    { key: "cancel", label: t("salesOrders.actions.cancel"), icon: XCircle, onClick: onCancel, destructive: true },
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
