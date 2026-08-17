// Intended path: src/components/admin/accounting/RecentJournalEntriesList.tsx
// Mirrors Sales/Purchasing Overview's recent-orders pattern. Entry total is
// computed client-side as sum(line.debit) — JournalEntryResponse itself has
// no totalAmount field, but double-entry means sum(debit) === sum(credit)
// for any correctly-posted entry, so this is a faithful display value, not
// an invented one.
// ASSUMPTION: path/name of an existing JournalEntryStatusBadge component —
// verify against the actual Journal Entries module folder (Module 5).

import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Skeleton } from '../../common/Skeleton';
import { EmptyState } from '../../common/EmptyState';
import { JournalEntryStatusBadge } from '../journal-entries/JournalEntryStatusBadge';
import type { JournalEntryResponse } from '@/types/journalEntries.types';

interface Props {
  data: JournalEntryResponse[] | undefined;
  isLoading: boolean;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 0,
  }).format(value);
}

function entryTotal(entry: JournalEntryResponse) {
  return (entry.lines ?? []).reduce((sum, l) => sum + (l.debit ?? 0), 0);
}

export function RecentJournalEntriesList({ data, isLoading }: Props) {
  const { t } = useTranslation();

  return (
    <div className="bg-panel border border-hairline rounded-lg p-4 shadow-elevation-1">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-ink-primary">
          {t('accounting.overview.recentEntries.title')}
        </h3>
        <Link to="journal-entries" className="text-xs font-medium text-signal hover:text-signal-hover">
          {t('accounting.overview.recentEntries.viewAll')}
        </Link>
      </div>
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <EmptyState
          title={t('accounting.overview.recentEntries.emptyTitle')}
          description={t('accounting.overview.recentEntries.emptyDescription')}
        />
      ) : (
        <ul className="divide-y divide-hairline">
          {data.map(entry => (
            <li key={entry.id}>
              <Link
                to={`journal-entries/${entry.id}`}
                className="flex items-center justify-between py-3 hover:bg-sunken/40 -mx-2 px-2 rounded-md transition-colors"
              >
                <div className="min-w-0">
                  <p className="font-mono text-sm text-ink-primary truncate">{entry.entryNumber}</p>
                  <p className="text-xs text-ink-tertiary truncate">{entry.description}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <JournalEntryStatusBadge status={entry.status} />
                  <span className="text-sm text-ink-secondary tabular-nums">{formatCurrency(entryTotal(entry))}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
