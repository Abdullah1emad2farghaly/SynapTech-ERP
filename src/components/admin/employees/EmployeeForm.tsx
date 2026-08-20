

import { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { TreeSelect } from "../../common/TreeSelect";
import {
  CreateEmployeeSchema,
  UpdateEmployeeSchema,
  type CreateEmployeeFormValues,
  type UpdateEmployeeFormValues,
} from "../../../schemas/employee.schema";
import type { EmployeeResponse } from "../../../types/employee.types";
import Optional from "@/components/common/Optional";

interface Option {
  value: string;
  label: string;
}

// Department options must carry their owning branch so the form can filter
// in both directions — plain branch options don't need the reverse link.
interface DepartmentOption extends Option {
  branchId: string | null;
}

interface EmployeeFormBaseProps {
  departmentOptions: DepartmentOption[];
  branchOptions: Option[];
  managerOptions: Option[];
  // Loading flags for the three EXISTING lookups this form consumes
  // (useDepartments/useBranches/useEmployees) — surfaced so the selectors
  // can show a loading state instead of an empty list while those queries
  // are in flight, per the project's existing loading-state conventions.
  departmentOptionsLoading?: boolean;
  branchOptionsLoading?: boolean;
  managerOptionsLoading?: boolean;
  isSubmitting?: boolean;
  onCancel: () => void;
}

interface CreateProps extends EmployeeFormBaseProps {
  mode: "create";
  onSubmit: (values: CreateEmployeeFormValues) => void;
}

interface EditProps extends EmployeeFormBaseProps {
  mode: "edit";
  employee: EmployeeResponse;
  onSubmit: (values: UpdateEmployeeFormValues) => void;
}

type EmployeeFormProps = CreateProps | EditProps;

const inputClass =
  "h-10 w-full rounded-md border border-[var(--hairline)] bg-[var(--panel)] px-3 text-sm text-[var(--ink-primary)] placeholder:text-[var(--ink-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--synapse)]";
const labelClass = "mb-1.5 block text-sm font-medium text-[var(--ink-secondary)]";
const errorClass = "mt-1 text-xs text-[var(--error)]";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-4 text-base font-semibold text-[var(--ink-primary)]">{children}</h3>
  );
}

