// Project path: src/components/admin/suppliers/SupplierDrawer.tsx

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import axios from "axios";

import { Drawer } from "../../common/Drawer";
import { ConfirmationDialog } from "../../common/ConfirmationDialog";
import {
  supplierFormSchema,
  type SupplierFormValues,
} from "../../../schemas/suppliers.schema";
import {
  useCreateSupplier,
  useUpdateSupplier,
} from "../../../hooks/useSupplierMutations";
import type { SupplierResponse } from "../../../types/suppliers.types";
import { handleErrors } from "@/utils/HandleErrors";
import Optional from "../../common/Optional";

export type SupplierDrawerMode = "create" | "edit";

interface SupplierDrawerProps {
  mode: SupplierDrawerMode;
  supplier: SupplierResponse | null;
  open: boolean;
  onClose: () => void;
}

/**
 * Values used by the form.
 *
 * Empty inputs use "" because HTML inputs naturally work with strings.
 * Before sending to the API, these values are converted to null.
 */
const EMPTY_VALUES: SupplierFormValues = {
  name: "",
  contactName: "",
  phone: "",
  email: "",
  address: "",
  taxNumber: "",
  isActive: true,
};

export function SupplierDrawer({
  mode,
  supplier,
  open,
  onClose,
}: SupplierDrawerProps) {
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
    if (!open) {
      return;
    }

    if (supplier) {
      reset({
        name: supplier.name ?? "",
        contactName: supplier.contactName ?? "",
        phone: supplier.phone ?? "",
        email: supplier.email ?? "",
        address: supplier.address ?? "",
        taxNumber: supplier.taxNumber ?? "",
        isActive: supplier.isActive ?? true,
      });
    } else {
      reset(EMPTY_VALUES);
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

  /**
   * Convert empty strings to null.
   *
   * ""     -> null
   * "   "  -> null
   * "John" -> "John"
   */
  const normalizeNullableString = (
    value: string | null | undefined
  ): string | null => {
    if (value == null || value.trim() === "") {
      return null;
    }

    return value.trim();
  };

  const submit = async (
    values: SupplierFormValues,
    stayAndCreateAnother: boolean
  ) => {

    const payload = {
      name: values.name.trim(),
      contactName: normalizeNullableString(values.contactName),
      phone: normalizeNullableString(values.phone),
      email: normalizeNullableString(values.email),
      address: normalizeNullableString(values.address),
      taxNumber: normalizeNullableString(values.taxNumber),
      isActive: values.isActive,
    };


    try {
      if (mode === "create") {
        await createSupplier.mutateAsync(payload);

        toast.success(t("suppliers.toasts.created"));

        if (stayAndCreateAnother) {
          reset(EMPTY_VALUES);
          return;
        }
      } else if (mode === "edit" && supplier) {
        await updateSupplier.mutateAsync(payload);

        toast.success(t("suppliers.toasts.updated"));
      }

      onClose();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        handleErrors(error.response?.data?.errors);
      }
    }
  };

  return (
    <>
      <Drawer
        open={open}
        onClose={attemptClose}
        title={
          mode === "create"
            ? t("suppliers.drawer.createTitle")
            : t("suppliers.drawer.editTitle")
        }
        subtitle={supplier?.name}
        widthClassName="w-full max-w-xl"
      >
        <form
          onSubmit={handleSubmit((values) => submit(values, false))}
          className="flex flex-col gap-5"
        >
          <section className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-[--ink-primary]">
              {t("suppliers.drawer.supplierInfo")}
            </h3>

            {/* Name */}
            <div>
              <label className="mb-1 block text-sm text-[--ink-secondary]">
                {t("suppliers.fields.name")}
              </label>

              <input
                {...register("name")}
                className="w-full rounded-md border border-[--hairline] bg-[--sunken] px-3 py-2 text-sm outline-none focus:border-[--signal] focus:ring-2 focus:ring-[--synapse]/30"
              />

              {errors.name && (
                <p className="mt-1 text-xs text-[--error]">
                  {t(errors.name.message as string)}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Contact Name */}
              <div>
                <label className="mb-1 block text-sm text-[--ink-secondary]">
                  {t("suppliers.fields.contactName")}
                  <Optional />
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

              {/* Phone */}
              <div>
                <label className="mb-1 block text-sm text-[--ink-secondary]">
                  {t("suppliers.fields.phone")}
                  <Optional />
                </label>

                <input
                  {...register("phone")}
                  type="tel"
                  className="w-full rounded-md border border-[--hairline] bg-[--sunken] px-3 py-2 text-sm outline-none focus:border-[--signal] focus:ring-2 focus:ring-[--synapse]/30"
                />

                {errors.phone && (
                  <p className="mt-1 text-xs text-[--error]">
                    {t(errors.phone.message as string)}
                  </p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="mb-1 block text-sm text-[--ink-secondary]">
                {t("suppliers.fields.email")}
                <Optional />
              </label>

              <input
                {...register("email")}
                type="email"
                className="w-full rounded-md border border-[--hairline] bg-[--sunken] px-3 py-2 text-sm outline-none focus:border-[--signal] focus:ring-2 focus:ring-[--synapse]/30"
              />

              {errors.email && (
                <p className="mt-1 text-xs text-[--error]">
                  {t(errors.email.message as string)}
                </p>
              )}
            </div>
          </section>

          <section className="flex flex-col gap-4 border-t border-[--hairline] pt-4">
            <h3 className="text-sm font-semibold text-[--ink-primary]">
              {t("suppliers.drawer.businessInfo")}
            </h3>

            {/* Address */}
            <div>
              <label className="mb-1 block text-sm text-[--ink-secondary]">
                {t("suppliers.fields.address")}
                <Optional />
              </label>

              <textarea
                {...register("address")}
                rows={2}
                className="w-full rounded-md border border-[--hairline] bg-[--sunken] px-3 py-2 text-sm outline-none focus:border-[--signal] focus:ring-2 focus:ring-[--synapse]/30"
              />

              {errors.address && (
                <p className="mt-1 text-xs text-[--error]">
                  {t(errors.address.message as string)}
                </p>
              )}
            </div>

            {/* Tax Number */}
            <div>
              <label className="mb-1 block text-sm text-[--ink-secondary]">
                {t("suppliers.fields.taxNumber")}
                <Optional />
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

            {/* Status */}
            {mode === "edit" && (
              <div className="flex items-center justify-between rounded-md border border-[--hairline] px-3 py-2.5">
                <span className="text-sm text-[--ink-secondary]">
                  {t("suppliers.fields.status")}
                </span>

                <button
                  type="button"
                  role="switch"
                  aria-checked={isActive}
                  onClick={() =>
                    setValue("isActive", !isActive, {
                      shouldDirty: true,
                    })
                  }
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    isActive ? "bg-[--signal]" : "bg-[--hairline]"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                      isActive
                        ? "translate-x-5 ltr:-translate-x-5"
                        : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            )}
          </section>

          {/* Actions */}
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
                onClick={handleSubmit((values) =>
                  submit(values, true)
                )}
                className="rounded-md border disabled:cursor-not-allowed border-[--hairline] px-4 py-2 text-sm font-medium text-[--ink-primary] hover:bg-[--sunken] disabled:opacity-60"
              >
                {t("suppliers.actions.saveAndNew")}
              </button>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-[--signal] disabled:cursor-not-allowed px-4 py-2 text-sm font-medium text-white hover:bg-[--signal-hover] disabled:opacity-60"
            >
              {mode === "create"
                ? t("suppliers.actions.save")
                : t("common.actions.saveChanges")}
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