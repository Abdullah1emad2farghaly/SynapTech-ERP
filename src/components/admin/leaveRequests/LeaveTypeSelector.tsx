// Intended path: src/components/admin/leaveRequests/LeaveTypeSelector.tsx
//
// Single-select searchable dropdown over the frontend-owned LEAVE_TYPE_OPTIONS list
// (see constants/leaveTypes.ts). Not MultiSelectSearchable (this is single-select) —
// a lighter, purpose-built dropdown reusing this project's existing select styling.

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { getLeaveTypeOption, LEAVE_TYPE_OPTIONS } from "../../../constants/leaveTypes";

interface LeaveTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  error?: string;
}

export function LeaveTypeSelector({ value, onChange, className = "", error }: LeaveTypeSelectorProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = getLeaveTypeOption(value);

  const filteredOptions = useMemo(() => {
    if (!query.trim()) return LEAVE_TYPE_OPTIONS;
    const lower = query.toLowerCase();
    return LEAVE_TYPE_OPTIONS.filter((option) => t(option.labelKey).toLowerCase().includes(lower));
  }, [query, t]);

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="w-full flex items-center justify-between rounded-md px-3 py-2 text-sm text-start"
        style={{
          backgroundColor: "var(--sunken)",
          border: `1px solid ${error ? "var(--error)" : "var(--hairline)"}`,
          color: selected ? "var(--ink-primary)" : "var(--ink-tertiary)",
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {selected ? t(selected.labelKey) : t("leaveRequests.form.leaveTypePlaceholder")}
      </button>

      {isOpen && (
        <div
          className="absolute z-20 mt-1 w-full rounded-md shadow-lg overflow-hidden"
          style={{ backgroundColor: "var(--panel)", border: "1px solid var(--hairline)" }}
        >
          <div className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: "1px solid var(--hairline)" }}>
            <Search size={14} style={{ color: "var(--ink-tertiary)" }} />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("leaveRequests.form.leaveTypeSearchPlaceholder")}
              className="w-full bg-transparent text-sm outline-none"
              style={{ color: "var(--ink-primary)" }}
            />
          </div>
          <ul role="listbox" className="max-h-56 overflow-y-auto py-1">
            {filteredOptions.map((option) => (
              <li key={option.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={option.value === value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                    setQuery("");
                  }}
                  className="w-full text-start px-3 py-2 text-sm hover:opacity-80"
                  style={{
                    color: "var(--ink-primary)",
                    backgroundColor: option.value === value ? "var(--sunken)" : "transparent",
                  }}
                >
                  {t(option.labelKey)}
                </button>
              </li>
            ))}
            {filteredOptions.length === 0 && (
              <li className="px-3 py-2 text-sm" style={{ color: "var(--ink-tertiary)" }}>
                {t("leaveRequests.form.leaveTypeNoResults")}
              </li>
            )}
          </ul>
        </div>
      )}

      {error && (
        <p className="mt-1 text-xs" style={{ color: "var(--error)" }}>
          {t(error)}
        </p>
      )}
    </div>
  );
}
