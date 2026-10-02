// Project path: src/components/admin/accounting/CashFlowSummaryCards.tsx

import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../../utils/formatters';

interface CashFlowSummaryCardsProps {
  openingCashBalance: number;
  closingCashBalance: number;
  netChange: number;
}

export function CashFlowSummaryCards({
  openingCashBalance,
  closingCashBalance,
  netChange,
}: CashFlowSummaryCardsProps) {
  const { t } = useTranslation('');
  const isPositive = netChange >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div className="rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] px-4 py-3">
        <p className="text-xs text-[var(--ink-tertiary)]">{t('cashFlow.openingBalance')}</p>
        <p className="mt-1 text-lg font-semibold tabular-nums text-[var(--ink-primary)]">
          {formatCurrency(openingCashBalance)}
        </p>
      </div>
      <div className="rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] px-4 py-3">
        <p className="text-xs text-[var(--ink-tertiary)]">{t('cashFlow.closingBalance')}</p>
        <p className="mt-1 text-lg font-semibold tabular-nums text-[var(--ink-primary)]">
          {formatCurrency(closingCashBalance)}
        </p>
      </div>
      <div className="rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] px-4 py-3">
        <p className="text-xs text-[var(--ink-tertiary)]">{t('cashFlow.netChange')}</p>
        <p
          className={`mt-1 text-lg font-semibold tabular-nums ${
            isPositive ? 'text-[var(--success)]' : 'text-[var(--error)]'
          }`}
        >
          {formatCurrency(netChange)}
        </p>
      </div>
    </div>
  );
}
