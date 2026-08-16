// Intended path: src/components/admin/inventory/InventoryValueHeroCard.tsx
// New — a wide, visually prominent banner for the single most "ERP
// executive dashboard"-feeling metric on this page: total inventory value
// at cost. Deliberately given more visual weight than the KPI grid cards
// (larger type, gradient surface) since it's the number a warehouse/
// finance manager would look for first. Grounded in real fields
// (StockLevelResponse.quantityOnHand × ProductResponse.costPrice) — see
// useInventoryOverviewStats.ts for the computation and its caveats.

import { useTranslation } from 'react-i18next';
import { Wallet } from 'lucide-react';
import { Skeleton } from '../../common/Skeleton';

interface Props {
  value: number | undefined;
  isLoading: boolean;
}

function formatCurrency(value: number) {
  // ASSUMPTION: EGP hardcoded, same precedent as Sales/Purchasing Overview.
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 0,
  }).format(value);
}

export function InventoryValueHeroCard({ value, isLoading }: Props) {
  const { t } = useTranslation();

  return (
    <div className="relative overflow-hidden rounded-xl border border-hairline bg-gradient-to-br from-signal/10 via-panel to-panel p-6 shadow-elevation-1">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-ink-tertiary">
            {t('inventory.overview.inventoryValue.title')}
          </p>
          {isLoading ? (
            <Skeleton className="h-10 w-48 mt-2" />
          ) : (
            <p className="text-4xl font-display font-semibold text-ink-primary mt-1 tabular-nums">
              {formatCurrency(value ?? 0)}
            </p>
          )}
          <p className="text-xs text-ink-tertiary mt-2">
            {t('inventory.overview.inventoryValue.caption')}
          </p>
        </div>
        <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-full bg-signal/15 text-signal shrink-0">
          <Wallet size={22} strokeWidth={2} />
        </div>
      </div>
    </div>
  );
}
