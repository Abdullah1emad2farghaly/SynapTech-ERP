// src/components/admin/users/CreateUserDrawer.tsx
//
// Create User workflow, mirroring the POST /api/Users payload exactly:
// Full Name, Email, Branch, Department, Roles. Grouped into
// Identity / Organization / Access, per the module design doc.
//
// React Hook Form + Zod, validation inline on blur, submit disabled until
// valid — the standing system convention. No fetching here: onSubmit
// receives the validated payload and the parent wires it to the actual
// useCreateUser() mutation hook over services/api.
//
// ASSUMPTION: Drawer's prop shape (open/onClose/title/children/footer) is
// inferred from the design doc description ("generic, RTL-aware Drawer
// shell already built"). Adjust to match your actual
// components/common/Drawer.tsx if it differs.

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { Drawer } from "../../common/Drawer";
import { MultiSelectSearchable, type MultiSelectOption } from "../../common/MultiSelectSearchable";

const createUserSchema = z.object({
  fullName: z.string().min(2, "required"),
  email: z.string().email("invalidEmail"),
  branchId: z.string().min(1, "required"),
  departmentId: z.string().min(1, "required"),
  roleIds: z.array(z.string()).min(1, "atLeastOneRole"),
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;

export interface CreateUserDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: CreateUserFormValues) => Promise<void>;
  branchOptions: MultiSelectOption[];
  departmentOptions: MultiSelectOption[];
  roleOptions: MultiSelectOption[];
  /** Surfaces a field-level error, e.g. email already taken, after a failed submit. */
  serverError?: { field?: keyof CreateUserFormValues; messageKey: string } | null;
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

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    mode: "onBlur",
    defaultValues: { fullName: "", email: "", branchId: "", departmentId: "", roleIds: [] },
  });

  function handleClose() {
    reset();
    onClose();
  }

  async function submitHandler(values: CreateUserFormValues) {
    await onSubmit(values);
  }

  return (
    <Drawer open={open} onClose={handleClose} title={t("users.create.title")}>
      <form onSubmit={handleSubmit(submitHandler)} className="flex flex-col gap-6">
        {/* Identity group */}
        <fieldset className="flex flex-col gap-4">
          <legend className="mb-1 text-xs font-medium uppercase tracking-wide text-[var(--ink-tertiary)]">
            {t("users.details.sections.basicInfo")}
          </legend>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--ink-primary)]">
              {t("users.create.fields.fullName")}
            </label>
            <input
              {...register("fullName")}
              className="w-full rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--ink-primary)] focus:border-[var(--signal)] focus:outline-none focus:ring-2 focus:ring-[var(--synapse)]/30"
            />
            {errors.fullName && (
              <p className="mt-1 text-xs text-[var(--error)]">{t("users.create.errors.required")}</p>
            )}
          </div>

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
              <p className="mt-1 text-xs text-[var(--error)]">{t("users.create.errors.invalidEmail")}</p>
            )}
            {serverError?.field === "email" && (
              <p className="mt-1 text-xs text-[var(--error)]">{t(serverError.messageKey)}</p>
            )}
          </div>
        </fieldset>

        {/* Organization group */}
        <fieldset className="flex flex-col gap-4">
          <legend className="mb-1 text-xs font-medium uppercase tracking-wide text-[var(--ink-tertiary)]">
            {t("users.details.sections.organization")}
          </legend>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--ink-primary)]">
              {t("users.create.fields.branch")}
            </label>
            <select
              {...register("branchId")}
              className="w-full rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--ink-primary)] focus:border-[var(--signal)] focus:outline-none focus:ring-2 focus:ring-[var(--synapse)]/30"
            >
              <option value="">—</option>
              {branchOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.branchId && (
              <p className="mt-1 text-xs text-[var(--error)]">{t("users.create.errors.required")}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--ink-primary)]">
              {t("users.create.fields.department")}
            </label>
            <select
              {...register("departmentId")}
              className="w-full rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--ink-primary)] focus:border-[var(--signal)] focus:outline-none focus:ring-2 focus:ring-[var(--synapse)]/30"
            >
              <option value="">—</option>
              {departmentOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.departmentId && (
              <p className="mt-1 text-xs text-[var(--error)]">{t("users.create.errors.required")}</p>
            )}
          </div>
        </fieldset>

        {/* Access group */}
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-xs font-medium uppercase tracking-wide text-[var(--ink-tertiary)]">
            {t("users.details.sections.roles")}
          </legend>

          <Controller
            name="roleIds"
            control={control}
            render={({ field }) => (
              <MultiSelectSearchable
                options={roleOptions}
                selected={field.value}
                onChange={field.onChange}
                searchPlaceholder={t("users.roles.searchPlaceholder")}
              />
            )}
          />
          {errors.roleIds && (
            <p className="mt-1 text-xs text-[var(--error)]">{t("users.roles.saveDisabledEmpty")}</p>
          )}
        </fieldset>

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
            {isSubmitting ? t("users.create.submitting") : t("users.list.createUser")}
          </button>
        </div>
      </form>
    </Drawer>
  );
}
