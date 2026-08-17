// Project path: src/components/admin/roles/EditRoleDrawer.tsx
//
// PUT /api/Roles/{id} only accepts name + description — permission changes
// go through the separate "Manage Permissions" flow (PUT /{id}/permissions),
// so this drawer deliberately does not include a permissions section.

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { Drawer } from "../../common/Drawer";
import { editRoleSchema, type EditRoleFormValues } from "../../../schemas/roles.schema";
import { useUpdateRole } from "../../../hooks/useRoleMutations";
import type { RoleResponse } from "../../../types/roles.types";
import axios from "axios";
import { handleErrors } from "@/utils/HandleErrors";

interface EditRoleDrawerProps {
  role: RoleResponse | null;
  open: boolean;
  onClose: () => void;
}

export function EditRoleDrawer({ role, open, onClose }: EditRoleDrawerProps) {
  const { t } = useTranslation();
  const updateRole = useUpdateRole(role?.id ?? "");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EditRoleFormValues>({
    resolver: zodResolver(editRoleSchema),
    values: {
      name: role?.name ?? "",
      description: role?.description ?? "",
    },
  });

  const onSubmit = async (values: EditRoleFormValues) => {
    try {
      await updateRole.mutateAsync(values);
      toast.success(t("roles.toasts.updated"));
      onClose();
    } catch (error) {
      if(axios.isAxiosError(error)){
        handleErrors(error.response?.data.errors)
      }
    }
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={t("roles.edit.title")}
      subtitle={role?.name}
      widthClassName="w-full max-w-lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm text-[--ink-secondary]">
            {t("roles.fields.name")}
          </label>
          <input
            {...register("name")}
            className="w-full rounded-md border border-[--hairline] bg-[--sunken] px-3 py-2 text-sm outline-none focus:border-[--signal] focus:ring-2 focus:ring-[--synapse]/30"
          />
          {errors.name && (
            <p className="mt-1 text-xs text-[--error]">
              {t(errors.name.message as string)}
            </p>
          )}
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

        <div className="mt-2 flex items-center justify-end gap-3 border-t border-[--hairline] pt-4">
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
            {t("common.actions.saveChanges")}
          </button>
        </div>
      </form>
    </Drawer>
  );
}
