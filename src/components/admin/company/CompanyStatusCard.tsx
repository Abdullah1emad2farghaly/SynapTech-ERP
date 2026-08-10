// Intended path: src/components/admin/company/CompanyStatusCard.tsx
//
// Only true/false — no additional lifecycle statuses invented. Status is
// shown as a small dot + label rather than a large badge, per the brief's
// "immediately understandable without dominating the page" direction.

import { useTranslation } from 'react-i18next';
import { Toggle } from '../../common/Toggle';

interface CompanyStatusCardProps {
  isActive: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function CompanyStatusCard({ isActive, onChange, disabled }: CompanyStatusCardProps) {
  const { t } = useTranslation();

  return (
    <section className="rounded-[16px] border border-[var(--hairline)] bg-[var(--panel)] p-6 shadow-sm">
      <h2 className="text-base font-semibold text-[var(--ink-primary)]">{t('company.status.title')}</h2>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className={`h-2 w-2 rounded-full ${
                isActive ? 'bg-[var(--success)]' : 'bg-[var(--ink-tertiary)]'
              }`}
            />
            <span className="text-sm font-medium text-[var(--ink-primary)]">
              {isActive ? t('company.status.active') : t('company.status.inactive')}
            </span>
          </div>
          <p className="mt-1 text-sm text-[var(--ink-secondary)]">{t('company.status.helperText')}</p>
        </div>

        <Toggle
          id="company-active-toggle"
          checked={isActive}
          onChange={onChange}
          disabled={disabled}
          label={t('company.status.title')}
        />
      </div>
    </section>
  );
}
