// Project path: src/pages/admin/accounting/IncomeStatementPage.tsx

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../../components/common/PageHeader';
import { ErrorState } from '../../../components/common/ErrorState';
import { PeriodRangeControl } from '../../../components/admin/accounting/PeriodRangeControl';
import { StatementSectionCard } from '../../../components/admin/accounting/StatementSectionCard';
import { FinancialStatementLineTable } from '../../../components/admin/accounting/FinancialStatementLineTable';
import { IncomeStatementResult } from '../../../components/admin/accounting/IncomeStatementResult';
import { useIncomeStatement } from '../../../hooks/useFinancialStatements';

function firstOfMonthIso(): string {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function IncomeStatementPage() {
  const { t } = useTranslation('');
  const [periodStart, setPeriodStart] = useState(firstOfMonthIso());
  const [periodEnd, setPeriodEnd] = useState(todayIso());

  const { data, isLoading, isError, refetch } = useIncomeStatement(periodStart, periodEnd);

  return (
    <div className="flex flex-col gap-6  py-6 md:px-4 px-2">
      <PageHeader
        title={t('incomeStatement.title')}
        description={t('incomeStatement.description')}
        actions={
          <PeriodRangeControl
            periodStart={periodStart}
            periodEnd={periodEnd}
            onChangeStart={setPeriodStart}
            onChangeEnd={setPeriodEnd}
          />
        }
      />

      {isError && <ErrorState onRetry={refetch} title='' />}

      {!isError && isLoading && (
        <div className="h-40 animate-pulse rounded-[10px] bg-[var(--sunken)]" />
      )}

      {!isError && !isLoading && data && (
        <>
          <IncomeStatementResult
            totalRevenue={data.totalRevenue}
            totalExpenses={data.totalExpenses}
            netIncome={data.netIncome}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <StatementSectionCard
              title={t('incomeStatement.revenue')}
              totalLabel={t('incomeStatement.totalRevenue')}
              total={data.totalRevenue}
              accent="positive"
            >
              <FinancialStatementLineTable
                lines={data.revenues}
                emptyLabel={t('incomeStatement.noRevenue')}
              />
            </StatementSectionCard>

            <StatementSectionCard
              title={t('incomeStatement.expenses')}
              totalLabel={t('incomeStatement.totalExpenses')}
              total={data.totalExpenses}
              accent="negative"
            >
              <FinancialStatementLineTable
                lines={data.expenses}
                emptyLabel={t('incomeStatement.noExpenses')}
              />
            </StatementSectionCard>
          </div>
        </>
      )}
    </div>
  );
}
