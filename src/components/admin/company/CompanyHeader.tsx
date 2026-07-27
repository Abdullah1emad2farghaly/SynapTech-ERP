// src/components/admin/company/CompanyHeader.tsx
import { motion } from 'framer-motion';
import { Building2, Globe, Pencil, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { StatusBadge } from '../../common/StatusBadge'; // ASSUMPTION: existing shared component, prop shape unverified
import { getFlagEmoji } from '../../../utils/countryFlag';
import type { Company } from '../../../types/company.types';

interface CompanyHeaderProps {
  company: Company;
  onEdit: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export function CompanyHeader({
  company,
  onEdit,
  onRefresh,
  isRefreshing,
}: CompanyHeaderProps) {
  const { t } = useTranslation();
  const flag = getFlagEmoji(company.country);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-[var(--color-text-tertiary)]">
        <span>{t('company.breadcrumb.organization')}</span>
        <span className="mx-2">/</span>
        <span className="text-[var(--color-text-primary)]">
          {t('company.breadcrumb.company')}
        </span>
      </nav>

      <div className="flex flex-col gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-accent-muted)] text-lg font-semibold text-[var(--color-accent)]"
            aria-hidden="true"
          >
            {company.name?.charAt(0)?.toUpperCase() ?? (
              <Building2 className="h-6 w-6" />
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">
                {company.name}
              </h1>
              <StatusBadge
                status={company.isActive ? "active" : "inactive"}
                label={company.isActive ? t("users.status.active") : t("users.status.inactive")}
              />
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-[var(--color-text-secondary)]">
              <span className="inline-flex items-center gap-1">
                {flag ? (
                  <span aria-hidden="true">{flag}</span>
                ) : (
                  <Globe className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                {company.country}
              </span>
              <span aria-hidden="true">•</span>
              <span className="rounded-md bg-[var(--color-surface-muted)] px-2 py-0.5 text-xs font-medium">
                {company.currency}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            aria-label={t('company.actions.refresh')}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] transition hover:bg-[var(--color-surface-muted)] active:scale-95 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white transition hover:brightness-110 active:scale-[0.98]"
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
            {t('company.actions.edit')}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
