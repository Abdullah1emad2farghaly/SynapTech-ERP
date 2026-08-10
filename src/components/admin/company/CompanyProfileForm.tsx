// Intended path: src/components/admin/company/CompanyProfileForm.tsx
//
// ASSUMPTION: no reusable country/currency selector was confirmed to exist
// anywhere in the project's history, so Country and Currency are plain text
// inputs (matching the API's plain-string contract) rather than a select. If
// the real project already has one, swap it in here — don't invent a new
// country/currency data source or API to back a dropdown.
//
// A small local FormField wrapper is defined here rather than assumed from a
// shared components/common location, since no generic form-field component
// was established by prior modules (Users/Departments/etc. built inputs
// per-drawer). If the real project has one, this can be replaced.

import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { UseFormRegister, FieldErrors } from 'react-hook-form';
import type { CompanyFormValues } from '../../../schemas/company.schema';

interface CompanyProfileFormProps {
  register: UseFormRegister<CompanyFormValues>;
  errors: FieldErrors<CompanyFormValues>;
  disabled?: boolean;
}

function FormField({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-[var(--ink-primary)]">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-[var(--error)]">
          {error}
        </p>
      )}
    </div>
  );
}

const inputClasses =
  'w-full rounded-[10px] border border-[var(--hairline)] bg-[var(--sunken)] px-3.5 py-2.5 text-sm text-[var(--ink-primary)] placeholder:text-[var(--ink-tertiary)] transition-colors duration-[160ms] focus:border-[var(--signal)] focus:outline-none focus:ring-2 focus:ring-[var(--signal)]/20 disabled:cursor-not-allowed disabled:opacity-60';

export function CompanyProfileForm({ register, errors, disabled }: CompanyProfileFormProps) {
  const { t } = useTranslation();

  return (
    <section className="rounded-[16px] border border-[var(--hairline)] bg-[var(--panel)] p-6 shadow-sm">
      <h2 className="text-base font-semibold text-[var(--ink-primary)]">{t('company.profile.title')}</h2>
      <p className="mt-1 text-sm text-[var(--ink-secondary)]">{t('company.profile.description')}</p>

      <div className="mt-6 space-y-5">
        <FormField
          id="company-name"
          label={t('company.profile.name')}
          error={errors.name?.message ? t(errors.name.message) : undefined}
        >
          <input
            id="company-name"
            className={inputClasses}
            disabled={disabled}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'company-name-error' : undefined}
            {...register('name')}
          />
        </FormField>

        <FormField
          id="company-legal-name"
          label={t('company.profile.legalName')}
          error={errors.legalName?.message ? t(errors.legalName.message) : undefined}
        >
          <input
            id="company-legal-name"
            className={inputClasses}
            disabled={disabled}
            aria-invalid={!!errors.legalName}
            aria-describedby={errors.legalName ? 'company-legal-name-error' : undefined}
            {...register('legalName')}
          />
        </FormField>

        <FormField
          id="company-tax-number"
          label={t('company.profile.taxNumber')}
          error={errors.taxNumber?.message ? t(errors.taxNumber.message) : undefined}
        >
          <input
            id="company-tax-number"
            className={inputClasses}
            disabled={disabled}
            aria-invalid={!!errors.taxNumber}
            aria-describedby={errors.taxNumber ? 'company-tax-number-error' : undefined}
            {...register('taxNumber')}
          />
        </FormField>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField
            id="company-country"
            label={t('company.profile.country')}
            error={errors.country?.message ? t(errors.country.message) : undefined}
          >
            <input
              id="company-country"
              className={inputClasses}
              disabled={disabled}
              aria-invalid={!!errors.country}
              aria-describedby={errors.country ? 'company-country-error' : undefined}
              {...register('country')}
            />
          </FormField>

          <FormField
            id="company-currency"
            label={t('company.profile.currency')}
            error={errors.currency?.message ? t(errors.currency.message) : undefined}
          >
            <input
              id="company-currency"
              className={inputClasses}
              disabled={disabled}
              aria-invalid={!!errors.currency}
              aria-describedby={errors.currency ? 'company-currency-error' : undefined}
              {...register('currency')}
            />
          </FormField>
        </div>
      </div>
    </section>
  );
}
