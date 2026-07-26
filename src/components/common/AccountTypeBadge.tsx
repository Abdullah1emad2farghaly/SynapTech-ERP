// src/components/common/AccountTypeBadge.tsx
//
// Badge for an account's accountType. Same deterministic-color-from-
// string pattern as RoleBadge, deliberately NOT a fixed color-per-known-
// category (Assets=blue, Liabilities=red, etc.) — accountType is a
// free-form string on the confirmed API, not a documented enum, so a
// hardcoded category→color map would silently break (or just render a
// default/no color) the moment a real Chart of Accounts uses a type
// string this map didn't anticipate. Dot + label always paired, never
// color-only, per the system-wide badge rule.

import { useMemo } from "react";

export type AccountTypeBadgeSize = "sm" | "md";

export interface AccountTypeBadgeProps {
  /** The account's raw accountType string — displayed as-is, not translated,
   * since it's user/backend-defined data, not a fixed set of UI strings. */
  accountType: string;
  size?: AccountTypeBadgeSize;
  className?: string;
}

// Same palette-by-hash approach as RoleBadge, kept as a separate constant
// so the two badges' color assignments are independent of each other
// (an account type and a role happening to hash to the same palette
// index shouldn't visually imply any relationship between them).
const TYPE_PALETTE = [
  { bg: "var(--signal)", bgSoft: "color-mix(in srgb, var(--signal) 14%, transparent)" },
  { bg: "var(--synapse)", bgSoft: "color-mix(in srgb, var(--synapse) 16%, transparent)" },
  { bg: "var(--success)", bgSoft: "color-mix(in srgb, var(--success) 14%, transparent)" },
  { bg: "var(--warning)", bgSoft: "color-mix(in srgb, var(--warning) 14%, transparent)" },
  { bg: "var(--error)", bgSoft: "color-mix(in srgb, var(--error) 12%, transparent)" },
] as const;

function getTypeColor(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return TYPE_PALETTE[hash % TYPE_PALETTE.length]!;
}

const SIZE_MAP: Record<AccountTypeBadgeSize, string> = {
  sm: "h-5 gap-1 px-1.5 text-[11px]",
  md: "h-6 gap-1.5 px-2 text-xs",
};

export function AccountTypeBadge({
  accountType,
  size = "sm",
  className = "",
}: AccountTypeBadgeProps) {
  const color = useMemo(() => getTypeColor(accountType), [accountType]);
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
      {accountType}
    </span>
  );
}
