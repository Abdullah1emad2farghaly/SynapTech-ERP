// src/components/admin/users/CreateUserDrawer.tsx
//
// Create User workflow.
//
// Validation:
//   - fullName is required.
//   - email is required and must be a valid email.
//   - branchId is optional and is sent as null when empty.
//   - departmentId is optional and is sent as null when empty.
//   - roleNames is optional and is sent as null when no roles are selected.

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { Drawer } from "../../common/Drawer";
import {
  MultiSelectSearchable,
  type MultiSelectOption,
} from "../../common/MultiSelectSearchable";
import { RoleResponse } from "@/types/roles.types";
import Optional from "@/components/common/Optional";

const createUserSchema = z.object({
  // Required
  fullName: z.string().trim().min(2, "required"),

  // Required
  email: z.string().trim().email("invalidEmail"),

  // Optional
  branchId: z.string().nullable(),

  // Optional
  departmentId: z.string().nullable(),

  // Optional
  // The form uses [] internally, but it will be converted to null
  // before being submitted when no roles are selected.
  roleNames: z.array(z.string()).nullable(),
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;

export interface CreateUserDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: CreateUserFormValues) => Promise<void>;
  branchOptions: MultiSelectOption[];
  departmentOptions: MultiSelectOption[];
  roleOptions: RoleResponse[];

  /** Surfaces a field-level error, e.g. email already taken, after a failed submit. */
  serverError?: {
    field?: keyof CreateUserFormValues;
    messageKey: string;
  } | null;
}

export function CreateUserDrawer({
  open,
  onClose,
  onSubmit,
  branchOptions,
  departmentOptions,
  roleOptions,
  serverError,
}: CreateUserDrawerProps) {
  const { t } = useTranslation();

  const options: MultiSelectOption[] = roleOptions.map((op) => ({
    value: op.id,
    label: op.name,
  }));

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: {
      errors,
      isSubmitting,
      isValid,
    },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    mode: "onBlur",
    defaultValues: {
      fullName: "",
      email: "",
      branchId: null,
      departmentId: null,
      roleNames: [],
    },
  });

  function handleClose() {
    reset({
      fullName: "",
      email: "",
      branchId: null,
      departmentId: null,
      roleNames: [],
    });

    onClose();
  }

  async function submitHandler(values: CreateUserFormValues) {
    const submitValues: CreateUserFormValues = {
      fullName: values.fullName.trim(),
      email: values.email.trim(),
      branchId: values.branchId || null,
      departmentId: values.departmentId || null,

      // Send null when no roles are selected.
      roleNames:
        values.roleNames && values.roleNames.length > 0
          ? values.roleNames
          : null,
    };

    await onSubmit(submitValues);
  }

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      title={t("users.create.title")}
    >
      <form
        onSubmit={handleSubmit(submitHandler)}
        className="flex flex-col gap-6"
      >
        {/* Identity group */}
        <fieldset className="flex flex-col gap-4">
          <legend className="mb-1 text-xs font-medium uppercase tracking-wide text-[var(--ink-tertiary)]">
            {t("users.details.sections.basicInfo")}
          </legend>

          {/* Full Name - Required */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--ink-primary)]">
              {t("users.create.fields.fullName")}
            </label>

            <input
              {...register("fullName")}
              className="w-full rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--ink-primary)] focus:border-[var(--signal)] focus:outline-none focus:ring-2 focus:ring-[var(--synapse)]/30"
            />

            {errors.fullName && (
              <p className="mt-1 text-xs text-[var(--error)]">
                {t("users.create.errors.required")}
              </p>
            )}
          </div>

          {/* Email - Required */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--ink-primary)]">
              {t("users.create.fields.email")}
            </label>

            <input
              type="email"
              {...register("email")}
              className="w-full rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--ink-primary)] focus:border-[var(--signal)] focus:outline-none focus:ring-2 focus:ring-[var(--synapse)]/30"
            />

            {errors.email && (
              <p className="mt-1 text-xs text-[var(--error)]">
                {errors.email.type === "invalid_string"
                  ? t("users.create.errors.invalidEmail")
                  : t("users.create.errors.required")}
              </p>
            )}

            {serverError?.field === "email" && (
              <p className="mt-1 text-xs text-[var(--error)]">
                {t(serverError.messageKey)}
              </p>
            )}
          </div>
        </fieldset>

        {/* Organization group */}
        <fieldset className="flex flex-col gap-4">
          <legend className="mb-1 text-xs font-medium uppercase tracking-wide text-[var(--ink-tertiary)]">
            {t("users.details.sections.organization")}
          </legend>

          {/* Branch - Optional */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--ink-primary)]">
              {t("users.create.fields.branch")}
              <Optional />
            </label>

            <select
              {...register("branchId", {
                setValueAs: (value) => value || null,
              })}
              className="w-full rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--ink-primary)] focus:border-[var(--signal)] focus:outline-none focus:ring-2 focus:ring-[var(--synapse)]/30"
            >
              <option value="">—</option>

              {branchOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Department - Optional */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--ink-primary)]">
              {t("users.create.fields.department")}
              <Optional />
            </label>

            <select
              {...register("departmentId", {
                setValueAs: (value) => value || null,
              })}
              className="w-full rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--ink-primary)] focus:border-[var(--signal)] focus:outline-none focus:ring-2 focus:ring-[var(--synapse)]/30"
            >
              <option value="">—</option>

              {departmentOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </fieldset>

        {/* Access group */}
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-xs font-medium uppercase tracking-wide text-[var(--ink-scondary)]">
            {t("users.details.sections.roles")}
            <Optional/>
          </legend>

          <Controller
            name="roleNames"
            control={control}
            render={({ field }) => (
              <MultiSelectSearchable
                options={options}
                selected={field.value ?? []}
                onChange={field.onChange}
                searchPlaceholder={t(
                  "users.roles.searchPlaceholder"
                )}
              />
            )}
          />
        </fieldset>

        {/* Actions */}
        <div className="mt-2 flex justify-end gap-2 border-t border-[var(--hairline)] pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-[10px] px-4 py-2 text-sm font-medium text-[var(--ink-secondary)] hover:bg-[var(--sunken)]"
          >
            {t("users.actions.cancel")}
          </button>

          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="rounded-[10px] bg-[var(--signal)] px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-[var(--signal-hover)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting
              ? t("users.create.submitting")
              : t("users.list.createUser")}
          </button>
        </div>
      </form>
    </Drawer>
  );
}
