// Intended path: src/components/admin/sales/SalesCategoryNav.tsx
// Category-level tab navigation for the Sales group (Overview / Customers /
// Sales Orders). Written specifically for Sales rather than prematurely
// abstracted into a generic CategoryNav — that generalization should happen
// once a second category overview (Purchasing, Inventory, etc.) is actually
// built, so the abstraction is based on two real usages, not a guess.

import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const TABS = [
  { to: '/sales', end: true, key: 'overview' },
  { to: 'customers', end: false, key: 'customers' },
  { to: 'sales-orders', end: false, key: 'salesOrders' },
] as const;

export function SalesCategoryNav() {
  const { t } = useTranslation();
  return (
    <nav
      className="flex items-center gap-1 border-b border-hairline mb-6"
      aria-label={t('sales.overview.categoryNavLabel')}
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
          {t(`sales.overview.tabs.${tab.key}`)}
        </NavLink>
      ))}
    </nav>
  );
}
