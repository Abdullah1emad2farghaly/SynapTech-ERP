// src/components/admin/attendance/EmployeeSelector.tsx

// ASSUMPTION: reuses the Employees module's existing lookup hook (useEmployeesLookup,
// from hooks/useEmployees.lookup.ts / services/api/employees.lookup.api.ts, built for the
// Manager select). Exact export name unverified — flagged here, same category as the
// project's other cross-module lookup assumptions.

import { useState, useMemo } from "react";
import { Search, ChevronDown, X } from "lucide-react";
import { useTranslation } from "react-i18next";
// import { useEmployeesLookup } from "../../../hooks/useEmployees"; // ASSUMPTION — verify export

interface EmployeeSelectorProps {
  value: string | null;
  onChange: (employeeId: string | null) => void;
  className?: string;
}

export function EmployeeSelector({ value, onChange, className = "" }: EmployeeSelectorProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  // ASSUMPTION shape: { data: { id, fullName, employeeCode }[], isLoading }
  const employeesLookup: { data?: { id: string; fullName: string | null; employeeCode: string | null }[]; isLoading?: boolean } = { data: [], isLoading: false };

  const filtered = useMemo(() => {
    const list = employeesLookup.data ?? [];
    if (!query) return list;
    const q = query.toLowerCase();
    return list.filter(
      (e) => e.fullName?.toLowerCase().includes(q) || e.employeeCode?.toLowerCase().includes(q)
    );
  }, [employeesLookup.data, query]);

  const selected = employeesLookup.data?.find((e) => e.id === value);

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--ink-primary)]"
      >
        <span className={selected ? "" : "text-[var(--ink-tertiary)]"}>
          {selected ? selected.fullName ?? selected.employeeCode : t("attendance.filters.employeePlaceholder")}
        </span>
        <span className="flex items-center gap-1">
          {value && (
            <X
              size={14}
              className="text-[var(--ink-tertiary)] hover:text-[var(--ink-primary)]"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
            />
          )}
          <ChevronDown size={14} className="text-[var(--ink-tertiary)]" />
        </span>
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-full rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] shadow-[var(--elevation-1)]">
          <div className="flex items-center gap-2 border-b border-[var(--hairline)] px-3 py-2">
            <Search size={14} className="text-[var(--ink-tertiary)]" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("attendance.filters.employeeSearchPlaceholder")}
              className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--ink-tertiary)]"
            />
          </div>
          <div className="max-h-56 overflow-y-auto py-1">
            {employeesLookup.isLoading && (
              <div className="px-3 py-2 text-sm text-[var(--ink-tertiary)]">{t("common.loading")}</div>
            )}
            {!employeesLookup.isLoading && filtered.length === 0 && (
              <div className="px-3 py-2 text-sm text-[var(--ink-tertiary)]">{t("attendance.filters.noEmployeesFound")}</div>
            )}
            {filtered.map((emp) => (
              <button
                key={emp.id}
                type="button"
                onClick={() => {
                  onChange(emp.id);
                  setOpen(false);
                  setQuery("");
                }}
                className="flex w-full flex-col items-start px-3 py-2 text-start hover:bg-[var(--sunken)]"
              >
                <span className="text-sm text-[var(--ink-primary)]">{emp.fullName ?? "—"}</span>
                <span className="text-xs text-[var(--ink-tertiary)]">{emp.employeeCode ?? "—"}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
