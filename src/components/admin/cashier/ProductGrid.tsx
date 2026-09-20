// Intended project path: src/components/admin/cashier/ProductGrid.tsx
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, PackageSearch } from "lucide-react";
import type { Product } from "../../../services/api/products.api"; // ASSUMPTION: existing confirmed Products module export path

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
  onSelect: (product: Product) => void;
}

// Reuses the already-confirmed Products API (see project memory — full CRUD,
// ProductResponse: id, sku, name, description, unitOfMeasure, categoryId,
// costPrice, salePrice, isActive). No Cashier-specific product fields
// invented — salePrice is the price shown/used here.
export const ProductGrid = ({ products, isLoading, onSelect }: ProductGridProps) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const active = products.filter((p) => p.isActive);
    if (!query.trim()) return active;
    const q = query.trim().toLowerCase();
    return active.filter(
      (p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
    );
  }, [products, query]);

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
            <div
              key={i}
              className="h-28 animate-pulse rounded-lg bg-[var(--sunken)]"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center text-[var(--ink-tertiary)]">
          <PackageSearch className="h-8 w-8" />
          <p className="text-sm">{t("cashier.pos.noProductsFound")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 overflow-y-auto pb-2 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => onSelect(product)}
              className="group flex flex-col items-start gap-1 rounded-lg border border-[var(--hairline)] bg-[var(--panel)] p-3 text-start shadow-elevation-1 transition hover:border-[var(--signal)] active:scale-[0.98]"
            >
              <span className="line-clamp-2 text-sm font-medium text-[var(--ink-primary)]">
                {product.name}
              </span>
              <span className="font-mono text-xs text-[var(--ink-tertiary)]">{product.sku}</span>
              <span className="mt-auto pt-1 text-sm font-semibold text-[var(--signal)]">
                {product.salePrice.toFixed(2)}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
