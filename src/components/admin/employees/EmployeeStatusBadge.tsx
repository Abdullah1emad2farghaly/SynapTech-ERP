// Project path: src/components/admin/employees/EmployeeStatusBadge.tsx
//
// The API types `status` as `string | null` with no documented enum (unlike
// Users' explicit active/inactive/locked/pending). This badge renders
// whatever string the backend actually returns rather than assuming a fixed
// set — known common values (Active/Inactive/Pending/OnLeave/Terminated) get
// a mapped color; anything else falls back to a neutral, still-labeled
// badge, so an unrecognized backend value never breaks the UI. Never
// color-only, per the system-wide badge rule.

import { useTranslation } from "react-i18next";

interface EmployeeStatusBadgeProps {
  status: string | null;
  size?: "sm" | "md";
  className?: string;
}

const KNOWN_TONE: Record<string, "success" | "muted" | "warning" | "error"> = {
  active: "success",
  inactive: "muted",
  pending: "warning",
  onleave: "warning",
  "on leave": "warning",
  terminated: "error",
  suspended: "error",
};

const TONE_CLASSES: Record<"success" | "muted" | "warning" | "error", string> = {
  success: "bg-[var(--success)]/10 text-[var(--success)]",
  muted: "bg-[var(--ink-tertiary)]/10 text-[var(--ink-secondary)]",
  warning: "bg-[var(--warning)]/10 text-[var(--warning)]",
  error: "bg-[var(--error)]/10 text-[var(--error)]",
};

const DOT_CLASSES: Record<"success" | "muted" | "warning" | "error", string> = {
  success: "bg-[var(--success)]",
  muted: "bg-[var(--ink-tertiary)]",
  warning: "bg-[var(--warning)]",
  error: "bg-[var(--error)]",
};

export function EmployeeStatusBadge({
  status,
  size = "md",
  className = "",
}: EmployeeStatusBadgeProps) {
  const { t } = useTranslation();

  if (!status) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium bg-[var(--sunken)] text-[var(--ink-tertiary)] ${className}`}
      >
        {t("employees.status.unspecified", "Not set")}
      </span>
    );
  }

  const tone = KNOWN_TONE[status.trim().toLowerCase()] ?? "muted";
  const padding = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${padding} ${TONE_CLASSES[tone]} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${DOT_CLASSES[tone]}`} aria-hidden="true" />
      {status}
    </span>
  );
}
