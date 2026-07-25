// Project path: src/components/admin/roles/DeleteRoleDialog.tsx

import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { ConfirmationDialog } from "../../common/ConfirmationDialog";
import { useDeleteRole } from "../../../hooks/useRoleMutations";
import type { RoleResponse } from "../../../types/roles.types";

interface DeleteRoleDialogProps {
  role: RoleResponse | null;
  open: boolean;
  onClose: () => void;
}

export function DeleteRoleDialog({
  role,
  open,
  onClose,
}: DeleteRoleDialogProps) {
  const { t } = useTranslation();
  const deleteRole = useDeleteRole();

  const handleConfirm = async () => {
    if (!role) return;
    try {
      await deleteRole.mutateAsync(role.id);
      toast.success(t("roles.toasts.deleted"));
      onClose();
    } catch {
      toast.error(t("common.errors.actionFailed"));
    }
  };

  return (
    <ConfirmationDialog
      open={open}
      tone="destructive"
      title={t("roles.delete.title")}
      body={t("roles.delete.body", { name: role?.name })}
      confirmLabel={t("common.actions.delete")}
      cancelLabel={t("common.actions.cancel")}
      isSubmitting={deleteRole.isPending}
      onConfirm={handleConfirm}
      onCancel={onClose}
    />
  );
}
