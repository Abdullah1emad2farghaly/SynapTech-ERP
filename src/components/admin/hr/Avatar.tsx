const PALETTE = ["#4338CA", "#0F9D68", "#D97706", "#DC2626", "#22D3EE", "#818CF8"];

function colorForName(name: string) {
  const index = name.split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % PALETTE.length;
  return PALETTE[index];
}

function initialsFor(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

interface AvatarProps {
  name: string;
  src?: string;
  size?: "sm" | "md" | "lg";
}

const SIZE_CLASSES: Record<NonNullable<AvatarProps["size"]>, string> = {
  sm: "h-7 w-7 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
};

export function Avatar({ name, src, size = "md" }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`rounded-full object-cover ${SIZE_CLASSES[size]}`}
      />
    );
  }
  return (
    <span
      role="img"
      aria-label={name}
      className={`flex items-center justify-center rounded-full font-semibold text-white ${SIZE_CLASSES[size]}`}
      style={{ backgroundColor: colorForName(name) }}
    >
      {initialsFor(name)}
    </span>
  );
}
