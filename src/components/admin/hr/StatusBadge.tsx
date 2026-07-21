type StatusVariant = "success" | "warning" | "error" | "info" | "neutral";

interface StatusBadgeProps {
  label: string;
  variant: StatusVariant;
}

const VARIANT_CLASSES: Record<StatusVariant, string> = {
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  error: "bg-error/10 text-error",
  info: "bg-synapse/10 text-synapse",
  neutral: "bg-sunken text-ink-secondary",
};

// Never color-alone: a solid dot accompanies the text so status still
// reads for color-blind users and in monochrome print exports.
export function StatusBadge({ label, variant }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${VARIANT_CLASSES[variant]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {label}
    </span>
  );
}
