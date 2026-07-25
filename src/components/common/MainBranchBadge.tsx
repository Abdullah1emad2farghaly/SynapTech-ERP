// src/components/common/MainBranchBadge.tsx
//
// Small, generic badge for "this is the primary one" — currently used
// for a Branch's isMain flag, kept in common/ (not admin/branches/)
// since the concept isn't inherently Branch-specific and could apply
// elsewhere later (e.g. a primary contact, a default warehouse).
// Deliberately separate from StatusBadge, which is about active/inactive
// — a different axis entirely; a branch can be Main AND Inactive at the
// same time, so collapsing these into one badge type would conflate two
// independent facts.
//
// Icon + text label always paired, never icon-only, per the system's
// "never color/icon-only" rule already applied to StatusBadge/RoleBadge.

import { Building2 } from "lucide-react";

export type MainBranchBadgeSize = "sm" | "md";

export interface MainBranchBadgeProps {
  /** Already-translated label, e.g. t("branches.badge.main"). */
  label: string;
  size?: MainBranchBadgeSize;
  className?: string;
}

const SIZE_MAP: Record<MainBranchBadgeSize, string> = {
  sm: "h-5 gap-1 px-1.5 text-[11px]",
  md: "h-6 gap-1.5 px-2 text-xs",
};

export function MainBranchBadge({ label, size = "sm", className = "" }: MainBranchBadgeProps) {
  const sizeClasses = SIZE_MAP[size];
  const iconSize = size === "sm" ? 11 : 13;

  return (
    <span
      className={`inline-flex items-center rounded-[6px] font-medium text-[var(--signal)] ${sizeClasses} ${className}`}
      style={{ backgroundColor: "color-mix(in srgb, var(--signal) 14%, transparent)" }}
    >
      <Building2 size={iconSize} aria-hidden="true" />
      {label}
    </span>
  );
}
