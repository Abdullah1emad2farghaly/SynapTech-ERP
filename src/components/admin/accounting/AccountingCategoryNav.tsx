// Intended path: src/components/admin/accounting/AccountingCategoryNav.tsx
// 4th near-duplicate of the category-nav pattern (Sales, Purchasing,
// Inventory before it) — the case for promoting a shared CategoryNav
// component is now strong; still built as its own component here since
// that promotion wasn't explicitly requested.
//
// FLAG: of these 5 tabs, only Overview and Journal Entries (Module 5,
// already fully built) point at real pages. Chart of Accounts, Trial
// Balance, and Accounting Settings have no dedicated pages in this project
// yet — Accounts has so far, at most, only existed as a lookup for the
// Journal Entries line-item picker.

import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const TABS = [
  { to: '/accounting', end: true, key: 'overview' },
  { to: 'accounts', end: false, key: 'accounts' },
  { to: 'journal-entries', end: false, key: 'journalEntries' },
  // { to: 'trial-balance', end: false, key: 'trialBalance' },
  // { to: 'accounting-settings', end: false, key: 'settings' },
] as const;

export function AccountingCategoryNav() {
  const { t } = useTranslation();
  return (
    <nav
      className="flex items-center gap-1 border-b border-hairline mb-6 overflow-x-auto"
      aria-label={t('accounting.overview.categoryNavLabel')}
    >
      {TABS.map(tab => (
        <NavLink
          key={tab.key}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) =>
            [
              'px-3 py-2 text-sm font-medium rounded-t-md transition-colors whitespace-nowrap',
              isActive
                ? 'text-ink-primary border-b-2 border-signal'
                : 'text-ink-tertiary hover:text-ink-secondary',
            ].join(' ')
          }
        >
          {t(`accounting.overview.tabs.${tab.key}`)}
        </NavLink>
      ))}
    </nav>
  );
}
