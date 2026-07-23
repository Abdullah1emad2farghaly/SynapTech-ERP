// src/components/common/StatusBadge.tsx
//
// Generic status badge shared across modules. Extended here to add
// "locked" and "pending" on top of the existing "active"/"inactive"
// states, since other modules (not just Users) may eventually need them.
// Never color-only: always a solid dot + text label, per the system rule.
//
// NOTE: this replaces the previous Active/Inactive-only version. If any
// existing usage passed status="active" | "inactive" directly, that still
// works unchanged — this is a strict superset.

export type StatusBadgeStatus = "active" | "inactive" | "locked" | "pending";
export type StatusBadgeSize = "sm" | "md";

export interface StatusBadgeProps {
  status: StatusBadgeStatus;
  /** Already-translated label from the caller (e.g. t("users.status.active")). */
  label: string;
  size?: StatusBadgeSize;
  className?: string;
}

const STATUS_COLOR: Record<StatusBadgeStatus, string> = {
  active: "var(--success)",
  inactive: "var(--ink-tertiary)",
  locked: "var(--error)",
  pending: "var(--warning)",
};

const SIZE_MAP: Record<StatusBadgeSize, string> = {
  sm: "h-5 gap-1 px-1.5 text-[11px]",
  md: "h-6 gap-1.5 px-2 text-xs",
};

export function StatusBadge({
  status,
  label,
  size = "sm",
  className = "",
}: StatusBadgeProps) {
  const color = STATUS_COLOR[status];
  const sizeClasses = SIZE_MAP[size];

  return (
    <span
      className={`inline-flex items-center rounded-[6px] bg-[var(--sunken)] font-medium text-[var(--ink-primary)] ${sizeClasses} ${className}`}
    >
      <span
        className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}
