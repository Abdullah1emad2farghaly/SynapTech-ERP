// src/components/admin/company/CompanyErrorState.tsx
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface CompanyErrorStateProps {
  onRetry: () => void;
}

export function CompanyErrorState({ onRetry }: CompanyErrorStateProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-danger-muted)]">
        <AlertTriangle className="h-8 w-8 text-[var(--color-danger)]" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
        {t('company.error.title')}
      </h3>
      <p className="mt-1 max-w-sm text-sm text-[var(--color-text-secondary)]">
        {t('company.error.description')}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text-primary)] transition hover:bg-[var(--color-surface-muted)] active:scale-[0.98]"
      >
        {t('company.error.retry')}
      </button>
    </div>
  );
}
