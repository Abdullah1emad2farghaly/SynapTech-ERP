// Project path: src/pages/admin/employees/CreateEmployeePage.tsx
//
// Route: /employees/create. userId is deliberately never sent on create —
// linking an existing account is the separate Grant Access action, done
// after the employee record exists (needs a real employee id in the URL).
//
// Per the module's integration rules: Branch options come from the
// project's EXISTING lookup hook (useBranches — the one built for Users'
// dropdowns, returns { value, label }[]). Department options come from the
// EXISTING full useDepartmentsList() CRUD hook instead of the lookup-only
// useDepartments() — the plain lookup strips branchId, and branchId is
// required here to drive Branch↔Department cross-filtering (see
// EmployeeForm.tsx's header comment: a department has exactly one owning
// branch). Nothing new is created for either — both hooks already exist and
// are reused as-is. Manager options come from the existing useEmployees()
// hook — Manager IS an Employee, so there is no separate manager entity or
// lookup to build. On Create, no employee id exists yet, so every existing
// employee is a valid manager candidate (no self-exclusion needed here).

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import { EmployeeForm } from "../../../components/admin/employees/EmployeeForm";
import { useCreateEmployee, useEmployees } from "../../../hooks/useEmployees";
import { useBranches } from "../../../hooks/useBranches";
import { useDepartmentsList } from "../../../hooks/useDepartments.crud";
import type { CreateEmployeeFormValues } from "../../../schemas/employee.schema";
import axios from "axios";

export function CreateEmployeePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const createEmployee = useCreateEmployee();

  // Existing lookup hook — reused as-is, not recreated.
  const { data: branchOptions = [], isLoading: branchesLoading } = useBranches();

  // Existing full Departments CRUD hook — reused for its branchId field,
  // which the plain lookup hook doesn't carry. Mapped to the
  // { value, label, branchId } shape EmployeeForm needs for filtering.
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

  // Manager is an Employee — sourced from the existing full Employees list,
  // not a separate manager/lookup service.
  const { data: employees = [], isLoading: employeesLoading } = useEmployees();
  const managerOptions = useMemo(
    () =>
      employees.map((e) => ({
        value: e.id,
        label: e.fullName?.trim() || e.employeeCode || e.id,
      })),
    [employees]
  );

  const handleSubmit = async (values: CreateEmployeeFormValues) => {
    console.log("CreateEmployeePage.handleSubmit", values);
    // return
    try {
      
      const created = await createEmployee.mutateAsync({
        employeeCode: values.employeeCode || null,
        fullName: values.fullName || null,
        nationalId: values.nationalId || null,
        dateOfBirth: values.dateOfBirth || null,
        hireDate: values.hireDate,
        jobTitle: values.jobTitle || null,
        departmentId: values.departmentId || null,
        branchId: values.branchId || null,
        managerId: values.managerId || null,
        baseSalary: values.baseSalary,
        email: values.email || null,
        phone: values.phone || null,
        address: values.address || null,
        userId: null,
      });
      toast.success(t("employees.toast.created", "Employee created"));
      navigate(`/employees/${created.id}`);
    } catch (error) {
      if(axios.isAxiosError(error)){
        console.log("Axios error", error.response?.data);
      }
      toast.error(t("common.errors.actionFailed", "Something went wrong. Please try again."));
    }
  };

  return (
    <div className="mx-auto flex flex-col gap-6 md:px-6 px-2 py-6">
      <button
        type="button"
        onClick={() => navigate("/employees")}
        className="inline-flex w-fit items-center gap-1.5 text-sm text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        {t("common.back", "Back")}
      </button>

      <div>
        <h1 className="text-2xl font-bold text-[var(--ink-primary)]">
          {t("employees.addEmployee", "Add Employee")}
        </h1>
      </div>

      <EmployeeForm
        mode="create"
        departmentOptions={departmentOptions}
        branchOptions={branchOptions}
        managerOptions={managerOptions}
        managerOptionsLoading={employeesLoading}
        departmentOptionsLoading={departmentsLoading}
        branchOptionsLoading={branchesLoading}
        isSubmitting={createEmployee.isPending}
        onCancel={() => navigate("/hr/employees")}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
