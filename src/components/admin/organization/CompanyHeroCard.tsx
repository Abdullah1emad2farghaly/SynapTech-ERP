// Intended path: src/components/admin/organization/CompanyHeroCard.tsx
// Structurally different from every other hero card in this series
// (Inventory's value, Accounting's trial balance, HR's payroll) — those
// all summarize a collection; this one displays a single record as-is,
// since Companies has exactly one row (GET /api/Companies/me). No
// aggregation, no computation — a direct identity card.
//
// FLAG: the "Edit" action has nowhere confirmed to go. No Company Settings
// editing page has been built in this project — only GET has been
// consumed so far. Rendered as a disabled-looking affordance with the flag
// documented here rather than wired to a route that doesn't exist.

import { useTranslation } from 'react-i18next';
import { Building2 } from 'lucide-react';
import { Skeleton } from '../../common/Skeleton';
import type { CompanyResponse } from '../../../services/api/companies.api';
import { useNavigate } from 'react-router-dom';

interface Props {
  company: CompanyResponse | undefined;
  isLoading: boolean;
  isError: boolean;
}

export function CompanyHeroCard({ company, isLoading, isError }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate()

  return (
    <div className="relative overflow-hidden rounded-xl border border-hairline bg-gradient-to-br from-signal/10 via-panel to-panel p-6 shadow-elevation-1">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4 min-w-0">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-signal/15 text-signal shrink-0">
            <Building2 size={22} strokeWidth={2} />
          </div>
          <div className="min-w-0">
            {isLoading ? (
              <>
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-4 w-64 mt-2" />
              </>
            ) : isError || !company ? (
              <p className="text-sm text-error">{t('organization.overview.company.errorDescription')}</p>
            ) : (
              <>
                <p className="text-xl font-display font-semibold text-ink-primary truncate">{company.name}</p>
                <p className="text-sm text-ink-tertiary mt-0.5 truncate">
                  {company.legalName ?? t('organization.overview.company.noLegalName')}
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-ink-tertiary">
                  {company.country && (
                    <span>
                      {t('organization.overview.company.country')}: {company.country}
                    </span>
                  )}
                  {company.currency && (
                    <span>
                      {t('organization.overview.company.currency')}: {company.currency}
                    </span>
                  )}
                  {company.taxNumber && (
                    <span>
                      {t('organization.overview.company.taxNumber')}: {company.taxNumber}
                    </span>
                  )}
                  <span
                    className={company.isActive ? 'text-success font-medium' : 'text-ink-tertiary font-medium'}
                  >
                    {company.isActive
                      ? t('organization.overview.company.active')
                      : t('organization.overview.company.inactive')}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
        {/* FLAG: no Company Settings editing page exists yet — see file header. */}
        <span
          title={t('organization.overview.company.editNotAvailable')}
          onClick={()=> navigate("/settings")}
          className="text-xs font-medium px-3 py-1.5 rounded-md border border-hairline text-ink-tertiary shrink-0 cursor-pointer"
        >
          {t('organization.overview.company.edit')}
        </span>
      </div>
    </div>
  );
}
