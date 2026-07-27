// src/components/admin/company/CompanyEmptyState.tsx
import { Building2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface CompanyEmptyStateProps {
  onRetry: () => void;
}

export function CompanyEmptyState({ onRetry }: CompanyEmptyStateProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-surface-muted)]">
        <Building2 className="h-8 w-8 text-[var(--color-text-tertiary)]" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
        {t('company.empty.title')}
      </h3>
      <p className="mt-1 max-w-sm text-sm text-[var(--color-text-secondary)]">
        {t('company.empty.description')}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white transition hover:brightness-110 active:scale-[0.98]"
      >
        {t('company.empty.retry')}
      </button>
    </div>
  );
}
