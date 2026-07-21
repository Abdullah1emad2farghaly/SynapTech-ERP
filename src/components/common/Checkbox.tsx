import { forwardRef, useId } from "react";
import type { InputHTMLAttributes } from "react";
import { Check } from "lucide-react";

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, id, className = "", ...rest }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    return (
      <label htmlFor={inputId} className="inline-flex select-none items-center gap-2 text-[0.8125rem] text-ink-secondary">
        <span className="relative inline-flex h-4 w-4 items-center justify-center">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            className={[
              "peer h-4 w-4 shrink-0 appearance-none rounded-sm border border-hairline bg-sunken",
              "checked:border-signal checked:bg-signal transition-colors duration-control ease-control",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-synapse focus-visible:ring-offset-2",
              className,
            ].join(" ")}
            {...rest}
          />
          <Check
            className="pointer-events-none absolute h-3 w-3 scale-0 text-white transition-transform duration-control peer-checked:scale-100"
            aria-hidden="true"
          />
        </span>
        {label}
      </label>
    );
  }
);
Checkbox.displayName = "Checkbox";
