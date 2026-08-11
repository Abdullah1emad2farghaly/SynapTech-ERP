// Project path: src/pages/admin/employees/EditEmployeePage.tsx
//
// Route: /employees/:id/edit. employeeCode is never included in the update
// payload — UpdateEmployeeRequest has no such field (enforced by
// UpdateEmployeeSchema already omitting it; EmployeeForm renders it
// read-only in edit mode).
//
// Per the module's integration rules: Branch options reuse the project's
// existing useBranches() lookup hook. Department options reuse the existing
// full useDepartmentsList() CRUD hook (not the plain lookup) so branchId is
// available for Branch↔Department cross-filtering — see EmployeeForm.tsx's
// header comment (a department has exactly one owning branch). Manager
// options reuse the existing useEmployees() hook — Manager IS an Employee,
// not a separate entity. Nothing new is created for any of these.
//
// CRITICAL BUSINESS RULE: an employee must never be selectable as their own
// manager. The current employee's id is filtered out of managerOptions
// before it ever reaches the form/selector.

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import { EmployeeForm } from "../../../components/admin/employees/EmployeeForm";
import { useEmployee, useUpdateEmployee, useEmployees } from "../../../hooks/useEmployees";
import { useBranches } from "../../../hooks/useBranches";
import { useDepartmentsList } from "../../../hooks/useDepartments.crud";
import type { UpdateEmployeeFormValues } from "../../../schemas/employee.schema";

export function EditEmployeePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: employee, isLoading, isError } = useEmployee(id);
  const updateEmployee = useUpdateEmployee();

  // Existing lookup hook — reused as-is, not recreated.
  const { data: branchOptions = [], isLoading: branchesLoading } = useBranches();

  // Existing full Departments CRUD hook — reused for its branchId field.
  const { data: departments = [], isLoading: departmentsLoading } = useDepartmentsList();
  const departmentOptions = useMemo(
    () =>
      departments.map((d) => ({
        value: d.id,
        label: d.name,
        branchId: d.branchId,
      })),
    [departments]
  );

  // Manager is an Employee — sourced from the existing full Employees list.
  // The current employee is excluded so they can never select themselves
  // as their own manager.
  const { data: employees = [], isLoading: employeesLoading } = useEmployees();
  const managerOptions = useMemo(
    () =>
      employees
        .filter((e) => e.id !== id)
        .map((e) => ({
          value: e.id,
          label: e.fullName?.trim() || e.employeeCode || e.id,
        })),
    [employees, id]
  );

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <div className="h-8 w-40 animate-pulse rounded bg-[var(--sunken)]" />
        <div className="mt-6 h-96 animate-pulse rounded-lg bg-[var(--sunken)]" />
      </div>
    );
  }

  if (isError || !employee) {
    return (
      <div className="flex flex-col items-center p-14 text-center">
        <p className="text-base font-semibold text-[var(--ink-primary)]">
          {t("common.errors.title", "Something went wrong")}
        </p>
        <p className="mt-1 text-sm text-[var(--ink-tertiary)]">
          {t("employees.errors.loadFailed", "We couldn't load this employee right now.")}
        </p>
      </div>
    );
  }

  const handleSubmit = async (values: UpdateEmployeeFormValues) => {
    try {
      await updateEmployee.mutateAsync({
        id: employee.id,
        payload: {
          fullName: values.fullName || null,
          nationalId: values.nationalId || null,
          dateOfBirth: values.dateOfBirth || null,
          jobTitle: values.jobTitle || null,
          departmentId: values.departmentId || null,
          branchId: values.branchId || null,
          managerId: values.managerId || null,
          baseSalary: values.baseSalary,
          email: values.email || null,
          phone: values.phone || null,
          address: values.address || null,
          status: values.status || null,
        },
      });
      toast.success(t("employees.toast.updated", "Employee updated"));
      navigate(`/hr/employees/${employee.id}`);
    } catch {
      toast.error(t("common.errors.actionFailed", "Something went wrong. Please try again."));
    }
  };

  return (
    <div className="mx-auto flex flex-col gap-6 md:px-6 px-2 py-6">
      <button
        type="button"
        onClick={() => navigate(`/hr/employees/${employee.id}`)}
        className="inline-flex w-fit items-center gap-1.5 text-sm text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        {t("common.back", "Back")}
      </button>

      <div>
        <h1 className="text-2xl font-bold text-[var(--ink-primary)]">
          {t("employees.editEmployee", "Edit Employee")}
        </h1>
      </div>

      <EmployeeForm
        mode="edit"
        employee={employee}
        departmentOptions={departmentOptions}
        branchOptions={branchOptions}
        managerOptions={managerOptions}
        managerOptionsLoading={employeesLoading}
        departmentOptionsLoading={departmentsLoading}
        branchOptionsLoading={branchesLoading}
        isSubmitting={updateEmployee.isPending}
        onCancel={() => navigate(`/hr/employees`)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
