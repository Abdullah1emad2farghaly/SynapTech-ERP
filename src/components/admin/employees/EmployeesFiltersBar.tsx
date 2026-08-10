// Project path: src/components/admin/employees/EmployeesFiltersBar.tsx
//
// Presentation-only, per the project's component rule — all filter state
// lives in EmployeesListPage and is passed down. Reuses the shared Drawer
// shell for the mobile filter sheet rather than inventing a new bottom-sheet
// primitive (Drawer already handles RTL-aware slide direction).
//
// Job Title filter is a free-text-derived select built from the distinct
// job titles present in the currently loaded employee list (no separate job
// titles endpoint exists) — same "derive from loaded data" approach as the
// Departments-count KPI.

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Drawer } from "../../common/Drawer";

export interface EmployeesFilters {
  search: string;
  status: string;
  departmentId: string;
  branchId: string;
  jobTitle: string;
  access: "all" | "with" | "without";
}

interface Option {
  value: string;
  label: string;
}

interface EmployeesFiltersBarProps {
  filters: EmployeesFilters;
  onChange: (filters: EmployeesFilters) => void;
  statusOptions: Option[];
  departmentOptions: Option[];
  branchOptions: Option[];
  jobTitleOptions: Option[];
}

export function EmployeesFiltersBar({
  filters,
  onChange,
  statusOptions,
  departmentOptions,
  branchOptions,
  jobTitleOptions,
}: EmployeesFiltersBarProps) {
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeCount = [
    filters.status,
    filters.departmentId,
    filters.branchId,
    filters.jobTitle,
    filters.access !== "all" ? filters.access : "",
  ].filter(Boolean).length;

  const update = (patch: Partial<EmployeesFilters>) => onChange({ ...filters, ...patch });

  const clearAll = () =>
    onChange({
      search: filters.search,
      status: "",
      departmentId: "",
      branchId: "",
      jobTitle: "",
      access: "all",
    });

  const selectClass =
    "h-10 rounded-md border border-[var(--hairline)] bg-[var(--panel)] px-3 text-sm text-[var(--ink-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--synapse)]";

  const filterControls = (
    <>
      <select
        value={filters.status}
        onChange={(e) => update({ status: e.target.value })}
        className={selectClass}
        aria-label={t("employees.filters.status", "Status")}
      >
        <option value="">{t("employees.filters.status", "Status")}</option>
        {statusOptions.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <select
        value={filters.departmentId}
        onChange={(e) => update({ departmentId: e.target.value })}
        className={selectClass}
        aria-label={t("employees.filters.department", "Department")}
      >
        <option value="">{t("employees.filters.department", "Department")}</option>
        {departmentOptions.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <select
        value={filters.branchId}
        onChange={(e) => update({ branchId: e.target.value })}
        className={selectClass}
        aria-label={t("employees.filters.branch", "Branch")}
      >
        <option value="">{t("employees.filters.branch", "Branch")}</option>
        {branchOptions.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <select
        value={filters.jobTitle}
        onChange={(e) => update({ jobTitle: e.target.value })}
        className={selectClass}
        aria-label={t("employees.filters.jobTitle", "Job Title")}
      >
        <option value="">{t("employees.filters.jobTitle", "Job Title")}</option>
        {jobTitleOptions.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <select
        value={filters.access}
        onChange={(e) => update({ access: e.target.value as EmployeesFilters["access"] })}
        className={selectClass}
        aria-label={t("employees.filters.access", "System access")}
      >
        <option value="all">{t("employees.filters.accessAll", "All access states")}</option>
        <option value="with">{t("employees.filters.accessWith", "With access")}</option>
        <option value="without">{t("employees.filters.accessWithout", "No access")}</option>
      </select>

      {activeCount > 0 && (
        <button
          type="button"
          onClick={clearAll}
          className="inline-flex h-10 items-center gap-1.5 rounded-md px-3 text-sm text-[var(--ink-secondary)] hover:bg-[var(--sunken)]"
        >
          <X size={14} aria-hidden="true" />
          {t("common.clearFilters", "Clear filters")}
        </button>
      )}
    </>
  );

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1 sm:max-w-sm">
        <Search
          size={16}
          className="pointer-events-none absolute inset-inline-start-3 top-1/2 -translate-y-1/2 text-[var(--ink-tertiary)]"
          aria-hidden="true"
        />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => update({ search: e.target.value })}
          placeholder={t(
            "employees.filters.searchPlaceholder",
            "Search by name, code, email, or phone"
          )}
          className="h-10 w-full rounded-md border border-[var(--hairline)] bg-[var(--panel)] ps-9 pe-3 text-sm text-[var(--ink-primary)] placeholder:text-[var(--ink-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--synapse)]"
        />
      </div>

      {/* Desktop/tablet: inline filter controls */}
      <div className="hidden flex-wrap items-center gap-2 md:flex">{filterControls}</div>

      {/* Mobile: filter drawer trigger */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[var(--hairline)] bg-[var(--panel)] px-3 text-sm text-[var(--ink-primary)] md:hidden"
      >
        <SlidersHorizontal size={16} aria-hidden="true" />
        {t("common.filters", "Filters")}
        {activeCount > 0 && (
          <span className="rounded-full bg-[var(--signal)] px-1.5 text-xs text-white">
            {activeCount}
          </span>
        )}
      </button>

      <Drawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        title={t("common.filters", "Filters")}
      >
        <div className="flex flex-col gap-3 p-4">{filterControls}</div>
      </Drawer>
    </div>
  );
}
