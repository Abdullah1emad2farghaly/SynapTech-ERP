// Intended path: src/components/admin/purchasing/PurchasingCategoryNav.tsx
// Mirrors SalesCategoryNav.tsx's structure exactly — this is the second
// usage of the category-nav pattern, so it's now a reasonable point to
// consider extracting a shared CategoryNav(tabs) component instead of a
// third near-duplicate. Left as its own component here since generalizing
// wasn't explicitly requested; flagged as a promotion candidate.

import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const TABS = [
  { to: '/purchasing', end: true, key: 'overview' },
  { to: 'suppliers', end: false, key: 'suppliers' },
  { to: 'purchase-orders', end: false, key: 'purchaseOrders' },
] as const;

export function PurchasingCategoryNav() {
  const { t } = useTranslation();
  return (
    <nav
      className="flex items-center gap-1 border-b border-hairline mb-6"
      aria-label={t('purchasing.overview.categoryNavLabel')}
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
          {t(`purchasing.overview.tabs.${tab.key}`)}
        </NavLink>
      ))}
    </nav>
  );
}
