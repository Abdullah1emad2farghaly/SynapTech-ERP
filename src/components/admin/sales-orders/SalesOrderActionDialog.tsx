// Project path: src/components/admin/sales-orders/SalesOrderActionDialog.tsx
//
// Mirrors PurchaseOrderActionDialog's one-dialog-three-actions pattern. No
// "reason for cancellation" field — POST /cancel takes no body.

import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { ConfirmationDialog } from "../../common/ConfirmationDialog";
import {
  useSubmitSalesOrder,
  useApproveSalesOrder,
  useCancelSalesOrder,
} from "../../../hooks/useSalesOrderMutations";
import type { SalesOrderResponse } from "../../../types/salesOrders.types";

export type SalesOrderDialogAction = "submit" | "approve" | "cancel";

interface SalesOrderActionDialogProps {
  action: SalesOrderDialogAction | null;
  order: SalesOrderResponse | null;
  onClose: () => void;
}

export function SalesOrderActionDialog({ action, order, onClose }: SalesOrderActionDialogProps) {
  const { t } = useTranslation();
  const submit = useSubmitSalesOrder(order?.id ?? "");
  const approve = useApproveSalesOrder(order?.id ?? "");
  const cancel = useCancelSalesOrder(order?.id ?? "");

  if (!action || !order) return null;

  const config = {
    submit: {
      title: t("salesOrders.dialogs.submitTitle"),
      body: t("salesOrders.dialogs.submitBody", { orderNumber: order.orderNumber }),
      confirmLabel: t("salesOrders.actions.submit"),
      tone: "default" as const,
      mutation: submit,
      successMessage: t("salesOrders.toasts.submitted"),
    },
    approve: {
      title: t("salesOrders.dialogs.approveTitle"),
      body: t("salesOrders.dialogs.approveBody", { orderNumber: order.orderNumber }),
      confirmLabel: t("salesOrders.actions.approve"),
      tone: "default" as const,
      mutation: approve,
      successMessage: t("salesOrders.toasts.approved"),
    },
    cancel: {
      title: t("salesOrders.dialogs.cancelTitle"),
      body: t("salesOrders.dialogs.cancelBody", { orderNumber: order.orderNumber }),
      confirmLabel: t("salesOrders.actions.cancel"),
      tone: "destructive" as const,
      mutation: cancel,
      successMessage: t("salesOrders.toasts.cancelled"),
    },
  }[action];

  const handleConfirm = async () => {
    try {
      await config.mutation.mutateAsync();
      toast.success(config.successMessage);
      onClose();
    } catch {
      toast.error(t("common.errors.actionFailed"));
    }
  };

  return (
    <ConfirmationDialog
      open={Boolean(action)}
      tone={config.tone}
      title={config.title}
      body={config.body}
      confirmLabel={config.confirmLabel}
      cancelLabel={t("common.actions.cancel")}
      isSubmitting={config.mutation.isPending}
      onConfirm={handleConfirm}
      onCancel={onClose}
    />
  );
}
