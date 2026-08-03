// Project path: src/components/admin/purchase-orders/PurchaseOrderActionDialog.tsx
//
// One dialog parameterized by action, instead of three near-identical ones
// (SubmitOrderDialog/ApproveOrderDialog/CancelOrderDialog) — same content
// structure, only copy and mutation differ. No "reason for cancellation"
// field — POST /cancel takes no body, so there's nothing to send it to.

import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { ConfirmationDialog } from "../../common/ConfirmationDialog";
import {
  useSubmitPurchaseOrder,
  useApprovePurchaseOrder,
  useCancelPurchaseOrder,
} from "../../../hooks/usePurchaseOrderMutations";
import type { PurchaseOrderResponse } from "../../../types/purchaseOrders.types";

export type PurchaseOrderDialogAction = "submit" | "approve" | "cancel";

interface PurchaseOrderActionDialogProps {
  action: PurchaseOrderDialogAction | null;
  order: PurchaseOrderResponse | null;
  onClose: () => void;
}

export function PurchaseOrderActionDialog({
  action,
  order,
  onClose,
}: PurchaseOrderActionDialogProps) {
  const { t } = useTranslation();
  const submit = useSubmitPurchaseOrder(order?.id ?? "");
  const approve = useApprovePurchaseOrder(order?.id ?? "");
  const cancel = useCancelPurchaseOrder(order?.id ?? "");

  if (!action || !order) return null;

  const config = {
    submit: {
      title: t("purchaseOrders.dialogs.submitTitle"),
      body: t("purchaseOrders.dialogs.submitBody", { orderNumber: order.orderNumber }),
      confirmLabel: t("purchaseOrders.actions.submit"),
      tone: "default" as const,
      mutation: submit,
      successMessage: t("purchaseOrders.toasts.submitted"),
    },
    approve: {
      title: t("purchaseOrders.dialogs.approveTitle"),
      body: t("purchaseOrders.dialogs.approveBody", { orderNumber: order.orderNumber }),
      confirmLabel: t("purchaseOrders.actions.approve"),
      tone: "default" as const,
      mutation: approve,
      successMessage: t("purchaseOrders.toasts.approved"),
    },
    cancel: {
      title: t("purchaseOrders.dialogs.cancelTitle"),
      body: t("purchaseOrders.dialogs.cancelBody", { orderNumber: order.orderNumber }),
      confirmLabel: t("purchaseOrders.actions.cancel"),
      tone: "destructive" as const,
      mutation: cancel,
      successMessage: t("purchaseOrders.toasts.cancelled"),
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
