// Intended path: src/components/common/Toggle.tsx
//
// NEW shared component. No generic switch/toggle exists yet anywhere in the
// project (checked against Users/Departments/Branches/Accounts/Categories/
// Stock/Customers/Employees/Leave Requests, which use badges, drawers, and
// dialogs but never a boolean toggle) — Company Status is the first field
// that needs one, so it goes in common/ for reuse rather than being built
// inline in this module. Uses the same token/motion vocabulary as the rest
// of the design system (160ms control-feedback timing, --signal accent).

import { forwardRef, type ButtonHTMLAttributes } from 'react';

interface ToggleProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'type'> {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(
  ({ checked, onChange, disabled, label, className = '', ...rest }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-[160ms] ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--signal)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--panel)] disabled:cursor-not-allowed disabled:opacity-50 ${
          checked ? 'bg-[var(--signal)]' : 'bg-[var(--sunken)] border border-[var(--hairline)]'
        } ${className}`}
        {...rest}
      >
        <span
          aria-hidden="true"
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-[160ms] ease-out rtl:translate-x-0 ${
            checked ? 'translate-x-6 rtl:-translate-x-6' : 'translate-x-1 rtl:-translate-x-1'
          }`}
        />
      </button>
    );
  }
);

Toggle.displayName = 'Toggle';
