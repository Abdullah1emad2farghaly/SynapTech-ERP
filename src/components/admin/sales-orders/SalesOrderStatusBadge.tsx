// Project path: src/components/admin/sales-orders/SalesOrderStatusBadge.tsx

import { useTranslation } from "react-i18next";
import { FileEdit, Send, CheckCircle2, PackageOpen, PackageCheck, XCircle } from "lucide-react";
import { getStatusTone } from "../../../utils/salesOrderWorkflow";
import type { SalesOrderStatus } from "../../../types/salesOrders.types";

const ICONS: Record<string, typeof FileEdit> = {
  Draft: FileEdit,
  Submitted: Send,
  Approved: CheckCircle2,
  PartiallyShipped: PackageOpen,
  Shipped: PackageCheck,
  Cancelled: XCircle,
};

const TONE_CLASS: Record<string, string> = {
  neutral: "text-[--ink-secondary]",
  info: "text-[--synapse]",
  brand: "text-[--signal]",
  warning: "text-[--warning]",
  success: "text-[--success]",
  error: "text-[--error]",
};

const DOT_CLASS: Record<string, string> = {
  neutral: "bg-[--ink-tertiary]",
  info: "bg-[--synapse]",
  brand: "bg-[--signal]",
  warning: "bg-[--warning]",
  success: "bg-[--success]",
  error: "bg-[--error]",
};

interface SalesOrderStatusBadgeProps {
  status: SalesOrderStatus | string;
}

export function SalesOrderStatusBadge({ status }: SalesOrderStatusBadgeProps) {
  const { t } = useTranslation();
  const tone = getStatusTone(status);
  const Icon = ICONS[status] ?? FileEdit;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md bg-[--sunken] px-2 py-1 text-xs font-medium ${TONE_CLASS[tone]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${DOT_CLASS[tone]}`} />
      <Icon size={12} />
      {t(`salesOrders.status.${status}`, status)}
    </span>
  );
}
