// src/components/admin/users/RoleBadge.tsx
//
// Role-specific badge for the Users module. Follows the system-wide rule
// that status/role indicators are never color-only: always a small solid
// dot + a text label, so meaning survives for color-blind users and in
// monochrome print/export contexts.
//
// Roles are an open-ended, backend-driven list (not a fixed enum like
// Active/Inactive), so color is derived deterministically from the role
// name rather than hardcoded per role — the same role always renders the
// same color, without a lookup table that has to be maintained as roles
// are added or renamed on the backend.
//
// Presentation-only, no business logic, fully translated via useTranslation
// at the call site (this component just renders whatever label it's given).

import { useMemo } from "react";

export type RoleBadgeSize = "sm" | "md";

export interface RoleBadgeProps {
  /** Role display name, already translated by the caller if needed. */
  label: string;
  size?: RoleBadgeSize;
  className?: string;
}

// Distinct from the Avatar palette so a role chip and an avatar sitting
// next to each other never accidentally read as the same kind of signal.
const ROLE_PALETTE = [
  { bg: "var(--signal)", bgSoft: "color-mix(in srgb, var(--signal) 14%, transparent)" },
  { bg: "var(--synapse)", bgSoft: "color-mix(in srgb, var(--synapse) 16%, transparent)" },
  { bg: "var(--success)", bgSoft: "color-mix(in srgb, var(--success) 14%, transparent)" },
  { bg: "var(--warning)", bgSoft: "color-mix(in srgb, var(--warning) 14%, transparent)" },
] as const;

function getRoleColor(label: string) {
  let hash = 0;
  for (let i = 0; i < label.length; i++) {
    hash = (hash * 31 + label.charCodeAt(i)) >>> 0;
  }
  return ROLE_PALETTE[hash % ROLE_PALETTE.length]!;
}

const SIZE_MAP: Record<RoleBadgeSize, string> = {
  sm: "h-5 gap-1 px-1.5 text-[11px]",
  md: "h-6 gap-1.5 px-2 text-xs",
};

export function RoleBadge({ label, size = "sm", className = "" }: RoleBadgeProps) {
  const color = useMemo(() => getRoleColor(label), [label]);
  const sizeClasses = SIZE_MAP[size];

  return (
    <span
      className={`inline-flex items-center rounded-[6px] font-medium text-[var(--ink-primary)] ${sizeClasses} ${className}`}
      style={{ backgroundColor: color.bgSoft }}
    >
      <span
        className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: color.bg }}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}

/**
 * Overflow chip used in the Users list table when a row has more roles
 * than fit inline (e.g. "+2"). Deliberately not a RoleBadge instance —
 * it doesn't represent one role, so it shouldn't carry a role's dot+color
 * treatment. Kept in this file since it only ever appears alongside
 * RoleBadge and has no other reuse case.
 */
export function RoleOverflowChip({
  count,
  className = "",
}: {
  count: number;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex h-5 items-center rounded-[6px] bg-[var(--sunken)] px-1.5 text-[11px] font-medium text-[var(--ink-secondary)] ${className}`}
    >
      +{count}
    </span>
  );
}
