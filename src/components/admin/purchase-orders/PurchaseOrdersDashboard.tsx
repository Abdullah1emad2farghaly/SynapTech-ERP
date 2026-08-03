// Project path: src/components/admin/purchase-orders/PurchaseOrdersDashboard.tsx
//
// All figures derived from the confirmed full list (status, totalAmount,
// warnings). No trend arrows/sparklines — no historical snapshot data exists,
// see spec §4. Cards are clickable, pre-filtering the list by that status.

import { useTranslation } from "react-i18next";
import {
  FileText,
  FileEdit,
  Send,
  CheckCircle2,
  PackageOpen,
  PackageCheck,
  XCircle,
  AlertTriangle,
  DollarSign,
} from "lucide-react";
import type { PurchaseOrderResponse } from "../../../types/purchaseOrders.types";

interface PurchaseOrdersDashboardProps {
  orders: PurchaseOrderResponse[];
  isLoading?: boolean;
  onCardClick?: (status: string | null) => void;
}

function Card({
  icon,
  label,
  value,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 rounded-lg border border-[--hairline] bg-[--panel] p-4 text-start shadow-[var(--elevation-1)] transition-transform duration-150 ease-out hover:-translate-y-0.5"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[--signal]/10 text-[--signal]">
        {icon}
      </span>
      <div>
        <p className="text-xl font-semibold text-[--ink-primary]">{value}</p>
        <p className="text-xs text-[--ink-secondary]">{label}</p>
      </div>
    </button>
  );
}

export function PurchaseOrdersDashboard({
  orders,
  isLoading,
  onCardClick,
}: PurchaseOrdersDashboardProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="h-[68px] animate-pulse rounded-lg bg-[--sunken]" />
        ))}
      </div>
    );
  }

  const countByStatus = (status: string) => orders.filter((o) => o.status === status).length;
  const withWarnings = orders.filter((o) => o.warnings.length > 0).length;
  const totalValue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const outstandingValue = orders
    .filter((o) => o.status !== "Received" && o.status !== "Cancelled")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      <Card icon={<FileText size={18} />} label={t("purchaseOrders.stats.total")} value={String(orders.length)} onClick={() => onCardClick?.(null)} />
      <Card icon={<FileEdit size={18} />} label={t("purchaseOrders.status.Draft")} value={String(countByStatus("Draft"))} onClick={() => onCardClick?.("Draft")} />
      <Card icon={<Send size={18} />} label={t("purchaseOrders.status.Submitted")} value={String(countByStatus("Submitted"))} onClick={() => onCardClick?.("Submitted")} />
      <Card icon={<CheckCircle2 size={18} />} label={t("purchaseOrders.status.Approved")} value={String(countByStatus("Approved"))} onClick={() => onCardClick?.("Approved")} />
      <Card icon={<PackageOpen size={18} />} label={t("purchaseOrders.status.PartiallyReceived")} value={String(countByStatus("PartiallyReceived"))} onClick={() => onCardClick?.("PartiallyReceived")} />
      <Card icon={<PackageCheck size={18} />} label={t("purchaseOrders.status.Received")} value={String(countByStatus("Received"))} onClick={() => onCardClick?.("Received")} />
      <Card icon={<XCircle size={18} />} label={t("purchaseOrders.status.Cancelled")} value={String(countByStatus("Cancelled"))} onClick={() => onCardClick?.("Cancelled")} />
      <Card icon={<AlertTriangle size={18} />} label={t("purchaseOrders.stats.withWarnings")} value={String(withWarnings)} />
      <Card icon={<DollarSign size={18} />} label={t("purchaseOrders.stats.totalValue")} value={totalValue.toFixed(2)} />
      <Card icon={<DollarSign size={18} />} label={t("purchaseOrders.stats.outstandingValue")} value={outstandingValue.toFixed(2)} />
    </div>
  );
}
