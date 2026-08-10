// Project path: src/components/admin/employees/EmployeeAccessBadge.tsx
//
// Purely derived from `userId` presence — there is no separate access-status
// field. Kept as its own component (not folded into StatusBadge) since
// System Access and Employment Status are independent axes, same reasoning
// documented for MainBranchBadge vs StatusBadge on Branches.

import { CheckCircle2, Circle } from "lucide-react";
import { useTranslation } from "react-i18next";

interface EmployeeAccessBadgeProps {
  hasAccess: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function EmployeeAccessBadge({
  hasAccess,
  size = "md",
  className = "",
}: EmployeeAccessBadgeProps) {
  const { t } = useTranslation();
  const padding = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs";
  const iconSize = size === "sm" ? 12 : 14;

  if (hasAccess) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full font-medium ${padding} bg-[var(--success)]/10 text-[var(--success)] ${className}`}
      >
        <CheckCircle2 size={iconSize} aria-hidden="true" />
        {t("employees.access.enabled", "Access enabled")}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${padding} bg-[var(--sunken)] text-[var(--ink-tertiary)] ${className}`}
    >
      <Circle size={iconSize} aria-hidden="true" />
      {t("employees.access.none", "No access")}
    </span>
  );
}
