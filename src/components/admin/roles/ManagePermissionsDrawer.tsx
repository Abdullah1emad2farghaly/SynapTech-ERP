// Project path: src/components/admin/roles/ManagePermissionsDrawer.tsx
//
// The brief asks that this "comfortably manage hundreds of permissions" and
// never be a tiny modal — given as a maximally wide Drawer instance rather
// than a new full-screen-page pattern, consistent with the project's Create
// Role drawer and the established Drawer-for-everything convention.

import { useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { Drawer } from "../../common/Drawer";
import { PermissionPicker } from "./PermissionPicker";
import { usePermissionsCatalog } from "../../../hooks/useRoles";
import { useAssignPermissions } from "../../../hooks/useRoleMutations";
import type { RoleResponse } from "../../../types/roles.types";
import axios from "axios";
import { handleErrors } from "@/utils/HandleErrors";

interface ManagePermissionsDrawerProps {
  role: RoleResponse | null;
  open: boolean;
  onClose: () => void;
}

export function ManagePermissionsDrawer({
  role,
  open,
  onClose,
}: ManagePermissionsDrawerProps) {
  const { t } = useTranslation();
  const { data: catalog = [], isLoading: catalogLoading } =
    usePermissionsCatalog();
  const assignPermissions = useAssignPermissions(role?.id ?? "");
  const [selected, setSelected] = useState<string[]>(role?.permissions ?? []);

  // Resync local selection whenever a different role is opened.
  const [openedRoleId, setOpenedRoleId] = useState<string | null>(null);
  if (role && role.id !== openedRoleId) {
    setOpenedRoleId(role.id);
    setSelected(role.permissions);
  }

  const handleSave = async () => {
    if (!role) return;
    try {
      await assignPermissions.mutateAsync({ permissionCodes: selected });
      toast.success(t("roles.toasts.permissionsUpdated"));
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
      title={t("roles.managePermissions.title")}
      subtitle={role?.name}
      widthClassName="w-full max-w-3xl"
    >
      <div className="flex h-full flex-col gap-4">
        {catalogLoading ? (
          <div className="h-64 animate-pulse rounded-lg bg-[--sunken]" />
        ) : (
          <div className="flex-1 overflow-y-auto">
            <PermissionPicker
              catalog={catalog}
              selectedCodes={selected}
              onChange={setSelected}
            />
          </div>
        )}

        <div className="mt-auto flex items-center justify-end gap-3 border-t border-[--hairline] pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm font-medium text-[--ink-secondary] hover:bg-[--sunken]"
          >
            {t("common.actions.cancel")}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={assignPermissions.isPending}
            className="rounded-md bg-[--signal] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[--signal-hover] disabled:opacity-60"
          >
            {t("common.actions.saveChanges")}
          </button>
        </div>
      </div>
    </Drawer>
  );
}
