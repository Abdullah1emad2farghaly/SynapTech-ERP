

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
import { handleErrors } from "@/utils/HandleErrors";

export function CreateEmployeePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const createEmployee = useCreateEmployee();


  const { data: branchOptions = [], isLoading: branchesLoading } = useBranches();

 
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
      navigate(`/hr/employees/${created.id}`);
    } catch (error) {
      if(axios.isAxiosError(error)){
        handleErrors(error.response?.data.errors)
      }
    }
  };

  return (
    <div className="mx-auto flex flex-col gap-6 md:px-6 px-2 py-6">
      <button
        type="button"
        onClick={() => navigate("/hr/employees")}
        className="inline-flex w-fit items-center gap-1.5 text-sm text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        {t("common.back")}
      </button>

      <div>
        <h1 className="text-2xl font-bold text-[var(--ink-primary)]">
          {t("employees.addEmployee")}
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
