// Intended path: src/components/admin/accounting/TrialBalanceSummaryCard.tsx
// The Accounting equivalent of Inventory's value hero card — but even more
// directly grounded, since isBalanced/totalDebitBalances/
// totalCreditBalances come straight off TrialBalanceResponse with zero
// client-side computation. This is the one card on any Overview page so
// far that's a pure passthrough of a single API response.

import { useTranslation } from 'react-i18next';
import { Scale, CheckCircle2, AlertCircle } from 'lucide-react';
import { Skeleton } from '../../common/Skeleton';

interface Props {
  totalDebit: number | undefined;
  totalCredit: number | undefined;
  isBalanced: boolean | undefined;
  isLoading: boolean;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 0,
  }).format(value);
}

export function TrialBalanceSummaryCard({ totalDebit, totalCredit, isBalanced, isLoading }: Props) {
  const { t } = useTranslation();

  return (
    <div className="relative overflow-hidden rounded-xl border border-hairline bg-gradient-to-br from-signal/10 via-panel to-panel p-6 shadow-elevation-1">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-signal/15 text-signal">
            <Scale size={18} strokeWidth={2} />
          </div>
          <div>
            <p className="text-sm font-medium text-ink-primary">
              {t('accounting.overview.trialBalance.title')}
            </p>
            <p className="text-xs text-ink-tertiary">{t('accounting.overview.trialBalance.caption')}</p>
          </div>
        </div>
        {!isLoading && isBalanced !== undefined && (
          <span
            className={[
              'flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full shrink-0',
              isBalanced ? 'bg-success/15 text-success' : 'bg-error/15 text-error',
            ].join(' ')}
          >
            {isBalanced ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
            {isBalanced
              ? t('accounting.overview.trialBalance.balanced')
              : t('accounting.overview.trialBalance.unbalanced')}
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-medium text-ink-tertiary">{t('accounting.overview.trialBalance.totalDebit')}</p>
          {isLoading ? (
            <Skeleton className="h-8 w-32 mt-1" />
          ) : (
            <p className="text-2xl font-display font-semibold text-ink-primary tabular-nums mt-1">
              {formatCurrency(totalDebit ?? 0)}
            </p>
          )}
        </div>
        <div>
          <p className="text-xs font-medium text-ink-tertiary">{t('accounting.overview.trialBalance.totalCredit')}</p>
          {isLoading ? (
            <Skeleton className="h-8 w-32 mt-1" />
          ) : (
            <p className="text-2xl font-display font-semibold text-ink-primary tabular-nums mt-1">
              {formatCurrency(totalCredit ?? 0)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
