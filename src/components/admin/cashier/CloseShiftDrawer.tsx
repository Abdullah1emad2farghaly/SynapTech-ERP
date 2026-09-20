// Intended project path: src/components/admin/cashier/CloseShiftDrawer.tsx
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Drawer } from "../../common/Drawer";
import { useCloseShift } from "../../../hooks/useCashier";
import { CloseShiftSchema, type CloseShiftFormValues } from "../../../schemas/cashier.schema";
import type { CashierShiftResponse } from "../../../services/api/cashier.api";

interface CloseShiftDrawerProps {
  open: boolean;
  onClose: () => void;
  shift: CashierShiftResponse;
  onClosed: (shiftId: string) => void;
}

// Maps 1:1 onto CloseShiftRequest: countedClosingCash, notes.
// expectedClosingCash comes straight from CashierShiftResponse — the
// expected-vs-counted comparison is computed client-side from the value the
// cashier types, so the discrepancy is visible before they even submit.
export const CloseShiftDrawer = ({ open, onClose, shift, onClosed }: CloseShiftDrawerProps) => {
  const { t } = useTranslation();
  const closeShiftMutation = useCloseShift();

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CloseShiftFormValues>({
    resolver: zodResolver(CloseShiftSchema),
    defaultValues: { countedClosingCash: 0, notes: "" },
  });

  const counted = watch("countedClosingCash");
  const expected = shift.expectedClosingCash ?? 0;
  const previewDiscrepancy = (counted || 0) - expected;

  const onSubmit = async (values: CloseShiftFormValues) => {
    try {
      await closeShiftMutation.mutateAsync({
        shiftId: shift.id,
        payload: { countedClosingCash: values.countedClosingCash, notes: values.notes || null },
      });
      toast.success(t("cashier.shift.closedSuccess"));
      reset();
      onClosed(shift.id);
    } catch {
      toast.error(t("cashier.shift.closeFailed"));
    }
  };

  return (
    <Drawer open={open} onClose={onClose} title={t("cashier.shift.closeShift")}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex h-full flex-col">
        <div className="flex-1 space-y-5 overflow-y-auto p-1">
          {shift.expectedClosingCash != null && (
            <div className="rounded-md bg-[var(--sunken)] px-3 py-2">
              <p className="text-xs text-[var(--ink-tertiary)]">
                {t("cashier.shift.expectedCash")}
              </p>
              <p className="text-lg font-semibold tabular-nums text-[var(--ink-primary)]">
                {expected.toFixed(2)}
              </p>
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--ink-primary)]">
              {t("cashier.shift.countedCash")}
            </label>
            <Controller
              name="countedClosingCash"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="number"
                  min={0}
                  step="0.01"
                  className="w-full rounded-md border border-[var(--hairline)] bg-[var(--panel)] px-3 py-2 text-sm tabular-nums text-[var(--ink-primary)] outline-none focus:border-[var(--signal)]"
                />
              )}
            />
            {errors.countedClosingCash && (
              <p className="mt-1 text-xs text-[var(--error)]">{t("validation.required")}</p>
            )}
          </div>

          {shift.expectedClosingCash != null && (
            <div
              className={`flex items-center justify-between rounded-md px-3 py-2 text-sm ${
                previewDiscrepancy === 0
                  ? "bg-[var(--sunken)] text-[var(--ink-secondary)]"
                  : previewDiscrepancy > 0
                    ? "bg-[color-mix(in_srgb,var(--success)_12%,transparent)] text-[var(--success)]"
                    : "bg-[color-mix(in_srgb,var(--error)_12%,transparent)] text-[var(--error)]"
              }`}
            >
              <span>{t("cashier.shift.discrepancy")}</span>
              <span className="font-semibold tabular-nums">
                {previewDiscrepancy > 0 ? "+" : ""}
                {previewDiscrepancy.toFixed(2)}
              </span>
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--ink-primary)]">
              {t("cashier.shift.notesOptional")}
            </label>
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
                  value={field.value ?? ""}
                  rows={3}
                  className="w-full resize-none rounded-md border border-[var(--hairline)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--ink-primary)] outline-none focus:border-[var(--signal)]"
                />
              )}
            />
          </div>
        </div>

        <div className="flex shrink-0 justify-end gap-2 border-t border-[var(--hairline)] p-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm font-medium text-[var(--ink-secondary)] transition hover:bg-[var(--sunken)]"
          >
            {t("common.cancel")}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-[var(--error)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {t("cashier.shift.closeShift")}
          </button>
        </div>
      </form>
    </Drawer>
  );
};
