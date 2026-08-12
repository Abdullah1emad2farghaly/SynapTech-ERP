// Intended path: src/components/admin/inventory/InventoryCategoryNav.tsx
// Mirrors SalesCategoryNav/PurchasingCategoryNav — now the 3rd near-
// duplicate of this pattern, strengthening the case (already flagged on
// Purchasing Overview) to promote this into a shared CategoryNav(tabs)
// component before a 4th is built the same way.
//
// FLAG: unlike Sales/Purchasing, only 2 of these 4 tabs point at pages that
// actually exist in this project — Overview (this page) and Warehouses
// (Module 6, fully built). Products and Categories have no dedicated
// management pages built yet (Products has only ever been a line-item
// lookup; Categories was started and explicitly cancelled mid-build).
// Included here anyway to match the ERP's stated Inventory nav structure —
// clicking those two tabs will 404 until those modules are built.

import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const TABS = [
  { to: '/inventory', end: true, key: 'overview' },
  { to: 'products', end: false, key: 'products' },
  { to: 'categories', end: false, key: 'categories' },
  { to: 'warehouses', end: false, key: 'warehouses' },
] as const;

export function InventoryCategoryNav() {
  const { t } = useTranslation();
  return (
    <nav
      className="flex items-center gap-1 border-b border-hairline mb-6"
      aria-label={t('inventory.overview.categoryNavLabel')}
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
          {t(`inventory.overview.tabs.${tab.key}`)}
        </NavLink>
      ))}
    </nav>
  );
}
