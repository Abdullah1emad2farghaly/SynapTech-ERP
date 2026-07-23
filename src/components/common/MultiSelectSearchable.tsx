// src/components/common/MultiSelectSearchable.tsx
//
// Generic, presentation-only searchable checkbox multi-select. Built once
// here so both CreateUserDrawer (Roles field) and RoleAssignmentDrawer
// reuse the same interaction instead of two different role-picking
// patterns. No business logic — options and selection are fully
// controlled by the caller.

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";

export interface MultiSelectOption {
  value: string;
  /** Already-translated label. */
  label: string;
}

export interface MultiSelectSearchableProps {
  options: MultiSelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  searchPlaceholder: string;
  /** Shown above the list as removable chips summarizing the current selection. */
  showSelectedSummary?: boolean;
  emptyResultsLabel?: string;
  className?: string;
}

export function MultiSelectSearchable({
  options,
  selected,
  onChange,
  searchPlaceholder,
  showSelectedSummary = true,
  emptyResultsLabel = "No results",
  className = "",
}: MultiSelectSearchableProps) {
  const [query, setQuery] = useState("");

  const filteredOptions = useMemo(() => {
    if (!query.trim()) return options;
    const q = query.trim().toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  const selectedOptions = useMemo(
    () => options.filter((o) => selected.includes(o.value)),
    [options, selected],
  );

  function toggle(value: string) {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  }

  function remove(value: string) {
    onChange(selected.filter((v) => v !== value));
  }

  return (
    <div className={className}>
      {showSelectedSummary && selectedOptions.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {selectedOptions.map((option) => (
            <span
              key={option.value}
              className="inline-flex items-center gap-1 rounded-[6px] bg-[var(--sunken)] px-2 py-1 text-xs font-medium text-[var(--ink-primary)]"
            >
              {option.label}
              <button
                type="button"
                onClick={() => remove(option.value)}
                aria-label={`Remove ${option.label}`}
                className="text-[var(--ink-tertiary)] hover:text-[var(--error)]"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative mb-2">
        <Search
          size={15}
          className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[var(--ink-tertiary)]"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] py-2 ps-9 pe-3 text-sm text-[var(--ink-primary)] placeholder:text-[var(--ink-tertiary)] focus:border-[var(--signal)] focus:outline-none focus:ring-2 focus:ring-[var(--synapse)]/30"
        />
      </div>

      <div
        role="listbox"
        aria-multiselectable="true"
        className="max-h-56 overflow-y-auto rounded-[10px] border border-[var(--hairline)]"
      >
        {filteredOptions.length === 0 ? (
          <p className="px-3 py-4 text-center text-sm text-[var(--ink-tertiary)]">
            {emptyResultsLabel}
          </p>
        ) : (
          filteredOptions.map((option) => {
            const isChecked = selected.includes(option.value);
            return (
              <label
                key={option.value}
                role="option"
                aria-selected={isChecked}
                className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-[var(--ink-primary)] hover:bg-[var(--sunken)]"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggle(option.value)}
                  className="h-4 w-4 rounded-[4px] border-[var(--hairline)]"
                />
                {option.label}
              </label>
            );
          })
        )}
      </div>
    </div>
  );
}
