import { forwardRef, useId } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  success?: boolean;
  icon?: ReactNode;
  helperText?: string;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ label, error, success, icon, helperText, id, className = "", ...rest }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const helperId = `${inputId}-helper`;

    return (
      <div className="w-full">
        <label htmlFor={inputId} className="mb-1.5 block text-[0.8125rem] font-medium text-ink-secondary">
          {label}
        </label>
        <div className="relative">
          {icon ? (
            <span className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-ink-tertiary">
              {icon}
            </span>
          ) : null}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            aria-describedby={error || helperText ? helperId : undefined}
            className={[
              "w-full rounded-md border bg-sunken px-3.5 py-2.5 text-[0.9375rem] text-ink-primary",
              "placeholder:text-ink-tertiary transition-colors duration-control ease-control",
              "focus:outline-none focus:ring-2 focus:ring-synapse focus:ring-offset-2 focus:ring-offset-panel",
              icon ? "ps-10" : "",
              error ? "border-error" : "border-hairline",
              className,
            ].join(" ")}
            {...rest}
          />
          {error ? (
            <span className="absolute inset-y-0 end-3 flex items-center text-error">
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
            </span>
          ) : success ? (
            <span className="absolute inset-y-0 end-3 flex items-center text-success">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            </span>
          ) : null}
        </div>
        {error || helperText ? (
          <p
            id={helperId}
            role={error ? "alert" : undefined}
            className={`mt-1.5 text-[0.8125rem] ${error ? "text-error" : "text-ink-tertiary"}`}
          >
            {error ?? helperText}
          </p>
        ) : null}
      </div>
    );
  }
);
TextInput.displayName = "TextInput";
