// Intended path: src/components/admin/administration/AdministrationCategoryNav.tsx
// 7th near-duplicate of the category-nav pattern — every prior Overview
// page has flagged this, and it's the last one in the original nav
// structure, so this is as good a point as any to actually do the
// promotion to a shared CategoryNav(tabs) component as a follow-up.
//
// NOTE the Roles path: per this project's existing routes, Roles
// Management lives at /organization/roles, not /roles (Module 4 was
// nested under an Organization section in the actual app, despite being
// grouped under "Administration" in the nav structure this whole Overview
// series has followed). Both tabs point at real, already-built pages
// (Modules 1 and 4).

import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const TABS = [
  { to: '/administration', end: true, key: 'overview' },
  { to: 'users', end: false, key: 'users' },
  { to: 'roles', end: false, key: 'roles' },
] as const;

export function AdministrationCategoryNav() {
  const { t } = useTranslation();
  return (
    <nav
      className="flex items-center gap-1 border-b border-hairline mb-6"
      aria-label={t('administration.overview.categoryNavLabel')}
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
          {t(`administration.overview.tabs.${tab.key}`)}
        </NavLink>
      ))}
    </nav>
  );
}
