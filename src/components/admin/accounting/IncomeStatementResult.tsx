// Project path: src/components/admin/accounting/IncomeStatementResult.tsx

import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../../utils/formatters';

interface IncomeStatementResultProps {
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
}

export function IncomeStatementResult({
  totalRevenue,
  totalExpenses,
  netIncome,
}: IncomeStatementResultProps) {
  const { t } = useTranslation('');
  const isProfit = netIncome >= 0;

  return (
    <div className="rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] p-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-[var(--ink-tertiary)]">{t('incomeStatement.totalRevenue')}</p>
          <p className="mt-1 text-lg font-semibold tabular-nums text-[var(--ink-primary)]">
            {formatCurrency(totalRevenue)}
          </p>
        </div>
        <div>
          <p className="text-xs text-[var(--ink-tertiary)]">{t('incomeStatement.totalExpenses')}</p>
          <p className="mt-1 text-lg font-semibold tabular-nums text-[var(--ink-primary)]">
            {formatCurrency(totalExpenses)}
          </p>
        </div>
        <div>
          <p className="text-xs text-[var(--ink-tertiary)]">{t('incomeStatement.netIncome')}</p>
          <p
            className={`mt-1 text-lg font-semibold tabular-nums ${
              isProfit ? 'text-[var(--success)]' : 'text-[var(--error)]'
            }`}
          >
            {formatCurrency(netIncome)}
          </p>
        </div>
      </div>
    </div>
  );
}
