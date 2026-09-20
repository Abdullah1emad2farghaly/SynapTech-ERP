// src/components/admin/cashier/OpenShiftDrawer.tsx

import { useTranslation } from "react-i18next";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Drawer } from "../../common/Drawer";
import { SearchableSelect } from "../../common/SearchableSelect";
import { useWarehouses } from "../../../hooks/useWarehouses";
import { useOpenShift } from "../../../hooks/useCashier";
import {
  OpenShiftSchema,
  type OpenShiftFormValues,
} from "../../../schemas/cashier.schema";
import toast from "react-hot-toast";

interface OpenShiftDrawerProps {
  open: boolean;
  onClose: () => void;
  onOpened: () => void;
}

export const OpenShiftDrawer = ({
  open,
  onClose,
  onOpened,
}: OpenShiftDrawerProps) => {
  const { t } = useTranslation();

  const {
    data: warehouses = [],
    isLoading: warehousesLoading,
  } = useWarehouses();

  const openShiftMutation = useOpenShift();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OpenShiftFormValues>({
    resolver: zodResolver(OpenShiftSchema),
    defaultValues: {
      warehouseId: "",
      openingCashBalance: 0,
      notes: "",
    },
  });

  const onSubmit = async (values: OpenShiftFormValues) => {
    try {
      await openShiftMutation.mutateAsync({
        warehouseId: values.warehouseId,
        openingCashBalance: values.openingCashBalance,
        notes: values.notes?.trim() || null,
      });

      toast.success(t("cashier.shift.openedSuccess"));

      reset();
      onOpened();
    } catch {
      toast.error(t("cashier.shift.openFailed"));
    }
  };

  const isBusy = isSubmitting || openShiftMutation.isPending;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={t("cashier.shift.openShift")}
      subtitle={t("cashier.shift.openShiftSubtitle")}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex h-full flex-col"
      >
        <div className="flex-1 space-y-5 overflow-y-auto p-1">
          {/* Warehouse */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--ink-primary)]">
              {t("cashier.shift.warehouse")}
            </label>

            <Controller
              name="warehouseId"
              control={control}
              render={({ field }) => (
                <SearchableSelect
                  value={field.value || null}
                  onChange={(value) => field.onChange(value ?? "")}
                  options={warehouses.map((warehouse) => ({
                    value: warehouse.id,
                    label: warehouse.name,
                  }))}
                  disabled={warehousesLoading || isBusy}
                  searchPlaceholder={t(
                    "cashier.shift.searchWarehouse",
                    "Search warehouse...",
                  )}
                  placeholder={t("cashier.shift.selectWarehouse")}
                  emptyResultsLabel={t(
                    "cashier.shift.noWarehouses",
                    "No warehouses found",
                  )}
                />
              )}
            />

            {errors.warehouseId && (
              <p className="mt-1 text-xs text-[var(--error)]">
                {t("validation.required")}
              </p>
            )}
          </div>

          {/* Opening Cash Balance */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--ink-primary)]">
              {t("cashier.shift.openingCashBalance")}
            </label>

            <Controller
              name="openingCashBalance"
              control={control}
              render={({ field }) => (
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={field.value ?? ""}
                  onChange={(event) => {
                    const value = event.target.value;

                    field.onChange(
                      value === "" ? 0 : Number(value),
                    );
                  }}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                  disabled={isBusy}
                  className="w-full rounded-md border border-[var(--hairline)] bg-[var(--panel)] px-3 py-2 text-sm tabular-nums text-[var(--ink-primary)] outline-none focus:border-[var(--signal)] disabled:cursor-not-allowed disabled:opacity-50"
                />
              )}
            />

            {errors.openingCashBalance && (
              <p className="mt-1 text-xs text-[var(--error)]">
                {errors.openingCashBalance.message ||
                  t("validation.required")}
              </p>
            )}
          </div>

          {/* Notes */}
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
                  disabled={isBusy}
                  className="w-full resize-none rounded-md border border-[var(--hairline)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--ink-primary)] outline-none focus:border-[var(--signal)] disabled:cursor-not-allowed disabled:opacity-50"
                />
              )}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 justify-end gap-2 border-t border-[var(--hairline)] p-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isBusy}
            className="rounded-md px-4 py-2 text-sm font-medium text-[var(--ink-secondary)] transition hover:bg-[var(--sunken)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t("common.cancel")}
          </button>

          <button
            type="submit"
            disabled={isBusy || warehousesLoading}
            className="rounded-md bg-[var(--signal)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--signal-hover)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {t("cashier.shift.openShift")}
          </button>
        </div>
      </form>
    </Drawer>
  );
};
