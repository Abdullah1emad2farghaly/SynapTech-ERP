// Project path: src/components/admin/warehouses/DeleteWarehouseDialog.tsx

import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { ConfirmationDialog } from "../../common/ConfirmationDialog";
import { useDeleteWarehouse } from "../../../hooks/useWarehouseMutations";
import type { WarehouseResponse } from "../../../types/warehouses.types";
import axios from "axios";
import { handleErrors } from "@/utils/HandleErrors";

interface DeleteWarehouseDialogProps {
  warehouse: WarehouseResponse | null;
  open: boolean;
  onClose: () => void;
}

export function DeleteWarehouseDialog({
  warehouse,
  open,
  onClose,
}: DeleteWarehouseDialogProps) {
  const { t } = useTranslation();
  const deleteWarehouse = useDeleteWarehouse();

  const handleConfirm = async () => {
    if (!warehouse) return;
    try {
      await deleteWarehouse.mutateAsync(warehouse.id);
      toast.success(t("warehouses.toasts.deleted"));
      onClose();
    } catch (error) {
      if(axios.isAxiosError(error)){
        handleErrors(error.response?.data.errors)
      }
    }
  };

  return (
    <ConfirmationDialog
      open={open}
      tone="destructive"
      title={t("warehouses.deleteDialog.title")}
      body={t("warehouses.deleteDialog.body", {
        name: warehouse?.name,
        code: warehouse?.code,
      })}
      confirmLabel={t("common.actions.delete")}
      cancelLabel={t("common.actions.cancel")}
      isSubmitting={deleteWarehouse.isPending}
      onConfirm={handleConfirm}
      onCancel={onClose}
    />
  );
}
