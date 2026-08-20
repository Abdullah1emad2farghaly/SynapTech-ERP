// src/components/admin/customers/CustomerDrawer.tsx
//
// Create + Edit combined, matching DepartmentDrawer/BranchDrawer's
// one-component pattern.
//
// POST /api/Customers
// {
//   name,
//   contactName,
//   phone,
//   email,
//   address,
//   taxNumber
// }
//
// PUT /api/Customers/{id}
// {
//   name,
//   contactName,
//   phone,
//   email,
//   address,
//   taxNumber,
//   isActive
// }

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

import { Drawer } from "../../common/Drawer";
import { ConfirmationDialog } from "../../common/ConfirmationDialog";

export interface CustomerFormValues {
  name: string;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  taxNumber: string | null;
  isActive: boolean;
}

export interface CustomerDrawerProps {
  open: boolean;
  onClose: () => void;

  /** Presence of this (with an id) puts the drawer in Edit mode. */
  initialValues?: (CustomerFormValues & { id: string }) | null;

  onSubmit: (
    values: CustomerFormValues,
    id?: string
  ) => Promise<void>;

  serverError?: {
    field?: "email";
    messageKey: string;
  } | null;
}

const EMPTY_VALUES: CustomerFormValues = {
  name: "",
  contactName: null,
  phone: null,
  email: null,
  address: null,
  taxNumber: null,
  isActive: true,
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function CustomerDrawer({
  open,
  onClose,
  initialValues,
  onSubmit,
  serverError,
}: CustomerDrawerProps) {
  const { t } = useTranslation();

  const isEditMode = !!initialValues;

  const [values, setValues] =
    useState<CustomerFormValues>(EMPTY_VALUES);

  const [touched, setTouched] = useState<{
    name?: boolean;
    email?: boolean;
  }>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] =
    useState(false);

  // ------------------------------------------------------------
  // Initialize form when drawer opens
  // ------------------------------------------------------------

  useEffect(() => {
    if (!open) return;

    setValues(initialValues ?? EMPTY_VALUES);
    setTouched({});
    setIsDirty(false);
    setShowDiscardConfirm(false);
  }, [open, initialValues]);

  // ------------------------------------------------------------
  // Normalized values for UI validation
  // ------------------------------------------------------------

  const name = values.name ?? "";
  const email = values.email ?? "";

  // ------------------------------------------------------------
  // Validation
  // ------------------------------------------------------------

  const nameError =
    !!touched.name && name.trim().length === 0;

  const emailError =
    !!touched.email &&
    email.trim().length > 0 &&
    !EMAIL_PATTERN.test(email.trim());

  const isValid =
    name.trim().length > 0 &&
    (
      email.trim().length === 0 ||
      EMAIL_PATTERN.test(email.trim())
    );

  // ------------------------------------------------------------
  // Update field
  // ------------------------------------------------------------

  function updateField<K extends keyof CustomerFormValues>(
    key: K,
    value: CustomerFormValues[K]
  ) {
    setValues((current) => ({
      ...current,
      [key]: value,
    }));

    setIsDirty(true);
  }

  // ------------------------------------------------------------
  // Convert empty strings to null before sending to API
  // ------------------------------------------------------------

  function normalizeCustomerValues(
    formValues: CustomerFormValues
  ): CustomerFormValues {
    return {
      name: formValues.name?.trim() || "",
      contactName: formValues.contactName?.trim() || null,
      phone: formValues.phone?.trim() || null,
      email: formValues.email?.trim() || null,
      address: formValues.address?.trim() || null,
      taxNumber: formValues.taxNumber?.trim() || null,
      isActive: formValues.isActive,
    };
  }

  // ------------------------------------------------------------
  // Reset and close
  // ------------------------------------------------------------

  function resetAndClose() {
    setValues(EMPTY_VALUES);
    setTouched({});
    setIsDirty(false);
    setShowDiscardConfirm(false);

    onClose();
  }

  // ------------------------------------------------------------
  // Close request
  // ------------------------------------------------------------

  function requestClose() {
    if (isDirty) {
      setShowDiscardConfirm(true);
      return;
    }

    resetAndClose();
  }

  // ------------------------------------------------------------
  // Submit core
  // ------------------------------------------------------------

  async function submitCore(): Promise<boolean> {
    // Show validation errors
    setTouched({
      name: true,
      email: true,
    });

    // Name is required
    if (!isValid) {
      return false;
    }

    setIsSubmitting(true);

    try {
      /*
       * Convert:
       *
       * ""
       *
       * into:
       *
       * null
       *
       * before sending the request.
       */
      const payload = normalizeCustomerValues(values);

      await onSubmit(
        payload,
        initialValues?.id
      );

      return true;
    } finally {
      setIsSubmitting(false);
    }
  }

  // ------------------------------------------------------------
  // Normal Save
  // ------------------------------------------------------------

  async function handleSave(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    const success = await submitCore();

    if (success) {
      resetAndClose();
    }
  }

  // ------------------------------------------------------------
  // Save & New
  // ------------------------------------------------------------

  async function handleSaveAndNew() {
    const success = await submitCore();

    if (!success) {
      return;
    }

    toast.success(
      t("customers.toast.created", {
        name: values.name ?? "",
      })
    );

    setValues(EMPTY_VALUES);
    setTouched({});
    setIsDirty(false);
  }

  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------

  return (
    <>
      <Drawer
        open={open}
        onClose={requestClose}
        title={
          isEditMode
            ? t("customers.create.editTitle")
            : t("customers.create.title")
        }
      >
        <form
          onSubmit={handleSave}
          className="flex flex-col gap-6"
        >


          <fieldset className="flex flex-col gap-4">
            {/* <legend className="mb-1 text-xs font-medium uppercase tracking-wide text-[var(--ink-tertiary)]">
              {t("customers.create.sections.business")}
            </legend> */}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--ink-secondary)]">
                {t("customers.create.fields.name")}
              </label>

              <input
                value={values.name ?? ""}
                onChange={(e) =>
                  updateField(
                    "name",
                    e.target.value
                  )
                }
                onBlur={() =>
                  setTouched((current) => ({
                    ...current,
                    name: true,
                  }))
                }
                className="w-full rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--ink-primary)] focus:border-[var(--signal)] focus:outline-none focus:ring-2 focus:ring-[var(--synapse)]/30"
              />

              {nameError && (
                <p className="mt-1 text-xs text-[var(--error)]">
                  {t(
                    "customers.create.errors.required"
                  )}
                </p>
              )}
            </div>
          </fieldset>

          {/* ================================================== */}
          {/* Contact Information */}
          {/* ================================================== */}

          <fieldset className="flex flex-col gap-4">


            {/* Contact Name */}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--ink-secondary)]">
                {t(
                  "customers.create.fields.contactName"
                )}
                <span className="text-[var(--ink-tertiary)]">
                  {
                    " "
                  }
                  ({
                    t("common.optional")
                  })
                </span>
              </label>

              <input
                value={values.contactName ?? ""}
                onChange={(e) =>
                  updateField(
                    "contactName",
                    e.target.value
                  )
                }
                className="w-full rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--ink-primary)] focus:border-[var(--signal)] focus:outline-none focus:ring-2 focus:ring-[var(--synapse)]/30"
              />
            </div>

            {/* Phone + Email */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Phone */}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--ink-secondary)]">
                  {t(
                    "customers.create.fields.phone"
                  )}
                  <span className="text-[var(--ink-tertiary)]">
                  {
                    " "
                  }
                  ({
                    t("common.optional")
                  })
                </span>
                </label>

                <input
                  type="tel"
                  dir="ltr"
                  value={values.phone ?? ""}
                  onChange={(e) =>
                    updateField(
                      "phone",
                      e.target.value
                    )
                  }
                  className="w-full rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] px-3 py-2 text-start text-sm text-[var(--ink-primary)] focus:border-[var(--signal)] focus:outline-none focus:ring-2 focus:ring-[var(--synapse)]/30"
                />
              </div>

              {/* Email */}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--ink-secondary)]">
                  {t(
                    "customers.create.fields.email"
                  )}
                  <span className="text-[var(--ink-tertiary)]">
                  {
                    " "
                  }
                  ({
                    t("common.optional")
                  })
                </span>
                </label>

                <input
                  type="email"
                  dir="ltr"
                  value={values.email ?? ""}
                  onChange={(e) =>
                    updateField(
                      "email",
                      e.target.value
                    )
                  }
                  onBlur={() =>
                    setTouched((current) => ({
                      ...current,
                      email: true,
                    }))
                  }
                  className="w-full rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] px-3 py-2 text-start text-sm text-[var(--ink-primary)] focus:border-[var(--signal)] focus:outline-none focus:ring-2 focus:ring-[var(--synapse)]/30"
                />

                {emailError && (
                  <p className="mt-1 text-xs text-[var(--error)]">
                    {t(
                      "customers.create.errors.invalidEmail"
                    )}
                  </p>
                )}

                {serverError?.field === "email" && (
                  <p className="mt-1 text-xs text-[var(--error)]">
                    {t(serverError.messageKey)}
                  </p>
                )}
              </div>
            </div>
          </fieldset>

          {/* ================================================== */}
          {/* Address */}
          {/* ================================================== */}

          <fieldset className="flex flex-col gap-4">

            {/* Address */}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--ink-secondary)]">
                {t(
                  "customers.create.fields.address"
                )}
                <span className="text-[var(--ink-tertiary)]">
                  {
                    " "
                  }
                  ({
                    t("common.optional")
                  })
                </span>
              </label>

              <textarea
                value={values.address ?? ""}
                onChange={(e) =>
                  updateField(
                    "address",
                    e.target.value
                  )
                }
                rows={2}
                className="w-full resize-none rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--ink-primary)] focus:border-[var(--signal)] focus:outline-none focus:ring-2 focus:ring-[var(--synapse)]/30"
              />
            </div>

            {/* Tax Number */}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--ink-secondary)]">
                {
                  t("customers.create.fields.taxNumber")
                }
                <span className="text-[var(--ink-tertiary)]">
                  {
                    " "
                  }
                  ({
                    t("common.optional")
                  })
                </span>
              </label>

              <input
                value={values.taxNumber ?? ""}
                onChange={(e) =>
                  updateField(
                    "taxNumber",
                    e.target.value
                  )
                }
                className="w-full rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] px-3 py-2 font-mono text-sm text-[var(--ink-primary)] focus:border-[var(--signal)] focus:outline-none focus:ring-2 focus:ring-[var(--synapse)]/30"
              />
            </div>
          </fieldset>

          {/* ================================================== */}
          {/* Active Status - Edit Only */}
          {/* ================================================== */}

          {isEditMode && (
            <label className="flex items-center gap-2 text-sm text-[var(--ink-primary)]">
              <input
                type="checkbox"
                checked={values.isActive}
                onChange={(e) =>
                  updateField(
                    "isActive",
                    e.target.checked
                  )
                }
                className="h-4 w-4 rounded-[4px] border-[var(--hairline)]"
              />

              {t("users.status.active")}
            </label>
          )}

          {/* ================================================== */}
          {/* Actions */}
          {/* ================================================== */}

          <div className="mt-2 flex flex-wrap justify-end gap-2 border-t border-[var(--hairline)] pt-4">
            {/* Cancel */}

            <button
              type="button"
              onClick={requestClose}
              className="rounded-[10px] px-4 py-2 text-sm font-medium text-[var(--ink-secondary)] hover:bg-[var(--sunken)]"
            >
              {t("users.actions.cancel")}
            </button>

            {/* Save & New - Create Only */}

            {!isEditMode && (
              <button
                type="button"
                onClick={handleSaveAndNew}
                disabled={
                  !isValid ||
                  isSubmitting
                }
                className="rounded-[10px] border border-[var(--hairline)] px-4 py-2 text-sm font-medium text-[var(--ink-primary)] hover:bg-[var(--sunken)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t(
                  "customers.create.saveAndNew"
                )}
              </button>
            )}

            {/* Save */}

            <button
              type="submit"
              disabled={
                !isValid ||
                isSubmitting
              }
              className="rounded-[10px] bg-[var(--signal)] px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-[var(--signal-hover)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting
                ? t(
                  "customers.create.submitting"
                )
                : isEditMode
                  ? t("users.actions.save")
                  : t(
                    "customers.list.createCustomer"
                  )}
            </button>
          </div>
        </form>
      </Drawer>

      {/* ====================================================== */}
      {/* Unsaved Changes Confirmation */}
      {/* ====================================================== */}

      <ConfirmationDialog
        open={showDiscardConfirm}
        tone="destructive"
        title={t(
          "customers.create.unsavedChangesTitle"
        )}
        body={t(
          "customers.create.unsavedChangesBody"
        )}
        confirmLabel={t(
          "customers.create.discard"
        )}
        cancelLabel={t(
          "customers.create.keepEditing"
        )}
        onConfirm={resetAndClose}
        onCancel={() =>
          setShowDiscardConfirm(false)
        }
      />
    </>
  );
}