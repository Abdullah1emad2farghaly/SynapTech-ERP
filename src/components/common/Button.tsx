import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  fullWidth?: boolean;
  isLoading?: boolean;
}

const VARIANT_CLASSES: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-signal text-white hover:bg-signal-hover active:bg-signal-hover focus-visible:ring-synapse",
  secondary:
    "bg-transparent text-ink-primary border border-hairline hover:bg-sunken focus-visible:ring-synapse",
  ghost: "bg-transparent text-signal hover:bg-sunken focus-visible:ring-synapse",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", fullWidth, isLoading, disabled, children, className = "", ...rest }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={[
          "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5",
          "text-sm font-medium transition-colors duration-control ease-control",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          fullWidth ? "w-full" : "",
          VARIANT_CLASSES[variant],
          className,
        ].join(" ")}
        {...rest}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : null}
        {isLoading ? null : children}
      </button>
    );
  }
);
Button.displayName = "Button";
