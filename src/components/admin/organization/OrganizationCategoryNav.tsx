// Intended path: src/components/admin/organization/OrganizationCategoryNav.tsx
// 6th near-duplicate of the category-nav pattern (Sales, Purchasing,
// Inventory, Accounting, HR before it). Flagging again, as with each prior
// one — this is now clearly overdue for consolidation into a shared
// CategoryNav(tabs) component rather than a 7th near-identical file.
//
// Company has no tab of its own here — there's nothing to navigate to
// (single-record settings, not a list), so it's represented on this
// Overview page directly via CompanyHeroCard rather than as a nav
// destination. Both Branches and Departments tabs point at real,
// already-built pages (Modules 3 and 2).

import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const TABS = [
  { to: '/organization', end: true, key: 'overview' },
  { to: 'branches', end: false, key: 'branches' },
  { to: 'departments', end: false, key: 'departments' },
] as const;

export function OrganizationCategoryNav() {
  const { t } = useTranslation();
  return (
    <nav
      className="flex items-center gap-1 border-b border-hairline mb-6"
      aria-label={t('organization.overview.categoryNavLabel')}
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
          {t(`organization.overview.tabs.${tab.key}`)}
        </NavLink>
      ))}
    </nav>
  );
}
