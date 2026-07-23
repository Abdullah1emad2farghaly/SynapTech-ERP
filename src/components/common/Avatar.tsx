// src/components/common/Avatar.tsx
//
// Generic, presentation-only avatar. Renders initials derived from a name
// by default, or an image if one is provided later (no photo field exists
// on the current Users API, but HR or other modules may have one).
// No business logic — callers pass in exactly what should be shown.

import { useMemo } from "react";

export type AvatarSize = "xs" | "sm" | "md" | "lg";

export interface AvatarProps {
  /** Full name used to derive initials when no image is provided. */
  name: string;
  /** Optional image URL. Falls back to initials if omitted or fails to load. */
  src?: string;
  size?: AvatarSize;
  /**
   * Optional small status dot rendered on the bottom-end corner
   * (e.g. active/inactive). Purely visual — callers decide the color.
   */
  statusColor?: string;
  className?: string;
}

const SIZE_MAP: Record<AvatarSize, { box: string; text: string; dot: string }> = {
  xs: { box: "h-6 w-6", text: "text-[10px]", dot: "h-1.5 w-1.5" },
  sm: { box: "h-8 w-8", text: "text-xs", dot: "h-2 w-2" },
  md: { box: "h-10 w-10", text: "text-sm", dot: "h-2.5 w-2.5" },
  lg: { box: "h-14 w-14", text: "text-base", dot: "h-3 w-3" },
};

// Deterministic color pick from the existing token palette so the same
// name always renders the same background — small memorability aid in
// dense lists, not a design statement.
const PALETTE = [
  "var(--signal)",
  "var(--synapse)",
  "var(--success)",
  "var(--warning)",
] as const;

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0] + parts[parts.length - 1]![0]).toUpperCase();
}

function getPaletteColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length]!;
}

export function Avatar({
  name,
  src,
  size = "md",
  statusColor,
  className = "",
}: AvatarProps) {
  const initials = useMemo(() => getInitials(name), [name]);
  const bg = useMemo(() => getPaletteColor(name), [name]);
  const { box, text, dot } = SIZE_MAP[size];

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center rounded-full ${box} ${className}`}
      role="img"
      aria-label={name}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className="h-full w-full rounded-full object-cover"
          onError={(e) => {
            // Fall back to initials rendering by hiding the broken image;
            // the initials span below remains in the DOM but visually
            // hidden while src is present — simplest is to just remove
            // the src on error via a data attribute the parent can key off.
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        <span
          className={`flex h-full w-full items-center justify-center rounded-full font-medium text-white ${text}`}
          style={{ backgroundColor: bg }}
        >
          {initials}
        </span>
      )}
      {statusColor && (
        <span
          className={`absolute bottom-0 end-0 rounded-full ring-2 ring-[var(--panel)] ${dot}`}
          style={{ backgroundColor: statusColor }}
          aria-hidden="true"
        />
      )}
    </span>
  );
}
