// Intended path: src/components/common/Skeleton.tsx
//
// Generic shimmering placeholder block, used for loading states across every
// module (Dashboard KPI cards, table rows, details page sections, etc.).
// Follows the project's existing motion convention: 1.4s ease-in-out shimmer,
// respects prefers-reduced-motion by falling back to a static block.

import { useReducedMotion } from "framer-motion";

interface SkeletonProps {
  className?: string;
  /** Inline style overrides — e.g. explicit width/height when Tailwind classes aren't convenient. */
  style?: React.CSSProperties;
}

export function Skeleton({ className = "", style }: SkeletonProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      className={`rounded-md overflow-hidden relative ${className}`}
      style={{ backgroundColor: "var(--sunken)", ...style }}
      role="status"
      aria-label="loading"
    >
      {!prefersReducedMotion && (
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, transparent, color-mix(in srgb, var(--ink-tertiary) 12%, transparent), transparent)",
            animation: "skeleton-shimmer 1.4s ease-in-out infinite",
          }}
        />
      )}
      <style>{`
        @keyframes skeleton-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}

/**
 * Convenience wrapper for a row of skeleton lines (e.g. a text block), so
 * callers don't have to hand-space multiple <Skeleton /> instances.
 */
export function SkeletonText({
  lines = 1,
  className = "",
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-4"
          style={{ width: i === lines - 1 && lines > 1 ? "70%" : "100%" }}
        />
      ))}
    </div>
  );
}
