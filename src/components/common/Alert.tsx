import type { ReactNode } from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

interface AlertProps {
  variant: "info" | "success" | "warning" | "error";
  children: ReactNode;
  onDismiss?: () => void;
}

const VARIANT_STYLES: Record<AlertProps["variant"], { icon: typeof Info; classes: string }> = {
  info: { icon: Info, classes: "bg-signal/10 text-signal" },
  success: { icon: CheckCircle2, classes: "bg-success/10 text-success" },
  warning: { icon: AlertCircle, classes: "bg-warning/10 text-warning" },
  error: { icon: AlertCircle, classes: "bg-error/10 text-error" },
};

export function Alert({ variant, children, onDismiss }: AlertProps) {
  const { icon: Icon, classes } = VARIANT_STYLES[variant];
  const isSevere = variant === "error" || variant === "warning";

  return (
    <div
      role={isSevere ? "alert" : "status"}
      className={`flex items-start gap-2 rounded-md px-3.5 py-3 text-[0.8125rem] ${classes}`}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span className="flex-1">{children}</span>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="shrink-0 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-synapse"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </div>
  );
}
