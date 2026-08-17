// Project path: src/components/admin/warehouses/WarehouseDrawer.tsx
//
// One drawer covers Create, Edit, and View — see spec §9. "View" opens this
// same drawer with mode="view" (fields disabled, no Status switch shown as
// editable — just displayed — since a 5-field record doesn't need a second
// read-only layout). Warns before closing with unsaved changes, per the brief.

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { Drawer } from "../../common/Drawer";
import { ConfirmationDialog } from "../../common/ConfirmationDialog";
import { BranchSelector } from "./BranchSelector";
import { warehouseFormSchema, type WarehouseFormValues } from "../../../schemas/warehouses.schema";
import { useCreateWarehouse, useUpdateWarehouse } from "../../../hooks/useWarehouseMutations";
import type { WarehouseResponse } from "../../../types/warehouses.types";
import { MultiSelectOption } from "@/components/common/MultiSelectSearchable";
import axios from "axios";
import { handleErrors } from "@/utils/HandleErrors";

interface BranchOption {
  id: string;
  name: string;
}

export type WarehouseDrawerMode = "create" | "edit" | "view";

interface WarehouseDrawerProps {
  mode: WarehouseDrawerMode;
  warehouse: WarehouseResponse | null;
  branches: MultiSelectOption[];
  branchesLoading?: boolean;
  open: boolean;
  onClose: () => void;
}

const EMPTY_VALUES: WarehouseFormValues = {
  name: "",
  code: "",
  branchId: "",
  isActive: true,
};

export function WarehouseDrawer({
  mode,
  warehouse,
  branches,
  branchesLoading,
  open,
  onClose,
}: WarehouseDrawerProps) {
  const { t } = useTranslation();
  const isReadOnly = mode === "view";
  const isEdit = mode === "edit" || mode === "view";

  const createWarehouse = useCreateWarehouse();
  const updateWarehouse = useUpdateWarehouse(warehouse?.id ?? "");
  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);
  const [isValid, setIsValid] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<WarehouseFormValues>({
    resolver: zodResolver(warehouseFormSchema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (open) {
      reset(
        warehouse
          ? {
              name: warehouse.name,
              code: warehouse.code,
              branchId: warehouse.branchId,
              isActive: warehouse.isActive,
            }
          : EMPTY_VALUES
      );
    }
  }, [open, warehouse, reset]);

  const branchId = watch("branchId");
  const isActive = watch("isActive");

  const attemptClose = () => {
    if (!isReadOnly && isDirty) {
      setConfirmCloseOpen(true);
      return;
    }
    onClose();
  };

  const onSubmit = async (values: WarehouseFormValues) => {
    try {
      if (mode === "create") {
        await createWarehouse.mutateAsync({
          name: values.name,
          code: values.code,
          branchId: values.branchId,
        });
        toast.success(t("warehouses.toasts.created"));
      } else if (mode === "edit" && warehouse) {
        await updateWarehouse.mutateAsync(values);
        toast.success(t("warehouses.toasts.updated"));
      }
      onClose();
    } catch (error) {
      if(axios.isAxiosError(error)){
        handleErrors(error.response?.data.errors)
      }
    }
  };

  const title =
    mode === "create"
      ? t("warehouses.drawer.createTitle")
      : mode === "edit"
      ? t("warehouses.drawer.editTitle")
      : t("warehouses.drawer.viewTitle");

  return (
    <>
      <Drawer
        open={open}
        onClose={attemptClose}
        title={title}
        subtitle={warehouse?.name}
        widthClassName="w-full max-w-lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-[--ink-primary]">
            {t("warehouses.drawer.generalInfo")}
          </h3>

          <div>
            <label className="mb-1 block text-sm text-[--ink-secondary]">
              {t("warehouses.fields.name")}
            </label>
            <input
              {...register("name")}
              disabled={isReadOnly}
              className="w-full rounded-md border border-[--hairline] bg-[--sunken] px-3 py-2 text-sm outline-none focus:border-[--signal] focus:ring-2 focus:ring-[--synapse]/30 disabled:opacity-70"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-[--error]">{t(errors.name.message as string)}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm text-[--ink-secondary]">
              {t("warehouses.fields.code")}
            </label>
            <input
              {...register("code")}
              disabled={isReadOnly}
              className="w-full rounded-md border border-[--hairline] bg-[--sunken] px-3 py-2 font-mono text-sm outline-none focus:border-[--signal] focus:ring-2 focus:ring-[--synapse]/30 disabled:opacity-70"
            />
            {errors.code && (
              <p className="mt-1 text-xs text-[--error]">{t(errors.code.message as string)}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm text-[--ink-secondary]">
              {t("warehouses.fields.branch")}
            </label>
            {isReadOnly ? (
              <input
                disabled
                value={branches.find((b) => b.value === branchId)?.label ?? "—"}
                className="w-full rounded-md border border-[--hairline] bg-[--sunken] px-3 py-2 text-sm text-[--ink-secondary] opacity-70"
              />
            ) : (
              <BranchSelector
                branches={branches}
                value={branchId}
                onChange={(id) => setValue("branchId", id, { shouldValidate: true, shouldDirty: true })}
                isLoading={branchesLoading}
                hasError={Boolean(errors.branchId)}
              />
            )}
            {errors.branchId && (
              <p className="mt-1 text-xs text-[--error]">{t(errors.branchId.message as string)}</p>
            )}
          </div>

          {isEdit && (
            <div className="flex items-center justify-between rounded-md border border-[--hairline] px-3 py-2.5">
              <span className="text-sm text-[--ink-secondary]">
                {t("warehouses.fields.status")}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={isActive}
                aria-label={
                  isActive
                    ? t("warehouses.fields.statusSwitchToDeactivate")
                    : t("warehouses.fields.statusSwitchToActivate")
                }
                disabled={isReadOnly}
                onClick={() => setValue("isActive", !isActive, { shouldDirty: true })}
                className={`relative h-6 w-11 rounded-full transition-colors disabled:opacity-70 ${
                  isActive ? "bg-[--signal]" : "bg-[--hairline]"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    isActive ? "translate-x-5 ltr:-translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          )}

          {!isReadOnly && (
            <div className="mt-2 flex items-center justify-end gap-3 border-t border-[--hairline] pt-4">
              <button
                type="button"
                onClick={attemptClose}
                className="rounded-md px-4 py-2 text-sm font-medium text-[--ink-secondary] hover:bg-[--sunken]"
              >
                {t("common.actions.cancel")}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-md bg-[--signal] disabled:cursor-not-allowed px-4 py-2 text-sm font-medium text-white hover:bg-[--signal-hover] disabled:opacity-60"
              >
                {mode === "create"
                  ? t("warehouses.actions.create")
                  : t("common.actions.saveChanges")}
              </button>
            </div>
          )}
        </form>
      </Drawer>

      <ConfirmationDialog
        open={confirmCloseOpen}
        tone="default"
        title={t("warehouses.drawer.unsavedChangesTitle")}
        body={t("warehouses.drawer.unsavedChangesBody")}
        confirmLabel={t("warehouses.drawer.discardChanges")}
        cancelLabel={t("warehouses.drawer.keepEditing")}
        onConfirm={() => {
          setConfirmCloseOpen(false);
          onClose();
        }}
        onCancel={() => setConfirmCloseOpen(false)}
      />
    </>
  );
}
