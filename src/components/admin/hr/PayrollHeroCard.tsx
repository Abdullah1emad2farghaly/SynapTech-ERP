// Intended path: src/components/admin/hr/PayrollHeroCard.tsx
// The HR equivalent of Inventory's value hero / Accounting's trial balance
// hero: the one number a finance/HR lead looks for first. Sums
// EmployeeResponse.baseSalary across employees whose status is assumed
// "Active" (see useHrOverviewStats.ts's flagged assumption on that enum
// value). Framed explicitly as "base salaries" rather than "payroll cost"
// since there's no field for bonuses, deductions, or employer overhead —
// this is a floor, not a full payroll figure.

import { useTranslation } from 'react-i18next';
import { Wallet } from 'lucide-react';
import { Skeleton } from '../../common/Skeleton';

interface Props {
  totalPayroll: number | undefined;
  activeEmployees: number | undefined;
  isLoading: boolean;
}

function formatCurrency(value: number) {
  // ASSUMPTION: EGP hardcoded, same precedent as the other Overview pages.
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 0,
  }).format(value);
}

export function PayrollHeroCard({ totalPayroll, activeEmployees, isLoading }: Props) {
  const { t } = useTranslation();

  return (
    <div className="relative overflow-hidden rounded-xl border border-hairline bg-gradient-to-br from-signal/10 via-panel to-panel p-6 shadow-elevation-1">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-ink-tertiary">{t('hr.overview.payroll.title')}</p>
          {isLoading ? (
            <Skeleton className="h-10 w-48 mt-2" />
          ) : (
            <p className="text-4xl font-display font-semibold text-ink-primary mt-1 tabular-nums">
              {formatCurrency(totalPayroll ?? 0)}
            </p>
          )}
          <p className="text-xs text-ink-tertiary mt-2">
            {isLoading
              ? t('hr.overview.payroll.caption')
              : t('hr.overview.payroll.captionWithCount', { count: activeEmployees ?? 0 })}
          </p>
        </div>
        <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-full bg-signal/15 text-signal shrink-0">
          <Wallet size={22} strokeWidth={2} />
        </div>
      </div>
    </div>
  );
}