export function EmployeeForm(props: EmployeeFormProps) {
  const { t } = useTranslation();
  const isEdit = props.mode === "edit";

  const form = useForm<CreateEmployeeFormValues | UpdateEmployeeFormValues>({
    resolver: zodResolver(isEdit ? UpdateEmployeeSchema : CreateEmployeeSchema),
    defaultValues: isEdit
      ? {
        fullName: props.employee.fullName ?? "",
        nationalId: props.employee.nationalId ?? "",
        dateOfBirth: props.employee.dateOfBirth ?? "",
        jobTitle: props.employee.jobTitle ?? "",
        departmentId: props.employee.departmentId ?? "",
        branchId: props.employee.branchId ?? "",
        managerId: props.employee.managerId ?? "",
        baseSalary: props.employee.baseSalary,
        email: props.employee.email ?? "",
        phone: props.employee.phone ?? "",
        address: props.employee.address ?? "",
        status: props.employee.status ?? "",
      }
      : {
        employeeCode: "",
        fullName: "",
        nationalId: "",
        dateOfBirth: "",
        hireDate: "",
        jobTitle: "",
        departmentId: "",
        branchId: "",
        managerId: "",
        baseSalary: 0,
        email: "",
        phone: "",
        address: "",
      },
  });

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const selectedBranchId = watch("branchId");
  const selectedDepartmentId = watch("departmentId");


  const visibleDepartmentOptions = useMemo(() => {
    if (!selectedBranchId) return props.departmentOptions;
    return props.departmentOptions.filter(
      (d) => !d.branchId || d.branchId === selectedBranchId
    );
  }, [props.departmentOptions, selectedBranchId]);

  
  const selectedDepartmentBranchId = useMemo(() => {
    const dept = props.departmentOptions.find((d) => d.value === selectedDepartmentId);
    return dept?.branchId ?? null;
  }, [props.departmentOptions, selectedDepartmentId]);

  const visibleBranchOptions = useMemo(() => {
    if (!selectedDepartmentId || !selectedDepartmentBranchId) return props.branchOptions;
    return props.branchOptions.filter((b) => b.value === selectedDepartmentBranchId);
  }, [props.branchOptions, selectedDepartmentId, selectedDepartmentBranchId]);

  
  useEffect(() => {
    if (selectedDepartmentBranchId && selectedDepartmentBranchId !== selectedBranchId) {
      setValue("branchId", selectedDepartmentBranchId, { shouldValidate: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDepartmentBranchId]);

  
  useEffect(() => {
    if (!selectedDepartmentId) return;
    const dept = props.departmentOptions.find((d) => d.value === selectedDepartmentId);
    if (dept?.branchId && selectedBranchId && dept.branchId !== selectedBranchId) {
      setValue("departmentId", "", { shouldValidate: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBranchId]);

  const managerTreeNodes = props.managerOptions.map((o) => ({
    id: o.value,
    label: o.label,
    parentId: null as string | null,
  }));

  const submitHandler = handleSubmit((values) => {
    if (props.mode === "create") {
      props.onSubmit(values as CreateEmployeeFormValues);
    } else {
      props.onSubmit(values as UpdateEmployeeFormValues);
    }
  });

  return (
    <div>

      <form onSubmit={submitHandler} >

        <div className="grid lg:grid-cols-2 gap-3">
          {/* Personal Information */}
          <section className="rounded-lg border  border-[var(--hairline)] bg-[var(--panel)] p-6">
            <SectionTitle>
              {t("employees.form.section.personal", "Personal Information")}
            </SectionTitle>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {/* Employee Code */}
              <div>
                <label className={labelClass}>
                  {t("employees.form.employeeCode", "Employee Code")}
                  <span className="ml-1 text-red-500">*</span>
                </label>

                {isEdit ? (
                  <div
                    className={`${inputClass} flex items-center bg-[var(--sunken)] font-mono text-[var(--ink-tertiary)]`}
                  >
                    {props.employee.employeeCode || "—"}
                  </div>
                ) : (
                  <>
                    <input
                      {...register("employeeCode" as keyof CreateEmployeeFormValues)}
                      className={inputClass}
                      placeholder={t(
                        "employees.form.employeeCodePlaceholder",
                        "Enter employee code"
                      )}
                    />

                    {"employeeCode" in errors && errors.employeeCode && (
                      <p className={errorClass}>
                        {errors.employeeCode.message as string}
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* Full Name */}
              <div>
                <label className={labelClass}>
                  {t("employees.form.fullName", "Full Name")}
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <input
                  {...register("fullName")}
                  className={inputClass}
                  placeholder={t(
                    "employees.form.fullNamePlaceholder",
                    "Enter full name"
                  )}
                />

                {errors.fullName && (
                  <p className={errorClass}>
                    {errors.fullName.message as string}
                  </p>
                )}
              </div>

              {/* National ID */}
              <div>
                <label className={labelClass}>
                  {t("employees.form.nationalId", "National ID")}
                  <Optional/>
                </label>

                <input
                  {...register("nationalId")}
                  className={inputClass}
                  placeholder={t(
                    "employees.form.nationalIdPlaceholder",
                    "Enter national ID"
                  )}
                />

                {errors.nationalId && (
                  <p className={errorClass}>
                    {errors.nationalId.message as string}
                  </p>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <label className={labelClass}>
                  {t("employees.form.dateOfBirth", "Date of Birth")}
                  <Optional/>
                </label>

                <input
                  type="date"
                  {...register("dateOfBirth")}
                  className={inputClass}
                />

                {errors.dateOfBirth && (
                  <p className={errorClass}>
                    {errors.dateOfBirth.message as string}
                  </p>
                )}
              </div>
            </div>
            {/* Contact Information */}
            <section className="mt-5">

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {/* Email */}
                <div>
                  <label className={labelClass}>
                    {t("employees.form.email", "Email")}
                    <Optional/>
                  </label>

                  <input
                    type="email"
                    {...register("email")}
                    className={inputClass}
                  />

                  {errors.email && (
                    <p className={errorClass}>
                      {errors.email.message as string}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className={labelClass}>
                    {t("employees.form.phone", "Phone")}
                    <Optional/>
                  </label>

                  <input
                    type="tel"
                    {...register("phone")}
                    className={inputClass}
                  />

                  {errors.phone && (
                    <p className={errorClass}>
                      {errors.phone.message as string}
                    </p>
                  )}
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label className={labelClass}>
                    {t("employees.form.address", "Address")}
                    <Optional/>
                  </label>

                  <textarea
                    {...register("address")}
                    rows={3}
                    className={`${inputClass} h-auto py-2`}
                  />

                  {errors.address && (
                    <p className={errorClass}>
                      {errors.address.message as string}
                    </p>
                  )}
                </div>
              </div>
            </section>
          </section>

          {/* Employment Information */}
          <section className="rounded-lg border border-[var(--hairline)] bg-[var(--panel)] p-6">
            <SectionTitle>
              {t(
                "employees.form.section.employment",
                "Employment Information"
              )}
            </SectionTitle>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {/* Job Title */}
              <div>
                <label className={labelClass}>
                  {t("employees.form.jobTitle", "Job Title")}
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <input
                  {...register("jobTitle")}
                  className={inputClass}
                  placeholder={t(
                    "employees.form.jobTitlePlaceholder",
                    "Enter job title"
                  )}
                />

                {errors.jobTitle && (
                  <p className={errorClass}>
                    {errors.jobTitle.message as string}
                  </p>
                )}
              </div>

              {/* Hire Date */}
              {!isEdit && (
                <div>
                  <label className={labelClass}>
                    {t("employees.form.hireDate", "Hire Date")}
                    <span className="ml-1 text-red-500">*</span>
                  </label>

                  <input
                    type="date"
                    {...register("hireDate" as keyof CreateEmployeeFormValues)}
                    className={inputClass}
                  />

                  {"hireDate" in errors && errors.hireDate && (
                    <p className={errorClass}>
                      {errors.hireDate.message as string}
                    </p>
                  )}
                </div>
              )}

              {/* Status - Edit Mode */}
              {isEdit && (
                <div>
                  <label className={labelClass}>
                    {t("employees.form.status", "Status")}
                  </label>

                  <input
                    {...register("status" as keyof UpdateEmployeeFormValues)}
                    className={inputClass}
                    placeholder={t(
                      "employees.form.statusPlaceholder",
                      "e.g. Active, Inactive"
                    )}
                  />

                  {"status" in errors && errors.status && (
                    <p className={errorClass}>
                      {errors.status.message as string}
                    </p>
                  )}
                </div>
              )}

              {/* Department */}
              <div>
                <label className={labelClass}>
                  {t("employees.form.department", "Department")}
                  <Optional/>
                </label>

                <Controller
                  control={control}
                  name="departmentId"
                  render={({ field }) => (
                    <select
                      {...field}
                      className={inputClass}
                      disabled={props.departmentOptionsLoading}
                    >
                      <option value="">
                        {props.departmentOptionsLoading
                          ? t("common.loading", "Loading…")
                          : t("common.none", "None")}
                      </option>

                      {visibleDepartmentOptions.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  )}
                />

                {selectedBranchId &&
                  visibleDepartmentOptions.length === 0 && (
                    <p className="mt-1 text-xs text-[var(--ink-tertiary)]">
                      {t(
                        "employees.form.noDepartmentsForBranch",
                        "No departments belong to the selected branch."
                      )}
                    </p>
                  )}

                {"departmentId" in errors && errors.departmentId && (
                  <p className={errorClass}>
                    {errors.departmentId.message as string}
                  </p>
                )}
              </div>

              {/* Branch */}
              <div>
                <label className={labelClass}>
                  {t("employees.form.branch", "Branch")}
                  <Optional/>
                </label>

                <Controller
                  control={control}
                  name="branchId"
                  render={({ field }) => (
                    <select
                      {...field}
                      className={inputClass}
                      disabled={props.branchOptionsLoading}
                    >
                      <option value="">
                        {props.branchOptionsLoading
                          ? t("common.loading", "Loading…")
                          : t("common.none", "None")}
                      </option>

                      {visibleBranchOptions.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  )}
                />

                {selectedDepartmentId &&
                  selectedDepartmentBranchId && (
                    <p className="mt-1 text-xs text-[var(--ink-tertiary)]">
                      {t(
                        "employees.form.branchLockedByDepartment",
                        "Set automatically from the selected department."
                      )}
                    </p>
                  )}

                {"branchId" in errors && errors.branchId && (
                  <p className={errorClass}>
                    {errors.branchId.message as string}
                  </p>
                )}
              </div>

              {/* Manager */}

              <div>
                <label className={labelClass}>
                  {t("employees.form.manager", "Manager")}
                  <Optional/>
                </label>


                <Controller
                  control={control}
                  name="managerId"
                  render={({ field }) => (
                    <TreeSelect
                      nodes={managerTreeNodes}
                      value={field.value || null}
                      onChange={field.onChange}
                      searchPlaceholder={
                        props.managerOptionsLoading
                          ? t("common.loading", "Loading…")
                          : t(
                            "employees.form.searchManager",
                            "Search employees"
                          )
                      }
                      noneLabel={t("common.none", "None")}
                      emptyResultsLabel={t(
                        "common.noResults",
                        "No results found"
                      )}
                    />
                  )}
                />

                {"managerId" in errors && errors.managerId && (
                  <p className={errorClass}>
                    {errors.managerId.message as string}
                  </p>
                )}
              </div>
              {/* Compensation */}
              <section className="">
                {/* <SectionTitle>
              {t(
                "employees.form.section.compensation",
                "Compensation"
              )}
            </SectionTitle> */}

                <div className="">
                  {/* Base Salary */}
                  <div>
                    <label className={labelClass}>
                      {t("employees.form.baseSalary", "Base Salary")}
                      <span className="ml-1 text-red-500">*</span>
                    </label>

                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      {...register("baseSalary", {
                        valueAsNumber: true,
                      })}
                      className={inputClass}
                      placeholder={t(
                        "employees.form.baseSalaryPlaceholder",
                        "Enter base salary"
                      )}
                    />

                    {errors.baseSalary && (
                      <p className={errorClass}>
                        {errors.baseSalary.message as string}
                      </p>
                    )}
                  </div>
                </div>
              </section>
            </div>
          </section>

        </div>





        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 mt-5">
          <button
            type="button"
            onClick={props.onCancel}
            className="h-10 rounded-md px-5 text-sm font-medium text-[var(--ink-secondary)] hover:bg-[var(--sunken)]"
          >
            {t("common.cancel", "Cancel")}
          </button>

          <button
            type="submit"
            disabled={props.isSubmitting}
            className="h-10 rounded-md bg-[var(--signal)] px-5 text-sm font-medium text-white hover:bg-[var(--signal-hover)] disabled:opacity-60"
          >
            {props.isSubmitting
              ? t("common.saving", "Saving…")
              : isEdit
                ? t(
                  "employees.form.saveChanges",
                  "Save Changes"
                )
                : t(
                  "employees.form.createEmployee",
                  "Create Employee"
                )}
          </button>
        </div>
      </form>
    </div>
  );
}
