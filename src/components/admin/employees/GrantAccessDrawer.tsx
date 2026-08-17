// Project path: src/components/admin/employees/GrantAccessDrawer.tsx
//
// The brief calls this a "modal/sheet" — built as a Drawer instead, per the
// project's fixed Drawer-for-all-forms convention (overriding brief wording,
// same precedent as Branches/Departments' "modal" requests becoming Drawers).
//
// Role options reuse the same roles-catalog gap already flagged project-wide:
// GET /api/Roles is unconfirmed (see Roles module notes). This form expects
// a `roleOptions: {value; label}[]` prop so the parent page can supply it
// however the real roles source ends up working — not re-guessing the
// endpoint a second time inside this component.
//
// States handled explicitly: idle / submitting (isSubmitting) / success
// (toast, close, invalidate via the hook's onSuccess) / error (toast).

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { Drawer } from "../../common/Drawer";
import { MultiSelectSearchable } from "../../common/MultiSelectSearchable";
import {
  GrantEmployeeAccessSchema,
  type GrantEmployeeAccessFormValues,
} from "../../../schemas/employee.schema";
import { useGrantEmployeeAccess } from "../../../hooks/useEmployees";
import type { EmployeeResponse } from "../../../types/employee.types";
import axios from "axios";
import { handleErrors } from "@/utils/HandleErrors";

interface RoleOption {
  value: string;
  label: string;
}

interface GrantAccessDrawerProps {
  open: boolean;
  onClose: () => void;
  employee: EmployeeResponse | null;
  roleOptions: RoleOption[];
}

export function GrantAccessDrawer({
  open,
  onClose,
  employee,
  roleOptions,
}: GrantAccessDrawerProps) {
  const { t } = useTranslation();
  const grantAccess = useGrantEmployeeAccess();
  
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GrantEmployeeAccessFormValues>({
    resolver: zodResolver(GrantEmployeeAccessSchema),
    defaultValues: { email: employee?.email ?? "", roleNames: [] },
  });

  useEffect(() => {
    if (open) {
      reset({ email: employee?.email ?? "", roleNames: [] });
    }
  }, [open, employee, reset]);

  if (!employee) return null;

  const onSubmit = async (values: GrantEmployeeAccessFormValues) => {
    try {
      await grantAccess.mutateAsync({
        id: employee.id,
        payload: {
          email: values.email || undefined,
          roleNames: values.roleNames,
        },
      });
      toast.success(t("employees.grantAccess.success", "System access granted successfully"));
      onClose();
    } catch(error) {
      if(axios.isAxiosError(error)){
        handleErrors(error.response?.data.errors)
      }
    }
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={t("employees.grantAccess.title", "Grant System Access")}
      subtitle={employee.fullName || employee.employeeCode || undefined}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 p-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--ink-primary)]">
            {t("employees.form.email", "Email")}
          </label>
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <input
                {...field}
                type="email"
                className="h-10 w-full rounded-md border border-[var(--hairline)] bg-[var(--panel)] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--synapse)]"
                placeholder={t("employees.grantAccess.emailPlaceholder", "employee@company.com")}
              />
            )}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-[var(--error)]">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--ink-primary)]">
            {t("employees.grantAccess.roles", "Roles")}
          </label>
          <Controller
            control={control}
            name="roleNames"
            render={({ field }) => (
              <MultiSelectSearchable
                options={roleOptions}
                selected={field.value}
                onChange={field.onChange}
                searchPlaceholder={t("employees.grantAccess.searchRoles", "Search roles")}
                showSelectedSummary
                emptyResultsLabel={t("common.noResults", "No results found")}
              />
            )}
          />
          {errors.roleNames && (
            <p className="mt-1 text-xs text-[var(--error)]">{errors.roleNames.message}</p>
          )}
        </div>

        <div className="mt-2 flex items-center justify-end gap-2 border-t border-[var(--hairline)] pt-4">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-md px-4 text-sm font-medium text-[var(--ink-secondary)] hover:bg-[var(--sunken)]"
          >
            {t("common.cancel", "Cancel")}
          </button>
          <button
            type="submit"
            disabled={grantAccess.isPending}
            className="h-10 rounded-md disabled:cursor-not-allowed bg-[var(--signal)] px-4 text-sm font-medium text-white hover:bg-[var(--signal-hover)] disabled:opacity-60"
          >
            {grantAccess.isPending
              ? t("employees.grantAccess.granting", "Granting…")
              : t("employees.grantAccess.submit", "Grant Access")}
          </button>
        </div>
      </form>
    </Drawer>
  );
}
