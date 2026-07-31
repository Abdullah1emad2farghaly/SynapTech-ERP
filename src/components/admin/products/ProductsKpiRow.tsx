// src/components/admin/products/ProductsKpiRow.tsx
//
// Presentation-only, mirrors DepartmentsKpiRow / BranchesKpiRow pattern. Receives
// derived numbers as props — never fetches or computes from raw API data itself.
// ASSUMPTION: "Active" / "Inactive" counts come from the current page's totals as
// passed down by ProductsListPage; there is no confirmed backend aggregate/count
// endpoint (same flagged gap as Departments/Branches' cross-reference pattern).
import { Package, CheckCircle2, XCircle, Layers } from "lucide-react";
import { useTranslation } from "react-i18next";

export interface ProductsKpiRowProps {
  totalCount: number;
  activeCount: number;
  inactiveCount: number;
  categoryCount: number;
  isLoading?: boolean;
  className?: string;
}

interface KpiCardConfig {
  key: string;
  labelKey: string;
  value: number;
  icon: typeof Package;
  accentClassName: string;
}

export function ProductsKpiRow({
  totalCount,
  activeCount,
  inactiveCount,
  categoryCount,
  isLoading = false,
  className = "",
}: ProductsKpiRowProps) {
  const { t } = useTranslation();

  const cards: KpiCardConfig[] = [
    {
      key: "total",
      labelKey: "products.kpi.total",
      value: totalCount,
      icon: Package,
      accentClassName: "text-[var(--signal)] bg-[var(--signal)]/10",
    },
    {
      key: "active",
      labelKey: "products.kpi.active",
      value: activeCount,
      icon: CheckCircle2,
      accentClassName: "text-[var(--success)] bg-[var(--success)]/10",
    },
    {
      key: "inactive",
      labelKey: "products.kpi.inactive",
      value: inactiveCount,
      icon: XCircle,
      accentClassName: "text-[var(--ink-tertiary)] bg-[var(--sunken)]",
    },
    {
      key: "categories",
      labelKey: "products.kpi.categories",
      value: categoryCount,
      icon: Layers,
      accentClassName: "text-[var(--synapse)] bg-[var(--synapse)]/10",
    },
  ];

  return (
    <div
      className={`grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 ${className}`}
    >
      {cards.map((card) => (
        <div
          key={card.key}
          className="rounded-lg border border-[var(--hairline)] bg-[var(--panel)] p-4 shadow-[var(--elevation-1)] sm:p-5"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[var(--ink-secondary)]">
              {t(card.labelKey)}
            </span>
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-md ${card.accentClassName}`}
              aria-hidden="true"
            >
              <card.icon size={18} strokeWidth={2} />
            </span>
          </div>
          <div className="mt-3">
            {isLoading ? (
              <div
                className="h-8 w-16 animate-pulse rounded-[6px] bg-[var(--sunken)]"
                aria-hidden="true"
              />
            ) : (
              <span className="text-2xl font-semibold text-[var(--ink-primary)]">
                {card.value.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
