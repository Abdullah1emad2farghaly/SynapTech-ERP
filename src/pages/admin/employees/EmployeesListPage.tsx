// Project path: src/pages/admin/employees/EmployeesListPage.tsx
//
// Owns all local UI state (search/filters/pagination/which action menu or
// drawer is open) and wires hooks to presentation components — per the
// project's page-vs-component separation rule. Search/filter/sort/pagination
// are all client-side over the full fetched list (no confirmed query-param
// contract on GET /api/Employees), same precedent as Suppliers/Departments.
//
// Department/branch name lookups reuse the project's EXISTING
// useDepartments()/useBranches() lookup hooks built for Users' dropdowns
// (see project handoff doc, Section 5.2/8) — already return
// `{ value, label }[]`, consumed here as-is, nothing new created.
// Role options for Grant Access still reuse the same unconfirmed
// GET /api/Roles gap already flagged for the Roles module — swap in the
// real roles hook once confirmed.

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { useEmployeesList } from "../../../hooks/useEmployees";
import { useBranches } from "../../../hooks/useBranches";
import { useDepartments } from "../../../hooks/useDepartments";
import { EmployeesKpiRow } from "../../../components/admin/employees/EmployeesKpiRow";
import {
  EmployeesFiltersBar,
  type EmployeesFilters,
} from "../../../components/admin/employees/EmployeesFiltersBar";
import { EmployeesDataTable } from "../../../components/admin/employees/EmployeesDataTable";
import { EmployeeActionMenu } from "../../../components/admin/employees/EmployeeActionMenu";
import { GrantAccessDrawer } from "../../../components/admin/employees/GrantAccessDrawer";
import type { EmployeeResponse } from "../../../types/employee.types";
import { useRoles } from "@/hooks/useRoles";
import { MultiSelectOption } from "@/components/common/MultiSelectSearchable";

// ASSUMPTION — Roles hook path unverified (see Roles module's own
// unconfirmed GET /api/Roles gap):
// import { useRoles } from "../../../hooks/useRoles";

const PAGE_SIZE = 10;
const DEFAULT_FILTERS: EmployeesFilters = {
  search: "",
  status: "",
  departmentId: "",
  branchId: "",
  jobTitle: "",
  access: "all",
};

