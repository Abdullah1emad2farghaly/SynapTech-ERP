// Intended path: src/components/admin/accounting/AccountingKpiCards.tsx

import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { BookOpen, CheckSquare, ListTree, FileText } from 'lucide-react';
import { Skeleton } from '../../common/Skeleton';
import type { AccountingOverviewStats } from '../../../hooks/useAccountingOverviewStats';

interface Props {
  stats: AccountingOverviewStats | null;
  isLoading: boolean;
}

export function AccountingKpiCards({ stats, isLoading }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const cards = [
    {
      key: 'totalAccounts',
      value: stats?.totalAccounts ?? 0,
      caption: t('accounting.overview.kpi.totalAccountsCaption'),
      icon: ListTree,
      onClick: () => navigate('accounts'),
    },
    {
      key: 'activeAccounts',
      value: stats?.activeAccounts ?? 0,
      caption: t('accounting.overview.kpi.activeAccountsCaption'),
      icon: CheckSquare,
      onClick: () => navigate('accounts'),
    },
    {
      key: 'totalJournalEntries',
      value: stats?.totalJournalEntries ?? 0,
      caption: t('accounting.overview.kpi.totalJournalEntriesCaption'),
      icon: BookOpen,
      onClick: () => navigate('journal-entries'),
    },
    {
      key: 'postedJournalEntries',
      value: stats?.postedJournalEntries ?? 0,
      caption: t('accounting.overview.kpi.postedJournalEntriesCaption'),
      icon: FileText,
      onClick: () => navigate('journal-entries'),
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(card => {
        const Icon = card.icon;
        return (
          <button
            key={card.key}
            onClick={card.onClick}
            className="text-start bg-panel border border-hairline rounded-lg p-4 shadow-elevation-1 hover:border-signal/40 hover:shadow-elevation-2 transition-all"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-ink-tertiary">
                {t(`accounting.overview.kpi.${card.key}`)}
              </p>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-signal/10 text-signal">
                <Icon size={16} strokeWidth={2} />
              </div>
            </div>
            {isLoading ? (
              <Skeleton className="h-7 w-16 mt-2" />
            ) : (
              <p className="text-2xl font-display font-semibold text-ink-primary mt-2 tabular-nums">{card.value}</p>
            )}
            <p className="text-xs text-ink-tertiary mt-1">{card.caption}</p>
          </button>
        );
      })}
    </div>
  );
}
