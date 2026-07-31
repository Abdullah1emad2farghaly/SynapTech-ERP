// src/components/admin/stock/TransferStockWizard.tsx
//
// Step-based, unlike RecordMovementPage's single-page form — per the
// design spec, Transfer has the highest mistake-potential in this module
// (two warehouses in play, easy to transpose source/destination), and
// the brief explicitly calls for a Review step. Steps: Product -> Source
// Warehouse -> Destination Warehouse -> Quantity+Reference -> Review.
//
// Source and Destination Warehouse use the SAME SearchableSelect
// component but mutually exclude each other's current selection (source
// removes itself from destination's options and vice versa) — a
// client-side guard against a transfer-to-itself request, since whether
// the backend rejects that on its own is unconfirmed. Same category of
// caution as Departments/Categories' circular-hierarchy guards, applied
// here to warehouse identity instead of hierarchy.
//
// This component owns step state and field values; the page hosting it
// owns the actual mutation call and success/error handling (matching
// how every other module's forms separate "the form" from "the page
// that submits it").

import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { SearchableSelect } from "../../common/SearchableSelect";
import type { Product } from "@/services/api/products.api";
import type { WarehouseResponse } from "@/types/warehouses.types";

export interface TransferFormValues {
  productId: string | null;
  fromWarehouseId: string | null;
  toWarehouseId: string | null;
  quantity: string;
  reference: string;
}

export interface TransferStockWizardProps {
  products: Product[];
  warehouses: WarehouseResponse[];
  initialValues?: Partial<TransferFormValues>;
  isSubmitting: boolean;
  submitError: string | null;
  onSubmit: (values: {
    productId: string;
    fromWarehouseId: string;
    toWarehouseId: string;
    quantity: number;
    reference: string | null;
  }) => void;
  onCancel: () => void;
}

const STEP_LABELS_KEYS = [
  "stock.transfer.steps.product",
  "stock.transfer.steps.source",
  "stock.transfer.steps.destination",
  "stock.transfer.steps.quantity",
  "stock.transfer.steps.review",
] as const;

