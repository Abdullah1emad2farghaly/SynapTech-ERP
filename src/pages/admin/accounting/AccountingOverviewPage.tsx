// Intended path: src/pages/admin/accounting/AccountingOverviewPage.tsx
// The most detailed Overview page in the series so far, per the request:
// trial balance hero, 4 distinct charts (2 bar, 1 donut, 1 new line/area
// trend), KPI row, recent entries list, and a snapshot card — versus 1-3
// charts on the earlier three pages. Journal Entries (Module 5) is already
// fully built, so "View all"/entry links here are real, unlike the
// Accounts-management links which are flagged 404s (see
// AccountsSnapshotCard.tsx).

import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AccountingCategoryNav } from '../../../components/admin/accounting/AccountingCategoryNav';
import { TrialBalanceSummaryCard } from '../../../components/admin/accounting/TrialBalanceSummaryCard';
import { AccountingKpiCards } from '../../../components/admin/accounting/AccountingKpiCards';
import { AccountsByTypeBarChart } from '../../../components/admin/accounting/AccountsByTypeBarChart';
import { BalanceByAccountTypeBarChart } from '../../../components/admin/accounting/BalanceByAccountTypeBarChart';
import { TopAccountsByBalanceChart } from '../../../components/admin/accounting/TopAccountsByBalanceChart';
import { JournalEntriesByStatusChart } from '../../../components/admin/accounting/JournalEntriesByStatusChart';
import { JournalEntriesOverTimeChart } from '../../../components/admin/accounting/JournalEntriesOverTimeChart';
import { RecentJournalEntriesList } from '../../../components/admin/accounting/RecentJournalEntriesList';
import { AccountsSnapshotCard } from '../../../components/admin/accounting/AccountsSnapshotCard';
import { EmptyState } from '../../../components/common/EmptyState';
import { useAccountingOverviewStats } from '../../../hooks/useAccountingOverviewStats';

export default function AccountingOverviewPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { stats, isLoading, isTrialBalanceLoading, isError, refetch } = useAccountingOverviewStats();

  const isFullyEmpty = !isLoading && stats && stats.totalAccounts === 0 && stats.totalJournalEntries === 0;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-1">
        <div>
          <h1 className="text-2xl font-display font-semibold text-ink-primary">
            {t('accounting.overview.pageTitle')}
          </h1>
          <p className="text-sm text-ink-tertiary mt-1">{t('accounting.overview.pageSubtitle')}</p>
        </div>
        <button
          onClick={() => navigate('journal-entries/create')}
          className="bg-signal hover:bg-signal-hover text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
        >
          {t('accounting.overview.newEntry')}
        </button>
      </div>

      <AccountingCategoryNav />

      {isError ? (
        <div className="bg-panel border border-error/30 rounded-lg p-6 text-center">
          <p className="text-sm text-error mb-3">{t('accounting.overview.errorTitle')}</p>
          <button onClick={refetch} className="text-sm font-medium text-signal hover:text-signal-hover">
            {t('accounting.overview.retry')}
          </button>
        </div>
      ) : isFullyEmpty ? (
        <EmptyState
          title={t('accounting.overview.emptyTitle')}
          description={t('accounting.overview.emptyDescription')}
          action={{ label: t('accounting.overview.newEntry'), onClick: () => navigate('journal-entries/create') }}
        />
      ) : (
        <div className="space-y-6">
          <TrialBalanceSummaryCard
            totalDebit={stats?.totalDebitBalances}
            totalCredit={stats?.totalCreditBalances}
            isBalanced={stats?.isBalanced}
            isLoading={isLoading || isTrialBalanceLoading}
          />

          <AccountingKpiCards stats={stats} isLoading={isLoading} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BalanceByAccountTypeBarChart data={stats?.balanceByType} isLoading={isLoading || isTrialBalanceLoading} />
            <TopAccountsByBalanceChart data={stats?.topAccountsByBalance} isLoading={isLoading || isTrialBalanceLoading} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <JournalEntriesOverTimeChart data={stats?.entriesOverTime} isLoading={isLoading} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <AccountsByTypeBarChart data={stats?.accountsByType} isLoading={isLoading} />
              <JournalEntriesByStatusChart data={stats?.journalEntriesByStatus} isLoading={isLoading} />
            </div>
          </div>

          <RecentJournalEntriesList data={stats?.recentEntries} isLoading={isLoading} />

          <AccountsSnapshotCard stats={stats} isLoading={isLoading} />

          <div className="flex flex-wrap gap-3">
            {/* FLAG: New Account routes to a module that doesn't exist yet — see AccountsSnapshotCard's header comment. */}
            <button
              onClick={() => navigate('journal-entries/create')}
              className="text-sm font-medium px-4 py-2 rounded-md border border-hairline hover:border-signal/40 text-ink-primary transition-colors"
            >
              {t('accounting.overview.quickActions.newEntry')}
            </button>
            <button
              onClick={() => navigate('accounts')}
              className="text-sm font-medium px-4 py-2 rounded-md border border-hairline hover:border-signal/40 text-ink-primary transition-colors"
            >
              {t('accounting.overview.quickActions.newAccount')}
            </button>
            <button
              onClick={() => navigate('journal-entries')}
              className="text-sm font-medium px-4 py-2 rounded-md border border-hairline hover:border-signal/40 text-ink-primary transition-colors"
            >
              {t('accounting.overview.quickActions.viewAllEntries')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
