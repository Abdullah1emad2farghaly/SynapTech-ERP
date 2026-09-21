// Intended project path: src/components/admin/cashier/ProductGrid.tsx
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, PackageSearch } from "lucide-react";
import type { StockLevel } from "../../../services/api/stock.api";

interface ProductGridProps {
  stock: StockLevel[];
  isLoading: boolean;
  // How much of each product is already sitting in the cart, keyed by
  // productId — used to show *remaining* quantity (on-hand minus what's
  // already been added to this sale), not just the raw stock figure.
  quantityInCart: Record<string, number>;
  onSelect: (item: StockLevel) => void;
}

// Driven by GET /api/Stock/warehouses/{warehouseId} (StockLevel[]) instead
// of the flat product catalog, so this only ever shows products that
// actually have a stock record at the cashier's own warehouse, with a real
// quantityOnHand — no invented "in stock" boolean.
export const ProductGrid = ({ stock, isLoading, quantityInCart, onSelect }: ProductGridProps) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return stock;
    const q = query.trim().toLowerCase();
    return stock.filter(
      (item) =>
        item.productName.toLowerCase().includes(q) || item.productSku.toLowerCase().includes(q)
    );
  }, [stock, query]);

  return (
    <div className="flex h-full flex-col">
      <div className="relative mb-4 shrink-0">
        <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-tertiary)]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("cashier.pos.searchProducts")}
          className="w-full rounded-md border border-[var(--hairline)] bg-[var(--panel)] py-2.5 ps-9 pe-3 text-sm text-[var(--ink-primary)] outline-none transition focus:border-[var(--signal)]"
          autoFocus
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-lg bg-[var(--sunken)]" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center text-[var(--ink-tertiary)]">
          <PackageSearch className="h-8 w-8" />
          <p className="text-sm">{t("cashier.pos.noProductsFound")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 overflow-y-auto pb-2 lg:grid-cols-3">
          {filtered.map((item) => {
            const inCart = quantityInCart[item.productId] ?? 0;
            const remaining = item.quantityOnHand - inCart;
            const outOfStock = remaining <= 0;

            return (
              <button
                key={item.productId}
                type="button"
                disabled={outOfStock}
                onClick={() => onSelect(item)}
                className="group flex flex-col items-start gap-1 rounded-lg border border-[var(--hairline)] bg-[var(--panel)] p-3 text-start shadow-elevation-1 transition hover:border-[var(--signal)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-[var(--hairline)] disabled:active:scale-100"
              >
                <span className="line-clamp-2 text-sm font-medium text-[var(--ink-primary)]">
                  {item.productName}
                </span>
                <span className="font-mono text-xs text-[var(--ink-tertiary)]">
                  {item.productSku}
                </span>

                <div className="mt-auto flex w-full items-center justify-between pt-1">
                  <span className="text-sm font-semibold text-[var(--signal)]">
                    {item.salePrice.toFixed(2)}
                  </span>
                  <span
                    className={`text-xs font-medium ${
                      outOfStock
                        ? "text-[var(--error)]"
                        : remaining <= 5
                          ? "text-[var(--warning)]"
                          : "text-[var(--ink-tertiary)]"
                    }`}
                  >
                    {outOfStock
                      ? t("cashier.pos.outOfStock")
                      : t("cashier.pos.remainingQuantity", { count: remaining })}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
