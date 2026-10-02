// Project path: src/pages/admin/accounting/CashFlowPage.tsx

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../../components/common/PageHeader';
import { ErrorState } from '../../../components/common/ErrorState';
import { PeriodRangeControl } from '../../../components/admin/accounting/PeriodRangeControl';
import { CashFlowSummaryCards } from '../../../components/admin/accounting/CashFlowSummaryCards';
import { CashFlowMovementsTable } from '../../../components/admin/accounting/CashFlowMovementsTable';
import { useCashFlow } from '../../../hooks/useFinancialStatements';

function firstOfMonthIso(): string {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function CashFlowPage() {
  const { t } = useTranslation('');
  const [periodStart, setPeriodStart] = useState(firstOfMonthIso());
  const [periodEnd, setPeriodEnd] = useState(todayIso());

  const { data, isLoading, isError, refetch } = useCashFlow(periodStart, periodEnd);

  return (
    <div className="flex flex-col gap-6  py-6 md:px-4 px-2">
      <PageHeader
        title={t('cashFlow.title')}
        description={t('cashFlow.description')}
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
          <CashFlowSummaryCards
            openingCashBalance={data.openingCashBalance}
            closingCashBalance={data.closingCashBalance}
            netChange={data.netChange}
          />

          <section className="rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] overflow-hidden">
            <header className="px-4 py-3 border-b border-[var(--hairline)]">
              <h3 className="text-sm font-medium text-[var(--ink-primary)]">
                {t('cashFlow.movements')}
              </h3>
            </header>
            <CashFlowMovementsTable movements={data.movements} />
          </section>
        </>
      )}
    </div>
  );
}
