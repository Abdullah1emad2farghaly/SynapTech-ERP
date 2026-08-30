// Project path: src/components/admin/purchase-orders/SearchableEntitySelect.tsx

import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, Search, Check } from "lucide-react";

interface EntityOption {
  id: string;
  name: string;
}

interface SearchableEntitySelectProps {
  options: EntityOption[];
  value: string;
  onChange: (id: string) => void;
  placeholder: string;
  searchPlaceholder: string;
  noResultsLabel: string;
  isLoading?: boolean;
  hasError?: boolean;
  button?: ReactNode;
  
}

export function SearchableEntitySelect({
  options,
  value,
  onChange,
  placeholder,
  searchPlaceholder,
  noResultsLabel,
  isLoading,
  hasError,
  button,
}: SearchableEntitySelectProps) {
  const { t } = useTranslation();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.id === value);

  const filtered = useMemo(() => {
    if (!query.trim()) return options;

    const q = query.trim().toLowerCase();

    return options.filter((o) =>
      o.name.toLowerCase().includes(q)
    );
  }, [options, query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        setQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((o) => !o)}
        disabled={isLoading}
        className={`flex w-full items-center justify-between rounded-md border bg-[--sunken] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[--synapse]/30 ${hasError
            ? "border-[--error]"
            : "border-[--hairline] focus:border-[--signal]"
          }`}
      >
        <span
          className={
            selected
              ? "text-[--ink-primary]"
              : "text-[--ink-tertiary]"
          }
        >
          {isLoading
            ? t("common.status.loading")
            : selected?.name ?? placeholder}
        </span>

        <ChevronDown
          size={16}
          className="text-[--ink-tertiary]"
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute z-10 mt-1 w-full overflow-hidden rounded-md border border-[--hairline] bg-[--panel] shadow-[var(--elevation-1)]"
        >
          <div className="relative border-b border-[--hairline] p-2">
            <Search
              size={14}
              className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-[--ink-tertiary]"
            />

            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full rounded-md bg-[--sunken] py-1.5 ps-8 pe-2 text-sm outline-none"
            />
          </div>

          <ul className="max-h-52 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-[--ink-tertiary]">
                {noResultsLabel}
              </li>
            ) : (
              filtered.map((option) => (
                <li key={option.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={option.id === value}
                    onClick={() => {
                      onChange(option.id);
                      setOpen(false);
                      setQuery("");
                    }}
                    className="flex w-full items-center justify-between px-3 py-2 text-start text-sm text-[--ink-primary] hover:bg-[--sunken]"
                  >
                    {option.name}

                    {option.id === value && (
                      <Check
                        size={14}
                        className="text-[--signal]"
                      />
                    )}
                  </button>
                </li>
              ))
            )}

          </ul>
            {button && (
              <div className="shrink-0 border-t border-[--hairline] bg-[--panel] p-2">
                {button}
              </div>
            )}
        </div>
      )}
    </div>
  );
}