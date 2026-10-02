// Project path: src/components/admin/accounting/BalanceSheetSummary.tsx

import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../../utils/formatters';
import type { BalanceSheetResponse } from '../../../types/financial-statements.types';

interface BalanceSheetSummaryProps {
  data: BalanceSheetResponse;
}

export function BalanceSheetSummary({ data }: BalanceSheetSummaryProps) {
  const { t } = useTranslation('');

  const cards: Array<{ label: string; value: number }> = [
    { label: t('balanceSheet.totalAssets'), value: data.totalAssets },
    { label: t('balanceSheet.totalLiabilities'), value: data.totalLiabilities },
    { label: t('balanceSheet.totalEquity'), value: data.totalEquity },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] px-4 py-3"
          >
            <p className="text-xs text-[var(--ink-tertiary)]">{card.label}</p>
            <p className="mt-1 text-lg font-semibold tabular-nums text-[var(--ink-primary)]">
              {formatCurrency(card.value)}
            </p>
          </div>
        ))}
      </div>

      <div
        className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${
          data.isBalanced
            ? 'bg-[var(--success)]/10 text-[var(--success)]'
            : 'bg-[var(--error)]/10 text-[var(--error)]'
        }`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
        {data.isBalanced ? t('reports.balanced') : t('reports.outOfBalance')}
      </div>
    </div>
  );
}
