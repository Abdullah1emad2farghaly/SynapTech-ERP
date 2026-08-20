// Project path: src/components/admin/suppliers/SupplierDeleteDialog.tsx

import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { ConfirmationDialog } from "../../common/ConfirmationDialog";
import { useDeleteSupplier } from "../../../hooks/useSupplierMutations";
import type { SupplierResponse } from "../../../types/suppliers.types";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { handleErrors } from "@/utils/HandleErrors";

interface SupplierDeleteDialogProps {
  supplier: SupplierResponse | null;
  open: boolean;
  onClose: () => void;
}

export function SupplierDeleteDialog({
  supplier,
  open,
  onClose,
}: SupplierDeleteDialogProps) {
  const { t } = useTranslation();
  const deleteSupplier = useDeleteSupplier();
  const navigate = useNavigate();

  const handleConfirm = async () => {
    if (!supplier) return;
    try {
      await deleteSupplier.mutateAsync(supplier.id);
      toast.success(t("suppliers.toasts.deleted"));
      navigate("/purchasing/suppliers");
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
      title={t("suppliers.deleteDialog.title")}
      body={t("suppliers.deleteDialog.body", { name: supplier?.name })}
      confirmLabel={t("common.actions.delete")}
      cancelLabel={t("common.actions.cancel")}
      isSubmitting={deleteSupplier.isPending}
      onConfirm={handleConfirm}
      onCancel={onClose}
    />
  );
}