function formatSalary(value: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string | null) {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function EmployeesListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: employees = [], isLoading, isError, refetch } = useEmployeesList();

  // Existing lookup hooks — reused as-is, not recreated.
  const { data: departmentOptions = [] } = useDepartments();
  const { data: branchOptions = [] } = useBranches();

  // ASSUMPTION: role options still pending the unconfirmed GET /api/Roles
  // endpoint (see Roles module notes) — swap in the real useRoles() hook
  // once that's resolved.
  const {data: roleOptions = []} = useRoles()
  
    const options: MultiSelectOption[] = roleOptions.map((opt) => {
      return {
        value: opt.id,
        label: opt.name
      }
      
    })

  const departmentNames = useMemo(
    () => Object.fromEntries(departmentOptions.map((o) => [o.value, o.label])),
    [departmentOptions]
  );
  const branchNames = useMemo(
    () => Object.fromEntries(branchOptions.map((o) => [o.value, o.label])),
    [branchOptions]
  );

  const [filters, setFilters] = useState<EmployeesFilters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [actionMenuEmployee, setActionMenuEmployee] = useState<EmployeeResponse | null>(null);
  const [grantAccessEmployee, setGrantAccessEmployee] = useState<EmployeeResponse | null>(null);

  console.log(grantAccessEmployee)
  const jobTitleOptions = useMemo(() => {
    const titles = new Set<string>();
    employees.forEach((e) => e.jobTitle && titles.add(e.jobTitle));
    return Array.from(titles)
      .sort()
      .map((title) => ({ value: title, label: title }));
  }, [employees]);

  const statusOptions = useMemo(() => {
    const statuses = new Set<string>();
    employees.forEach((e) => e.status && statuses.add(e.status));
    return Array.from(statuses)
      .sort()
      .map((s) => ({ value: s, label: s }));
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    const term = filters.search.trim().toLowerCase();
    return employees.filter((e) => {
      if (term) {
        const haystack = [e.fullName, e.employeeCode, e.email, e.phone]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      if (filters.status && e.status !== filters.status) return false;
      if (filters.departmentId && e.departmentId !== filters.departmentId) return false;
      if (filters.branchId && e.branchId !== filters.branchId) return false;
      if (filters.jobTitle && e.jobTitle !== filters.jobTitle) return false;
      if (filters.access === "with" && !e.userId) return false;
      if (filters.access === "without" && e.userId) return false;
      return true;
    });
  }, [employees, filters]);

  const paginatedEmployees = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredEmployees.slice(start, start + PAGE_SIZE);
  }, [filteredEmployees, page]);

  const isOrgEmpty = !isLoading && !isError && employees.length === 0;

  return (
    <div className="flex flex-col gap-6 md:px-6 px-2 py-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[32px] font-bold text-[var(--ink-primary)]">
            {t("employees.pageTitle", "Employees")}
          </h1>
          <p className="mt-1 max-w-xl text-sm text-[var(--ink-secondary)]">
            {t(
              "employees.pageDescription",
              "Manage your organization's workforce, employee information, organizational structure, and system access."
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("create")}
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-md bg-[var(--signal)] px-4 text-sm font-medium text-white hover:bg-[var(--signal-hover)]"
        >
          <Plus size={16} aria-hidden="true" />
          {t("employees.addEmployee", "Add Employee")}
        </button>
      </div>

      {!isOrgEmpty && (
        <>
          <EmployeesKpiRow employees={employees} isLoading={isLoading} />

          <EmployeesFiltersBar
            filters={filters}
            onChange={(next) => {
              setFilters(next);
              setPage(1);
            }}
            statusOptions={statusOptions}
            departmentOptions={departmentOptions}
            branchOptions={branchOptions}
            jobTitleOptions={jobTitleOptions}
          />
        </>
      )}

      {isError && (
        <div className="flex flex-col items-center rounded-lg border border-[var(--hairline)] bg-[var(--panel)] py-14 text-center">
          <p className="text-base font-semibold text-[var(--ink-primary)]">
            {t("common.errors.title", "Something went wrong")}
          </p>
          <p className="mt-1 text-sm text-[var(--ink-tertiary)]">
            {t("employees.errors.loadFailed", "We couldn't load employees right now.")}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 h-9 rounded-md border border-[var(--hairline)] px-4 text-sm font-medium text-[var(--ink-primary)] hover:bg-[var(--sunken)]"
          >
            {t("common.tryAgain", "Try Again")}
          </button>
        </div>
      )}

      {isOrgEmpty && (
        <div className="flex flex-col items-center rounded-lg border border-dashed border-[var(--hairline)] bg-[var(--panel)] py-16 text-center">
          <h3 className="text-base font-semibold text-[var(--ink-primary)]">
            {t("employees.empty.noneYetTitle", "No employees yet")}
          </h3>
          <p className="mt-1 max-w-sm text-sm text-[var(--ink-tertiary)]">
            {t(
              "employees.empty.noneYetBody",
              "Start building your workforce by adding your first employee."
            )}
          </p>
          <button
            type="button"
            onClick={() => navigate("create")}
            className="mt-5 inline-flex h-10 items-center gap-2 rounded-md bg-[var(--signal)] px-4 text-sm font-medium text-white hover:bg-[var(--signal-hover)]"
          >
            <Plus size={16} aria-hidden="true" />
            {t("employees.addEmployee", "Add Employee")}
          </button>
        </div>
      )}

      {!isError && !isOrgEmpty && (
        <div className="relative">
          <EmployeesDataTable
            rows={paginatedEmployees}
            isLoading={isLoading}
            page={page}
            pageSize={PAGE_SIZE}
            totalRows={filteredEmployees.length}
            onPageChange={setPage}
            departmentNames={departmentNames}
            branchNames={branchNames}
            onGrantAccess={setGrantAccessEmployee}
            formatSalary={formatSalary}
            formatDate={formatDate}
          />

          {actionMenuEmployee && (
            <EmployeeActionMenu
              employee={actionMenuEmployee}
              // open={Boolean(actionMenuEmployee)}
              // onClose={() => setActionMenuEmployee(null)}
              onGrantAccess={setGrantAccessEmployee}
            />
          )}
        </div>
      )}

      <GrantAccessDrawer
        open={Boolean(grantAccessEmployee)}
        onClose={() => setGrantAccessEmployee(null)}
        employee={grantAccessEmployee}
        roleOptions={options}
      />
    </div>
  );
}
