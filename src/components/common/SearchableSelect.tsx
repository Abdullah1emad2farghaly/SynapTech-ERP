// src/components/common/SearchableSelect.tsx
//
// Generic single-select searchable dropdown — built for the Stock
// module's Product/Warehouse pickers (Record Movement, Transfer), since
// neither an existing single-select plain <select> nor the multi-select
// MultiSelectSearchable fit a potentially large product catalog well.
// Extracted as a shared common/ component from the start rather than
// building it once inside RecordMovementPage and duplicating it inside
// TransferStockWizard — both forms need the exact same picker twice
// (Product, and one or two Warehouse fields).

import { useMemo, useState } from "react";
import { Search, ChevronDown, X } from "lucide-react";

export interface SearchableSelectOption {
  value: string;
  label: string;
  /** Optional secondary line shown under the label (e.g. a SKU). */
  secondaryLabel?: string;
}

export interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  searchPlaceholder: string;
  placeholder: string;
  /** Options to exclude entirely (not shown-disabled) — e.g. a Transfer's already-chosen source warehouse when picking the destination. */
  excludedValues?: Set<string>;
  emptyResultsLabel?: string;
  disabled?: boolean;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  searchPlaceholder,
  placeholder,
  excludedValues,
  emptyResultsLabel = "No results",
  disabled = false,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const visibleOptions = useMemo(() => {
    const filtered = options.filter((o) => !excludedValues?.has(o.value));
    if (!query.trim()) return filtered;
    const q = query.trim().toLowerCase();
    return filtered.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        (o.secondaryLabel ? o.secondaryLabel.toLowerCase().includes(q) : false),
    );
  }, [options, query, excludedValues]);

  const selectedOption = options.find((o) => o.value === value);

  function handleSelect(optionValue: string) {
    onChange(optionValue);
    setOpen(false);
    setQuery("");
  }

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] px-3 py-2 text-start text-sm text-[var(--ink-primary)] focus:border-[var(--signal)] focus:outline-none focus:ring-2 focus:ring-[var(--synapse)]/30 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className={selectedOption ? "" : "text-[var(--ink-tertiary)]"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className="flex shrink-0 items-center gap-1">
          {selectedOption && (
            <span
              role="button"
              tabIndex={-1}
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
              className="text-[var(--ink-tertiary)] hover:text-[var(--error)]"
              aria-label="Clear"
            >
              <X size={14} />
            </span>
          )}
          <ChevronDown size={14} className="text-[var(--ink-tertiary)]" />
        </span>
      </button>

      {open && !disabled && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="absolute z-20 mt-1 w-full rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] shadow-[var(--elevation-1)]">
            <div className="relative border-b border-[var(--hairline)] p-2">
              <Search
                size={14}
                className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-[var(--ink-tertiary)]"
              />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full rounded-[8px] bg-[var(--sunken)] py-1.5 ps-8 pe-2 text-sm text-[var(--ink-primary)] placeholder:text-[var(--ink-tertiary)] focus:outline-none"
              />
            </div>
            <div role="listbox" className="max-h-56 overflow-y-auto py-1">
              {visibleOptions.length === 0 ? (
                <p className="px-3 py-4 text-center text-sm text-[var(--ink-tertiary)]">
                  {emptyResultsLabel}
                </p>
              ) : (
                visibleOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={option.value === value}
                    onClick={() => handleSelect(option.value)}
                    className="flex w-full flex-col items-start px-3 py-2 text-start text-sm hover:bg-[var(--sunken)]"
                  >
                    <span className="text-[var(--ink-primary)]">{option.label}</span>
                    {option.secondaryLabel && (
                      <span className="font-mono text-xs text-[var(--ink-tertiary)]">
                        {option.secondaryLabel}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
