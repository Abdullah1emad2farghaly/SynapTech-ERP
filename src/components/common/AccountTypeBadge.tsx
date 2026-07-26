// src/components/common/AccountTypeBadge.tsx
//
// Badge for an account's accountType. Now that the actual type set is
// confirmed (see constants/accountTypes.ts — Assests, Expensis,
// Invistments), each known type gets a deliberate, meaningful color
// (Assets=success green, Expenses=warning amber, Investments=signal
// indigo) rather than a purely hash-derived one. An unrecognized value
// (something outside the known set — e.g. if the backend adds a type
// this project hasn't been told about yet) still falls back to the
// deterministic hash-based color so the badge never breaks, it just
// won't carry the same intentional meaning until the mapping is updated.
// Dot + label always paired, never color-only, per the system-wide
// badge rule.

import { useMemo } from "react";

export type AccountTypeBadgeSize = "sm" | "md";

export interface AccountTypeBadgeProps {
  /** The account's raw accountType string — displayed as-is, not translated,
   * since it's user/backend-defined data, not a fixed set of UI strings. */
  accountType: string;
  size?: AccountTypeBadgeSize;
  className?: string;
}

interface TypeColor {
  bg: string;
  bgSoft: string;
}

// Deliberate mapping for the confirmed known types — spelled exactly as
// the backend/data uses them (not "corrected" to Assets/Expenses/
// Investments), since this has to match real values to ever match.
const KNOWN_TYPE_COLORS: Record<string, TypeColor> = {
  Assests: { bg: "var(--success)", bgSoft: "color-mix(in srgb, var(--success) 14%, transparent)" },
  Expensis: { bg: "var(--warning)", bgSoft: "color-mix(in srgb, var(--warning) 14%, transparent)" },
  Invistments: { bg: "var(--signal)", bgSoft: "color-mix(in srgb, var(--signal) 14%, transparent)" },
};

// Fallback palette for anything outside the known set, so a future,
// not-yet-mapped type still renders consistently rather than breaking.
const FALLBACK_PALETTE: TypeColor[] = [
  { bg: "var(--synapse)", bgSoft: "color-mix(in srgb, var(--synapse) 16%, transparent)" },
  { bg: "var(--error)", bgSoft: "color-mix(in srgb, var(--error) 12%, transparent)" },
];

function getTypeColor(value: string): TypeColor {
  if (KNOWN_TYPE_COLORS[value]) return KNOWN_TYPE_COLORS[value];
  let hash = 0;
  for (let i = 0; i < value?.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return FALLBACK_PALETTE[hash % FALLBACK_PALETTE.length]!;
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
