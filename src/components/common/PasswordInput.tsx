import { forwardRef, useId, useState } from "react";
import type { InputHTMLAttributes } from "react";
import { Eye, EyeOff, Lock, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, id, className = "", ...rest }, ref) => {
    const { t } = useTranslation();
    const [visible, setVisible] = useState(false);
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const helperId = `${inputId}-helper`;

    return (
      <div className="w-full">
        <label htmlFor={inputId} className="mb-1.5 block text-[0.8125rem] font-medium text-ink-secondary">
          {label}
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-ink-tertiary">
            <Lock className="h-4 w-4" aria-hidden="true" />
          </span>
          <input
            ref={ref}
            id={inputId}
            type={visible ? "text" : "password"}
            aria-invalid={!!error}
            aria-describedby={error ? helperId : undefined}
            className={[
              "w-full rounded-md border bg-sunken ps-10 pe-10 py-2.5 text-[0.9375rem] text-ink-primary",
              "placeholder:text-ink-tertiary transition-colors duration-control ease-control",
              "focus:outline-none focus:ring-2 focus:ring-synapse focus:ring-offset-2 focus:ring-offset-panel",
              error ? "border-error" : "border-hairline",
              className,
            ].join(" ")}
            {...rest}
          />
          <button
            type="button"
            aria-pressed={visible}
            aria-label={visible ? t("common.hidePassword") : t("common.showPassword")}
            onClick={() => setVisible((v) => !v)}
            className="absolute inset-y-0 end-3 flex items-center text-ink-tertiary hover:text-ink-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-synapse rounded"
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {error ? (
          <p id={helperId} role="alert" className="mt-1.5 flex items-center gap-1 text-[0.8125rem] text-error">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {error}
          </p>
        ) : null}
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";
