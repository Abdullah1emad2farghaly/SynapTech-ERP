// src/components/admin/company/StatusCard.tsx
import { BadgeCheck, CircleOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface StatusCardProps {
  isActive: boolean;
}

export function StatusCard({ isActive }: StatusCardProps) {
  const { t } = useTranslation();

  return (
    <div
      className={`rounded-2xl border p-6 ${
        isActive
          ? 'border-[var(--color-success-border)] bg-[var(--color-success-muted)]'
          : 'border-[var(--color-border)] bg-[var(--color-surface-muted)]'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            isActive
              ? 'bg-[var(--color-success)] text-white'
              : 'bg-[var(--color-text-tertiary)] text-white'
          }`}
        >
          {isActive ? (
            <BadgeCheck className="h-5 w-5" aria-hidden="true" />
          ) : (
            <CircleOff className="h-5 w-5" aria-hidden="true" />
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">
            {isActive ? t('company.status.active') : t('company.status.inactive')}
          </p>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {isActive
              ? t('company.status.activeDescription')
              : t('company.status.inactiveDescription')}
          </p>
        </div>
      </div>
    </div>
  );
}
