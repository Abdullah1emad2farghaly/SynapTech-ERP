interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_MAP: Record<NonNullable<LogoProps["size"]>, number> = {
  sm: 28,
  md: 36,
  lg: 48,
};

// Single SVG using currentColor so it adapts to theme without asset swaps.
export function Logo({ size = "md", className = "" }: LogoProps) {
  const px = SIZE_MAP[size];
  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 40 40"
      fill="none"
      className={`text-signal ${className}`}
      role="img"
      aria-label="Synaptech"
    >
      <circle cx="10" cy="10" r="4" fill="currentColor" />
      <circle cx="30" cy="10" r="4" fill="currentColor" />
      <circle cx="20" cy="30" r="4" fill="currentColor" />
      <path
        d="M10 10 L30 10 M10 10 L20 30 M30 10 L20 30"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeOpacity="0.5"
      />
    </svg>
  );
}
