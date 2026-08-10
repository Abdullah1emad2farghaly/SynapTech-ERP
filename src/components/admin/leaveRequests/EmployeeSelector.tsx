// Intended path: src/components/admin/leaveRequests/EmployeeSelector.tsx
//
// ASSUMPTION: reuses the existing Employees module's lookup hook, per this project's
// anti-duplication rule ("if an existing Employees module/hook exists, reuse it instead
// of creating duplicate employee-management functionality"). Import path assumed as
// `hooks/useEmployees` exporting `useEmployees()` (the alias already established for
// useEmployeesList() per Module 10's employee-manager-picker revision) — verify this
// export exists and returns { id, fullName }-shaped records before wiring in.
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Avatar } from "../../common/Avatar";
import { useEmployees } from "../../../hooks/useEmployees";

interface EmployeeSelectorProps {
  value: string;
  onChange: (employeeId: string) => void;
  className?: string;
  error?: string;
  /** Locks the field to a single employee — for the My Leave Requests self-service
   *  Create flow once auth/session context can resolve the current employee's id.
   *  See leave-requests-ux-spec.md Section 17, open question #1 — not wired yet. */
  lockedEmployeeId?: string;
}

export function EmployeeSelector({
  value,
  onChange,
  className = "",
  error,
  lockedEmployeeId,
}: EmployeeSelectorProps) {
  const { t } = useTranslation();
  const { data: employees, isLoading } = useEmployees();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = useMemo(
    () => employees?.find((employee) => employee.id === value),
    [employees, value]
  );

  
  const filtered = useMemo(() => {
    if (!employees) return [];
    if (!query.trim()) return employees;
    const lower = query.toLowerCase();
    return employees?.filter((employee) => employee?.fullName?.toLowerCase()?.includes(lower));
  }, [employees, query]);

  if (lockedEmployeeId) {
    const locked = employees?.find((employee) => employee.id === lockedEmployeeId);
    return (
      <div
        className={`flex items-center gap-2 rounded-md px-3 py-2 ${className}`}
        style={{ backgroundColor: "var(--sunken)", border: "1px solid var(--hairline)" }}
      >
        {locked && <Avatar name={locked.fullName || ""} size="sm" />}
        <span className="text-sm" style={{ color: "var(--ink-primary)" }}>
          {locked?.fullName ?? t("leaveRequests.form.you")}
        </span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm text-start"
        style={{
          backgroundColor: "var(--sunken)",
          border: `1px solid ${error ? "var(--error)" : "var(--hairline)"}`,
          color: selected ? "var(--ink-primary)" : "var(--ink-tertiary)",
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {selected && <Avatar name={selected.fullName || ""} size="xs" />}
        <span className="truncate">
          {selected ? selected.fullName : t("leaveRequests.form.employeePlaceholder")}
        </span>
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
              placeholder={t("leaveRequests.form.employeeSearchPlaceholder")}
              className="w-full bg-transparent text-sm outline-none"
              style={{ color: "var(--ink-primary)" }}
            />
          </div>
          <ul role="listbox" className="max-h-60 overflow-y-auto py-1">
            {isLoading && (
              <li className="px-3 py-2 text-sm" style={{ color: "var(--ink-tertiary)" }}>
                {t("common.loading")}
              </li>
            )}
            {!isLoading &&
              filtered.map((employee) => (
                <li key={employee.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={employee.id === value}
                    onClick={() => {
                      onChange(employee.id);
                      setIsOpen(false);
                      setQuery("");
                    }}
                    className="w-full flex items-center gap-2 text-start px-3 py-2 text-sm hover:opacity-80"
                    style={{
                      color: "var(--ink-primary)",
                      backgroundColor: employee.id === value ? "var(--sunken)" : "transparent",
                    }}
                  >
                    <Avatar name={employee.fullName || ""} size="xs" />
                    {employee.fullName}
                  </button>
                </li>
              ))}
            {!isLoading && filtered.length === 0 && (
              <li className="px-3 py-2 text-sm" style={{ color: "var(--ink-tertiary)" }}>
                {t("leaveRequests.form.employeeNoResults")}
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