export function TransferStockWizard({
  products,
  warehouses,
  initialValues,
  isSubmitting,
  submitError,
  onSubmit,
  onCancel,
}: TransferStockWizardProps) {
  const { t } = useTranslation();
  const [stepIndex, setStepIndex] = useState(0);
  const [values, setValues] = useState<TransferFormValues>({
    productId: initialValues?.productId ?? null,
    fromWarehouseId: initialValues?.fromWarehouseId ?? null,
    toWarehouseId: initialValues?.toWarehouseId ?? null,
    quantity: initialValues?.quantity ?? "",
    reference: initialValues?.reference ?? "",
  });

  const productOptions = products.map((p) => ({ value: p.id, label: p.name, secondaryLabel: p.sku }));
  const warehouseOptions = warehouses.map((w) => ({ value: w.id, label: w.name }));

  const selectedProduct = products.find((p) => p.id === values.productId);
  const sourceWarehouse = warehouses.find((w) => w.id === values.fromWarehouseId);
  const destWarehouse = warehouses.find((w) => w.id === values.toWarehouseId);

  const quantityNumber = Number(values.quantity);
  const isQuantityValid = values.quantity.trim().length > 0 && quantityNumber > 0;

  const stepIsValid = [
    !!values.productId,
    !!values.fromWarehouseId,
    !!values.toWarehouseId,
    isQuantityValid,
    true, // Review step has nothing further to validate
  ];

  const isLastStep = stepIndex === STEP_LABELS_KEYS.length - 1;

  function goNext() {
    if (!stepIsValid[stepIndex]) return;
    if (isLastStep) {
      onSubmit({
        productId: values.productId!,
        fromWarehouseId: values.fromWarehouseId!,
        toWarehouseId: values.toWarehouseId!,
        quantity: quantityNumber,
        reference: values.reference.trim() || null,
      });
      return;
    }
    setStepIndex((i) => i + 1);
  }

  function goBack() {
    if (stepIndex === 0) {
      onCancel();
      return;
    }
    setStepIndex((i) => i - 1);
  }

  function goToStep(index: number) {
    // Only allow jumping to a step that's already been validly completed.
    if (index < stepIndex) setStepIndex(index);
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Step indicator */}
      <ol className="flex items-center gap-2 overflow-x-auto">
        {STEP_LABELS_KEYS.map((key, index) => {
          const isActive = index === stepIndex;
          const isCompleted = index < stepIndex;
          return (
            <li key={key} className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => goToStep(index)}
                aria-current={isActive ? "step" : undefined}
                disabled={!isCompleted && !isActive}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors duration-150 ${
                  isActive
                    ? "bg-[var(--signal)] text-white"
                    : isCompleted
                      ? "bg-[var(--sunken)] text-[var(--ink-primary)] hover:bg-[var(--hairline)]"
                      : "bg-[var(--sunken)] text-[var(--ink-tertiary)]"
                }`}
              >
                {index + 1}. {t(key)}
              </button>
              {index < STEP_LABELS_KEYS.length - 1 && (
                <span className="h-px w-4 bg-[var(--hairline)]" aria-hidden="true" />
              )}
            </li>
          );
        })}
      </ol>

      <div className="rounded-[16px] border border-[var(--hairline)] bg-[var(--panel)] p-6">
        {stepIndex === 0 && (
          <div>
            <h2 className="mb-1 text-base font-semibold text-[var(--ink-primary)]">
              {t("stock.transfer.steps.product")}
            </h2>
            <p className="mb-4 text-sm text-[var(--ink-tertiary)]">
              {t("stock.transfer.stepHints.product")}
            </p>
            <SearchableSelect
              options={productOptions}
              value={values.productId}
              onChange={(value) => setValues((v) => ({ ...v, productId: value }))}
              placeholder={t("stock.movement.fields.productPlaceholder")}
              searchPlaceholder={t("stock.movement.fields.searchProducts")}
            />
          </div>
        )}

        {stepIndex === 1 && (
          <div>
            <h2 className="mb-1 text-base font-semibold text-[var(--ink-primary)]">
              {t("stock.transfer.steps.source")}
            </h2>
            <p className="mb-4 text-sm text-[var(--ink-tertiary)]">
              {t("stock.transfer.stepHints.source")}
            </p>
            <SearchableSelect
              options={warehouseOptions}
              value={values.fromWarehouseId}
              onChange={(value) => setValues((v) => ({ ...v, fromWarehouseId: value }))}
              placeholder={t("stock.movement.fields.warehousePlaceholder")}
              searchPlaceholder={t("stock.movement.fields.searchWarehouses")}
              excludedValues={values.toWarehouseId ? new Set([values.toWarehouseId]) : undefined}
            />
          </div>
        )}

        {stepIndex === 2 && (
          <div>
            <h2 className="mb-1 text-base font-semibold text-[var(--ink-primary)]">
              {t("stock.transfer.steps.destination")}
            </h2>
            <p className="mb-4 text-sm text-[var(--ink-tertiary)]">
              {t("stock.transfer.stepHints.destination")}
            </p>
            <SearchableSelect
              options={warehouseOptions}
              value={values.toWarehouseId}
              onChange={(value) => setValues((v) => ({ ...v, toWarehouseId: value }))}
              placeholder={t("stock.movement.fields.warehousePlaceholder")}
              searchPlaceholder={t("stock.movement.fields.searchWarehouses")}
              excludedValues={values.fromWarehouseId ? new Set([values.fromWarehouseId]) : undefined}
            />
          </div>
        )}

        {stepIndex === 3 && (
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="mb-1 text-base font-semibold text-[var(--ink-primary)]">
                {t("stock.transfer.steps.quantity")}
              </h2>
              <p className="mb-4 text-sm text-[var(--ink-tertiary)]">
                {t("stock.transfer.stepHints.quantity")}
              </p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--ink-primary)]">
                {t("stock.movement.fields.quantity")}
              </label>
              <input
                type="number"
                min={1}
                value={values.quantity}
                onChange={(e) => setValues((v) => ({ ...v, quantity: e.target.value }))}
                className="w-full rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--ink-primary)] focus:border-[var(--signal)] focus:outline-none focus:ring-2 focus:ring-[var(--synapse)]/30"
              />
              {values.quantity.trim().length > 0 && !isQuantityValid && (
                <p className="mt-1 text-xs text-[var(--error)]">
                  {t("stock.movement.errors.quantityInvalid")}
                </p>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--ink-primary)]">
                {t("stock.movement.fields.reference")}
              </label>
              <input
                value={values.reference}
                onChange={(e) => setValues((v) => ({ ...v, reference: e.target.value }))}
                placeholder={t("stock.movement.fields.referencePlaceholder")}
                className="w-full rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--ink-primary)] focus:border-[var(--signal)] focus:outline-none focus:ring-2 focus:ring-[var(--synapse)]/30"
              />
            </div>
          </div>
        )}

        {isLastStep && (
          <div>
            <h2 className="mb-1 text-base font-semibold text-[var(--ink-primary)]">
              {t("stock.transfer.steps.review")}
            </h2>
            <p className="mb-4 text-sm text-[var(--ink-tertiary)]">
              {t("stock.transfer.stepHints.review")}
            </p>

            {/* The single most important visual element on this page — a
                plain-language restatement of the whole transfer, since
                there's no undo and this is the last chance to catch a
                transposed source/destination. */}
            <div className="rounded-[10px] border border-[var(--signal)] bg-[var(--sunken)] p-4 text-base leading-relaxed text-[var(--ink-primary)]">
              <Trans
                i18nKey="stock.transfer.reviewSentence"
                values={{
                  quantity: quantityNumber,
                  product: selectedProduct?.name ?? "",
                  source: sourceWarehouse?.name ?? "",
                  destination: destWarehouse?.name ?? "",
                }}
              />
            </div>

            {values.reference.trim() && (
              <p className="mt-3 text-sm text-[var(--ink-tertiary)]">
                {t("stock.movement.fields.reference")}: {values.reference.trim()}
              </p>
            )}

            {submitError && <p className="mt-3 text-sm text-[var(--error)]">{submitError}</p>}
          </div>
        )}

        <div className="mt-6 flex justify-between border-t border-[var(--hairline)] pt-4">
          <button
            type="button"
            onClick={goBack}
            className="inline-flex items-center gap-1.5 rounded-[10px] px-4 py-2 text-sm font-medium text-[var(--ink-secondary)] hover:bg-[var(--sunken)]"
          >
            <ArrowLeft size={14} className="rtl:rotate-180" />
            {stepIndex === 0 ? t("users.actions.cancel") : t("stock.transfer.backStep")}
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={!stepIsValid[stepIndex] || isSubmitting}
            className="inline-flex items-center gap-1.5 rounded-[10px] bg-[var(--signal)] px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-[var(--signal-hover)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLastStep
              ? isSubmitting
                ? t("stock.transfer.submitting")
                : t("stock.transfer.confirmTransfer")
              : t("stock.transfer.nextStep")}
            {!isLastStep && <ArrowRight size={14} className="rtl:rotate-180" />}
          </button>
        </div>
      </div>
    </div>
  );
}
