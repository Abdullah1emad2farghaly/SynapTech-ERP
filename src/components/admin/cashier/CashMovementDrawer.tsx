// Intended project path: src/components/admin/cashier/CashMovementDrawer.tsx

import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Drawer } from "../../common/Drawer";
import { CASH_MOVEMENT_TYPES } from "../../../constants/cashierConfig";
import { useAddCashMovement } from "../../../hooks/useCashier";
import {
  CashMovementSchema,
  type CashMovementFormValues,
} from "../../../schemas/cashier.schema";
import axios from "axios";
import { handleErrors } from "@/utils/HandleErrors";

interface CashMovementDrawerProps {
  open: boolean;
  onClose: () => void;
  shiftId: string;
}

// Maps 1:1 onto CashMovementRequest: movementType, amount, reason.
export const CashMovementDrawer = ({
  open,
  onClose,
  shiftId,
}: CashMovementDrawerProps) => {
  const { t } = useTranslation();
  const addCashMovement = useAddCashMovement();

  const defaultValues: CashMovementFormValues = {
    movementType: CASH_MOVEMENT_TYPES[0]?.value ?? "",
    amount: 0,
    reason: "",
  };

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CashMovementFormValues>({
    resolver: zodResolver(
      CashMovementSchema(t("cashier.validation.reasonRequired"))
    ),
    defaultValues,
  });

  /**
   * Completely reset the drawer state.
   *
   * This clears:
   * - Field values
   * - Validation errors
   * - Dirty state
   * - Touched state
   * - Submit state
   */
  const cleanDrawer = () => {
    reset(defaultValues);
  };

  /**
   * Close the drawer and clean everything inside it.
   */
  const handleClose = () => {
    if (isSubmitting) {
      return;
    }

    cleanDrawer();
    onClose();
  };

  /**
   * If the drawer is closed externally by the parent,
   * make sure its internal state is also completely clean.
   */
  useEffect(() => {
    if (!open) {
      cleanDrawer();
    }
  }, [open]);

  const onSubmit = async (values: CashMovementFormValues) => {
    try {
      await addCashMovement.mutateAsync({
        shiftId,
        payload: {
          movementType: values.movementType,
          amount: values.amount,
          reason: values.reason,
        },
      });

      toast.success(t("cashier.cashMovement.recordedSuccess"));

      cleanDrawer();
      onClose();
    } catch (errors) {
      if (axios.isAxiosError(errors)) {
        handleErrors(errors.response?.data?.errors?.Reason);
      } else {
        toast.error(t("cashier.cashMovement.recordFailed"));
      }
    }
  };

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      title={t("cashier.cashMovement.title")}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex h-full flex-col"
      >
        <div className="flex-1 space-y-5 overflow-y-auto p-1">
          {/* Movement Type */}
          <div>
            <label
              htmlFor="cash-movement-type"
              className="mb-1.5 block text-sm font-medium text-[var(--ink-primary)]"
            >
              {t("cashier.cashMovement.type")}
            </label>

            <Controller
              name="movementType"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  id="cash-movement-type"
                  className="w-full rounded-md border border-[var(--hairline)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--ink-primary)] outline-none focus:border-[var(--signal)]"
                >
                  {CASH_MOVEMENT_TYPES.map((option) => (
                    <option key={option.value} value={option.value}>
                      {t(option.labelKey)}
                    </option>
                  ))}
                </select>
              )}
            />
          </div>

          {/* Amount */}
          <div>
            <label
              htmlFor="cash-movement-amount"
              className="mb-1.5 block text-sm font-medium text-[var(--ink-primary)]"
            >
              {t("cashier.cashMovement.amount")}
            </label>

            <Controller
              name="amount"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  id="cash-movement-amount"
                  type="number"
                  min={0}
                  step="0.01"
                  className={`w-full rounded-md border bg-[var(--panel)] px-3 py-2 text-sm tabular-nums text-[var(--ink-primary)] outline-none ${
                    errors.amount
                      ? "border-[var(--error)] focus:border-[var(--error)]"
                      : "border-[var(--hairline)] focus:border-[var(--signal)]"
                  }`}
                />
              )}
            />

            {errors.amount && (
              <p
                className="mt-1 text-xs text-[var(--error)]"
                role="alert"
              >
                {t("cashier.cashMovement.amountRequired")}
              </p>
            )}
          </div>

          {/* Reason */}
          <div>
            <label
              htmlFor="cash-movement-reason"
              className="mb-1.5 block text-sm font-medium text-[var(--ink-primary)]"
            >
              {t("cashier.cashMovement.reasonOptional")}
              <span className="ms-1 text-[var(--error)]">*</span>
            </label>

            <Controller
              name="reason"
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
                  id="cash-movement-reason"
                  value={field.value ?? ""}
                  rows={3}
                  aria-invalid={Boolean(errors.reason)}
                  aria-describedby={
                    errors.reason
                      ? "cash-movement-reason-error"
                      : undefined
                  }
                  className={`w-full resize-none rounded-md border bg-[var(--panel)] px-3 py-2 text-sm text-[var(--ink-primary)] outline-none ${
                    errors.reason
                      ? "border-[var(--error)] focus:border-[var(--error)]"
                      : "border-[var(--hairline)] focus:border-[var(--signal)]"
                  }`}
                />
              )}
            />

            {errors.reason && (
              <p
                id="cash-movement-reason-error"
                className="mt-1 text-xs text-[var(--error)]"
                role="alert"
              >
                {errors.reason.message}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 justify-end gap-2 border-t border-[var(--hairline)] p-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="rounded-md px-4 py-2 text-sm font-medium text-[var(--ink-secondary)] transition hover:bg-[var(--sunken)] disabled:opacity-60"
          >
            {t("common.cancel")}
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-[var(--signal)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--signal-hover)] disabled:opacity-60"
          >
            {t("cashier.cashMovement.record")}
          </button>
        </div>
      </form>
    </Drawer>
  );
};