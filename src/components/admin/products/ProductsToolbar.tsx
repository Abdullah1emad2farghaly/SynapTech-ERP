// src/components/admin/products/ProductsToolbar.tsx
//
// Hand-rolled toolbar, matching the existing (documented, not-yet-extracted)
// pattern used by UsersListPage/DepartmentsPage/BranchesPage. Handoff Section 10
// flags this as real duplication worth extracting into a shared Toolbar component
// — but that extraction is a cross-module refactor outside this feature's scope,
// so this file intentionally continues the established (if imperfect) convention
// rather than introducing an un-requested shared component.
//
// Presentation-only: owns no state itself, all values/handlers are controlled by
// ProductsListPage.
import { Plus, RefreshCw, Search, X } from "lucide-react";
import { useTranslation } from "react-i18next";

export interface ProductsToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  categoryValue: string;
  onCategoryChange: (value: string) => void;
  categoryOptions: string[];
  statusValue: "all" | "active" | "inactive";
  onStatusChange: (value: "all" | "active" | "inactive") => void;
  onRefresh: () => void;
  onAddProduct: () => void;
  isRefreshing?: boolean;
  className?: string;
}

export function ProductsToolbar({
  searchValue,
  onSearchChange,
  categoryValue,
  onCategoryChange,
  categoryOptions,
  statusValue,
  onStatusChange,
  onRefresh,
  onAddProduct,
  isRefreshing = false,
  className = "",
}: ProductsToolbarProps) {
  const { t } = useTranslation();

  const activeChips: { key: string; label: string; onClear: () => void }[] = [];
  if (searchValue) {
    activeChips.push({
      key: "search",
      label: t("products.toolbar.chips.search", { value: searchValue }),
      onClear: () => onSearchChange(""),
    });
  }
  if (categoryValue) {
    activeChips.push({
      key: "category",
      label: t("products.toolbar.chips.category", { value: categoryValue }),
      onClear: () => onCategoryChange(""),
    });
  }
  if (statusValue !== "all") {
    activeChips.push({
      key: "status",
      label: t(`products.toolbar.chips.status.${statusValue}`),
      onClear: () => onStatusChange("all"),
    });
  }

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:max-w-xs">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-tertiary)]"
              aria-hidden="true"
            />
            <input
              type="text"
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={t("products.toolbar.searchPlaceholder") ?? ""}
              aria-label={t("products.toolbar.searchPlaceholder") ?? ""}
              className="h-10 w-full rounded-md border border-[var(--hairline)] bg-[var(--sunken)] pl-9 pr-3 text-sm text-[var(--ink-primary)] placeholder:text-[var(--ink-tertiary)] focus:border-[var(--signal)] focus:outline-none focus:ring-2 focus:ring-[var(--synapse)]/40"
            />
          </div>

          <select
            value={categoryValue}
            onChange={(event) => onCategoryChange(event.target.value)}
            aria-label={t("products.toolbar.categoryFilter") ?? ""}
            className="h-10 w-full rounded-md border border-[var(--hairline)] bg-[var(--sunken)] px-3 text-sm text-[var(--ink-primary)] focus:border-[var(--signal)] focus:outline-none focus:ring-2 focus:ring-[var(--synapse)]/40 sm:w-48"
          >
            <option value="">{t("products.toolbar.allCategories")}</option>
            {categoryOptions.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            value={statusValue}
            onChange={(event) =>
              onStatusChange(event.target.value as "all" | "active" | "inactive")
            }
            aria-label={t("products.toolbar.statusFilter") ?? ""}
            className="h-10 w-full rounded-md border border-[var(--hairline)] bg-[var(--sunken)] px-3 text-sm text-[var(--ink-primary)] focus:border-[var(--signal)] focus:outline-none focus:ring-2 focus:ring-[var(--synapse)]/40 sm:w-40"
          >
            <option value="all">{t("products.toolbar.allStatuses")}</option>
            <option value="active">{t("common.status.active")}</option>
            <option value="inactive">{t("common.status.inactive")}</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            aria-label={t("common.actions.refresh") ?? ""}
            title={t("common.actions.refresh") ?? ""}
            className="flex h-10 w-10 items-center justify-center rounded-md border border-[var(--hairline)] bg-[var(--panel)] text-[var(--ink-secondary)] transition-colors duration-150 ease-out hover:bg-[var(--sunken)] focus:outline-none focus:ring-2 focus:ring-[var(--synapse)]/40 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={isRefreshing ? "animate-spin" : undefined}
            />
          </button>

          <button
            type="button"
            onClick={onAddProduct}
            className="flex h-10 items-center gap-2 rounded-md bg-[var(--signal)] px-4 text-sm font-medium text-white transition-colors duration-150 ease-out hover:bg-[var(--signal-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--synapse)]/40"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">
              {t("products.toolbar.addProduct")}
            </span>
          </button>
        </div>
      </div>

      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {activeChips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={chip.onClear}
              className="flex items-center gap-1.5 rounded-full border border-[var(--hairline)] bg-[var(--sunken)] px-3 py-1 text-xs font-medium text-[var(--ink-secondary)] transition-colors duration-150 ease-out hover:bg-[var(--panel)]"
            >
              {chip.label}
              <X size={12} aria-hidden="true" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
