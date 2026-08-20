// Intended path: src/components/admin/hr/HrCategoryNav.tsx
// 5th near-duplicate of the category-nav pattern (Sales, Purchasing,
// Inventory, Accounting before it). At this count, promoting a shared
// CategoryNav(tabs) component is no longer just a suggestion worth
// flagging — it's a straightforward refactor that would delete ~80% of
// five files. Still built as its own component here since that
// consolidation wasn't explicitly requested.
//
// All 3 tabs here point at real, already-built pages: Employees
// (Module 10), Attendance has NO dedicated page yet (only the raw API is
// used inline on this Overview page), Leave Requests (Module 11).

import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const TABS = [
  { to: '/hr', end: true, key: 'overview' },
  { to: 'employees', end: false, key: 'employees' },
  { to: 'leave-requests', end: false, key: 'leaveRequests' },
] as const;

export function HrCategoryNav() {
  const { t } = useTranslation();
  return (
    <nav
      className="flex items-center gap-1 border-b border-hairline mb-6"
      aria-label={t('hr.overview.categoryNavLabel')}
    >
      {TABS.map(tab => (
        <NavLink
          key={tab.key}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) =>
            [
              'px-3 py-2 text-sm font-medium rounded-t-md transition-colors',
              isActive
                ? 'text-ink-primary border-b-2 border-signal'
                : 'text-ink-tertiary hover:text-ink-secondary',
            ].join(' ')
          }
        >
          {t(`hr.overview.tabs.${tab.key}`)}
        </NavLink>
      ))}
    </nav>
  );
}
