// Project path: src/components/admin/suppliers/SupplierDrawer.tsx
//
// Drawer (not a separate modal pattern) — same established override as every
// other module's Create/Edit form. "Save & New" resets the form and stays
// open instead of navigating away, per the brief. Warns before closing with
// unsaved changes, same pattern as WarehouseDrawer.

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { Drawer } from "../../common/Drawer";
import { ConfirmationDialog } from "../../common/ConfirmationDialog";
import { supplierFormSchema, type SupplierFormValues } from "../../../schemas/suppliers.schema";
import { useCreateSupplier, useUpdateSupplier } from "../../../hooks/useSupplierMutations";
import type { SupplierResponse } from "../../../types/suppliers.types";
import axios from "axios";
import { handleErrors } from "@/utils/HandleErrors";

export type SupplierDrawerMode = "create" | "edit";

interface SupplierDrawerProps {
  mode: SupplierDrawerMode;
  supplier: SupplierResponse | null;
  open: boolean;
  onClose: () => void;
}

const EMPTY_VALUES: SupplierFormValues = {
  name: "",
  contactName: "",
  phone: "",
  email: "",
  address: "",
  taxNumber: "",
  isActive: true,
};

export function SupplierDrawer({ mode, supplier, open, onClose }: SupplierDrawerProps) {
  const { t } = useTranslation();
  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier(supplier?.id ?? "");
  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (open) {
      reset(
        supplier
          ? {
              name: supplier.name,
              contactName: supplier.contactName,
              phone: supplier.phone,
              email: supplier.email,
              address: supplier.address,
              taxNumber: supplier.taxNumber,
              isActive: supplier.isActive,
            }
          : EMPTY_VALUES
      );
    }
  }, [open, supplier, reset]);

  const isActive = watch("isActive");

  const attemptClose = () => {
    if (isDirty) {
      setConfirmCloseOpen(true);
      return;
    }
    onClose();
  };

  const submit = async (values: SupplierFormValues, stayAndCreateAnother: boolean) => {
    try {
      if (mode === "create") {
        // await createSupplier.mutateAsync(values);
        toast.success(t("suppliers.toasts.created"));
        if (stayAndCreateAnother) {
          reset(EMPTY_VALUES);
          return;
        }
      } else if (mode === "edit" && supplier) {
        await updateSupplier.mutateAsync(values);
        toast.success(t("suppliers.toasts.updated"));
      }
      onClose();
    } catch (error) {
      if(axios.isAxiosError(error)){
        handleErrors(error.response?.data.errors)
      }
    }
  };

  return (
    <>
      <Drawer
        open={open}
        onClose={attemptClose}
        title={mode === "create" ? t("suppliers.drawer.createTitle") : t("suppliers.drawer.editTitle")}
        subtitle={supplier?.name}
        widthClassName="w-full max-w-xl"
      >
        <form onSubmit={handleSubmit((v) => submit(v, false))} className="flex flex-col gap-5">
          <section className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-[--ink-primary]">
              {t("suppliers.drawer.supplierInfo")}
            </h3>

            <div>
              <label className="mb-1 block text-sm text-[--ink-secondary]">
                {t("suppliers.fields.name")}
              </label>
              <input
                {...register("name")}
                className="w-full rounded-md border border-[--hairline] bg-[--sunken] px-3 py-2 text-sm outline-none focus:border-[--signal] focus:ring-2 focus:ring-[--synapse]/30"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-[--error]">{t(errors.name.message as string)}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-[--ink-secondary]">
                  {t("suppliers.fields.contactName")}
                </label>
                <input
                  {...register("contactName")}
                  className="w-full rounded-md border border-[--hairline] bg-[--sunken] px-3 py-2 text-sm outline-none focus:border-[--signal] focus:ring-2 focus:ring-[--synapse]/30"
                />
                {errors.contactName && (
                  <p className="mt-1 text-xs text-[--error]">
                    {t(errors.contactName.message as string)}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm text-[--ink-secondary]">
                  {t("suppliers.fields.phone")}
                </label>
                <input
                  {...register("phone")}
                  type="tel"
                  className="w-full rounded-md border border-[--hairline] bg-[--sunken] px-3 py-2 text-sm outline-none focus:border-[--signal] focus:ring-2 focus:ring-[--synapse]/30"
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-[--error]">{t(errors.phone.message as string)}</p>
                )}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm text-[--ink-secondary]">
                {t("suppliers.fields.email")}
              </label>
              <input
                {...register("email")}
                type="email"
                className="w-full rounded-md border border-[--hairline] bg-[--sunken] px-3 py-2 text-sm outline-none focus:border-[--signal] focus:ring-2 focus:ring-[--synapse]/30"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-[--error]">{t(errors.email.message as string)}</p>
              )}
            </div>
          </section>

          <section className="flex flex-col gap-4 border-t border-[--hairline] pt-4">
            <h3 className="text-sm font-semibold text-[--ink-primary]">
              {t("suppliers.drawer.businessInfo")}
            </h3>

            <div>
              <label className="mb-1 block text-sm text-[--ink-secondary]">
                {t("suppliers.fields.address")}
              </label>
              <textarea
                {...register("address")}
                rows={2}
                className="w-full rounded-md border border-[--hairline] bg-[--sunken] px-3 py-2 text-sm outline-none focus:border-[--signal] focus:ring-2 focus:ring-[--synapse]/30"
              />
              {errors.address && (
                <p className="mt-1 text-xs text-[--error]">{t(errors.address.message as string)}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm text-[--ink-secondary]">
                {t("suppliers.fields.taxNumber")}
              </label>
              <input
                {...register("taxNumber")}
                className="w-full rounded-md border border-[--hairline] bg-[--sunken] px-3 py-2 font-mono text-sm outline-none focus:border-[--signal] focus:ring-2 focus:ring-[--synapse]/30"
              />
              {errors.taxNumber && (
                <p className="mt-1 text-xs text-[--error]">
                  {t(errors.taxNumber.message as string)}
                </p>
              )}
            </div>

            {mode === "edit" && (
              <div className="flex items-center justify-between rounded-md border border-[--hairline] px-3 py-2.5">
                <span className="text-sm text-[--ink-secondary]">
                  {t("suppliers.fields.status")}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isActive}
                  onClick={() => setValue("isActive", !isActive, { shouldDirty: true })}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
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
          </section>

          <div className="mt-2 flex flex-wrap items-center justify-end gap-3 border-t border-[--hairline] pt-4">
            <button
              type="button"
              onClick={attemptClose}
              className="rounded-md px-4 py-2 text-sm font-medium text-[--ink-secondary] hover:bg-[--sunken]"
            >
              {t("common.actions.cancel")}
            </button>
            {mode === "create" && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmit((v) => submit(v, true))}
                className="rounded-md border border-[--hairline] px-4 py-2 text-sm font-medium text-[--ink-primary] hover:bg-[--sunken] disabled:opacity-60"
              >
                {t("suppliers.actions.saveAndNew")}
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-[--signal] px-4 py-2 text-sm font-medium text-white hover:bg-[--signal-hover] disabled:opacity-60"
            >
              {mode === "create" ? t("suppliers.actions.save") : t("common.actions.saveChanges")}
            </button>
          </div>
        </form>
      </Drawer>

      <ConfirmationDialog
        open={confirmCloseOpen}
        tone="default"
        title={t("suppliers.drawer.unsavedChangesTitle")}
        body={t("suppliers.drawer.unsavedChangesBody")}
        confirmLabel={t("suppliers.drawer.discardChanges")}
        cancelLabel={t("suppliers.drawer.keepEditing")}
        onConfirm={() => {
          setConfirmCloseOpen(false);
          onClose();
        }}
        onCancel={() => setConfirmCloseOpen(false)}
      />
    </>
  );
}
