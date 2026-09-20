// Intended project path: src/components/admin/cashier/VoidOrderDialog.tsx

import { useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import axios from "axios";

import { ConfirmationDialog } from "../../common/ConfirmationDialog";
import { useVoidCashierOrder } from "../../../hooks/useCashier";
import { handleErrors } from "@/utils/HandleErrors";
import { VoidOrderSchema } from "@/schemas/cashier.schema";

interface VoidOrderDialogProps {
  open: boolean;
  onClose: () => void;
  orderId: string;
  orderNumber: string | null;
}

// Maps onto VoidCashierOrderRequest: reason.
// No refund/partial-refund behavior is implied or built —
// void is the only documented action.
export const VoidOrderDialog = ({
  open,
  onClose,
  orderId,
  orderNumber,
}: VoidOrderDialogProps) => {
  const { t } = useTranslation();

  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState("");

  const voidOrder = useVoidCashierOrder();

  const handleConfirm = async () => {
    // Validate using the shared schema.
    const schema = VoidOrderSchema(
      t("cashier.validation.reasonRequired")
    );

    const result = schema.safeParse({
      reason,
    });

    if (!result.success) {
      setReasonError(result.error.issues[0]?.message ?? "");
      return;
    }

    // Clear any previous validation error.
    setReasonError("");

    try {
      await voidOrder.mutateAsync({
        id: orderId,
        payload: {
          reason: result.data.reason,
        },
      });

      toast.success(t("cashier.void.success"));

      setReason("");
      setReasonError("");
      onClose();
    } catch (errors) {
      if (axios.isAxiosError(errors)) {
        handleErrors(errors.response?.data?.errors?.Reason);
      }
    }
  };

  const handleReasonChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const value = event.target.value;

    setReason(value);

    // Remove the validation error as soon as the user starts correcting it.
    if (reasonError) {
      setReasonError("");
    }
  };

  const handleCancel = () => {
    if (voidOrder.isPending) {
      return;
    }

    setReason("");
    setReasonError("");
    onClose();
  };

  return (
    <ConfirmationDialog
      open={open}
      tone="destructive"
      title={t("cashier.void.title")}
      body={
        <div className="space-y-3">
          <p>
            {t("cashier.void.body", {
              orderNumber: orderNumber ?? "—",
            })}
          </p>

          <div>
            <label
              htmlFor="void-order-reason"
              className="mb-1.5 block text-sm font-medium text-[var(--ink-primary)]"
            >
              {t("cashier.void.reasonOptional")}
              <span className="ms-1 text-[var(--error)]">*</span>
            </label>

            <textarea
              id="void-order-reason"
              value={reason}
              onChange={handleReasonChange}
              rows={3}
              aria-invalid={Boolean(reasonError)}
              aria-describedby={
                reasonError ? "void-order-reason-error" : undefined
              }
              disabled={voidOrder.isPending}
              className={`w-full resize-none rounded-md border bg-[var(--panel)] px-3 py-2 text-sm text-[var(--ink-primary)] outline-none transition-colors ${
                reasonError
                  ? "border-[var(--error)] focus:border-[var(--error)]"
                  : "border-[var(--hairline)] focus:border-[var(--error)]"
              }`}
            />

            {reasonError && (
              <p
                id="void-order-reason-error"
                className="mt-1.5 text-sm text-[var(--error)]"
                role="alert"
              >
                {reasonError}
              </p>
            )}
          </div>
        </div>
      }
      confirmLabel={t("cashier.void.confirm")}
      cancelLabel={t("common.cancel")}
      isSubmitting={voidOrder.isPending}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );
};