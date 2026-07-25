// Project path: src/components/admin/roles/CreateRoleDrawer.tsx
//
// Wide Drawer (not a modal/page) — see project decision precedent for briefs
// requesting "a large modal or dedicated page" (Departments/Branches).
// Uses React Hook Form + Zod, the project's intended pattern (CreateUserDrawer),
// rather than repeating the useState pattern used by DepartmentDrawer/BranchDrawer —
// no reason to propagate that known technical debt into a brand-new module.

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { Drawer } from "../../common/Drawer";
import { PermissionPicker } from "./PermissionPicker";
import { createRoleSchema, type CreateRoleFormValues } from "../../../schemas/roles.schema";
import { usePermissionsCatalog } from "../../../hooks/useRoles";
import { useCreateRole } from "../../../hooks/useRoleMutations";

interface CreateRoleDrawerProps {
  open: boolean;
  onClose: () => void;
  /** Pre-filled values when opened via "Duplicate" on an existing role */
  duplicateFrom?: { name: string; description: string; permissions: string[] };
}

export function CreateRoleDrawer({
  open,
  onClose,
  duplicateFrom,
}: CreateRoleDrawerProps) {
  const { t } = useTranslation();
  const { data: catalog = [], isLoading: catalogLoading } =
    usePermissionsCatalog();
  const createRole = useCreateRole();

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateRoleFormValues>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: {
      name: duplicateFrom?.name ? `${duplicateFrom.name} (Copy)` : "",
      description: duplicateFrom?.description ?? "",
      permissionCodes: duplicateFrom?.permissions ?? [],
    },
  });

  const nameValue = watch("name");

  const onSubmit = async (values: CreateRoleFormValues) => {
    try {
      await createRole.mutateAsync(values);
      toast.success(t("roles.toasts.created"));
      reset();
      onClose();
    } catch {
      toast.error(t("common.errors.actionFailed"));
    }
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={
        duplicateFrom
          ? t("roles.create.duplicateTitle")
          : t("roles.create.title")
      }
      subtitle={t("roles.create.subtitle")}
      widthClassName="w-full max-w-2xl"
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex h-full flex-col gap-4"
      >
        <section className="flex flex-col">
          <h3 className="text-sm mb-3 font-semibold text-[--ink-primary]">
            {t("roles.create.generalInfo")}
          </h3>

          <div>
            <label className="mb-1 block text-sm text-[--ink-secondary]">
              {t("roles.fields.name")}
            </label>
            <input
              {...register("name")}
              className="w-full rounded-md border border-[--hairline] bg-[--sunken] px-3 py-2 text-sm outline-none focus:border-[--signal] focus:ring-2 focus:ring-[--synapse]/30"
            />
            <div className="mt-1 flex items-center justify-between">
              {errors.name && (
                <p className="text-xs text-[--error]">
                  {t(errors.name.message as string)}
                </p>
              )}
              <p className="ms-auto text-xs text-[--ink-tertiary]">
                {nameValue?.length ?? 0}/60
              </p>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm text-[--ink-secondary]">
              {t("roles.fields.description")}
            </label>
            <textarea
              {...register("description")}
              rows={3}
              className="w-full rounded-md border border-[--hairline] bg-[--sunken] px-3 py-2 text-sm outline-none focus:border-[--signal] focus:ring-2 focus:ring-[--synapse]/30"
            />
            {errors.description && (
              <p className="mt-1 text-xs text-[--error]">
                {t(errors.description.message as string)}
              </p>
            )}
          </div>
        </section>

        <section className="flex flex-1 flex-col gap-3 overflow-auto">
          <h3 className="text-sm font-semibold text-[--ink-primary]">
            {t("roles.create.permissions")}
          </h3>

          {catalogLoading ? (
            <div className="h-40 animate-pulse rounded-lg bg-[--sunken]" />
          ) : (
            <Controller
              control={control}
              name="permissionCodes"
              render={({ field }) => (
                <PermissionPicker
                  catalog={catalog}
                  selectedCodes={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          )}
          {errors.permissionCodes && (
            <p className="text-xs text-[--error]">
              {t(errors.permissionCodes.message as string)}
            </p>
          )}
        </section>

        <div className="mt-auto flex items-center justify-end gap-3 border-t border-[--hairline] pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm font-medium text-[--ink-secondary] hover:bg-[--sunken]"
          >
            {t("common.actions.cancel")}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-[--signal] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[--signal-hover] disabled:opacity-60"
          >
            {t("roles.actions.createRole")}
          </button>
        </div>
      </form>
    </Drawer>
  );
}
