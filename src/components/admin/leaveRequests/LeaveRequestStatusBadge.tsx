// Intended path: src/components/admin/leaveRequests/LeaveRequestStatusBadge.tsx

import { CheckCircle2, Clock, HelpCircle, Slash, XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

interface LeaveRequestStatusBadgeProps {
  status: string | null | undefined;
  size?: "sm" | "md";
  className?: string;
}

// Status colors reuse existing design tokens only — no new palette introduced,
// same as Purchase/Sales Orders' status→color mapping.
const STATUS_CONFIG: Record<
  string,
  { icon: typeof Clock; colorVar: string; labelKey: string }
> = {
  Pending: { icon: Clock, colorVar: "var(--warning)", labelKey: "leaveRequests.status.pending" },
  Approved: {
    icon: CheckCircle2,
    colorVar: "var(--success)",
    labelKey: "leaveRequests.status.approved",
  },
  Rejected: { icon: XCircle, colorVar: "var(--error)", labelKey: "leaveRequests.status.rejected" },
  Cancelled: {
    icon: Slash,
    colorVar: "var(--ink-tertiary)",
    labelKey: "leaveRequests.status.cancelled",
  },
};

export function LeaveRequestStatusBadge({
  status,
  size = "md",
  className = "",
}: LeaveRequestStatusBadgeProps) {
  const { t } = useTranslation();
  const config = status ? STATUS_CONFIG[status] : undefined;

  // Unknown/null status: distinct "?" icon so it's visually distinguishable
  // from Cancelled despite sharing the same neutral color token.
  const Icon = config?.icon ?? HelpCircle;
  const colorVar = config?.colorVar ?? "var(--ink-tertiary)";
  const label = config ? t(config.labelKey) : t("leaveRequests.status.unknown");

  const sizeClasses = size === "sm" ? "text-xs px-2 py-0.5 gap-1" : "text-sm px-2.5 py-1 gap-1.5";
  const iconSize = size === "sm" ? 12 : 14;

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizeClasses} ${className}`}
      style={{ color: colorVar, backgroundColor: `color-mix(in srgb, ${colorVar} 12%, transparent)` }}
    >
      <Icon size={iconSize} aria-hidden="true" />
      {label}
    </span>
  );
}
