// Project path: src/pages/admin/accounting/BalanceSheetPage.tsx

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../../components/common/PageHeader';
import { ErrorState } from '../../../components/common/ErrorState';
import { AsOfDateControl } from '../../../components/admin/accounting/AsOfDateControl';
import { BalanceSheetSummary } from '../../../components/admin/accounting/BalanceSheetSummary';
import { StatementSectionCard } from '../../../components/admin/accounting/StatementSectionCard';
import { FinancialStatementLineTable } from '../../../components/admin/accounting/FinancialStatementLineTable';
import { useBalanceSheet } from '../../../hooks/useFinancialStatements';
import { formatCurrency } from '../../../utils/formatters';

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function BalanceSheetPage() {
  const { t } = useTranslation('');
  const [asOfDate, setAsOfDate] = useState(todayIso());

  const { data, isLoading, isError, refetch } = useBalanceSheet(asOfDate);

  return (
    <div className="flex flex-col gap-6 py-6 md:px-4 px-2">
      <PageHeader
        title={t('balanceSheet.title')}
        description={t('balanceSheet.description')}
        actions={<AsOfDateControl value={asOfDate} onChange={setAsOfDate} />}
      />

      {isError && <ErrorState onRetry={refetch} title='' />}

      {!isError && isLoading && (
        <div className="h-40 animate-pulse rounded-[10px] bg-[var(--sunken)]" />
      )}

      {!isError && !isLoading && data && (
        <>
          <BalanceSheetSummary data={data} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <StatementSectionCard
              title={t('balanceSheet.assets')}
              totalLabel={t('balanceSheet.totalAssets')}
              total={data.totalAssets}
            >
              <FinancialStatementLineTable
                lines={data.assets}
                emptyLabel={t('balanceSheet.noAssets')}
              />
            </StatementSectionCard>

            <StatementSectionCard
              title={t('balanceSheet.liabilities')}
              totalLabel={t('balanceSheet.totalLiabilities')}
              total={data.totalLiabilities}
            >
              <FinancialStatementLineTable
                lines={data.liabilities}
                emptyLabel={t('balanceSheet.noLiabilities')}
              />
            </StatementSectionCard>

            <StatementSectionCard
              title={t('balanceSheet.equity')}
              totalLabel={t('balanceSheet.totalEquity')}
              total={data.totalEquity}
              accent="positive"
            >
              <FinancialStatementLineTable
                lines={data.equity}
                emptyLabel={t('balanceSheet.noEquity')}
              />
              <div className="flex items-center justify-between border-t border-[var(--hairline)] px-4 py-3">
                <span className="text-sm text-[var(--ink-secondary)]">
                  {t('balanceSheet.currentEarnings')}
                </span>
                <span className="text-sm font-medium tabular-nums text-[var(--ink-primary)]">
                  {formatCurrency(data.currentEarnings)}
                </span>
              </div>
            </StatementSectionCard>
          </div>
        </>
      )}
    </div>
  );
}
