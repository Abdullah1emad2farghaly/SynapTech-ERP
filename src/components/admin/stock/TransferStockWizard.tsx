// src/components/admin/stock/TransferStockWizard.tsx
//
// Step-based, unlike RecordMovementPage's single-page form — per the
// design spec, Transfer has the highest mistake-potential in this module
// (two warehouses in play, easy to transpose source/destination), and
// the brief explicitly calls for a Review step. Steps: Product -> Source
// Warehouse -> Destination Warehouse -> Quantity+Reference -> Review.
//
// Source Warehouse is scoped to warehouses that actually hold stock of
// the selected product (via StockLevel[] passed in by the page, fetched
// from GET /api/Stock/products/{id} through the existing useProductStock
// hook) — picking a source with zero stock of the product is a
// guaranteed backend failure, so it's not offered as an option at all.
// Destination Warehouse deliberately stays the FULL warehouse list:
// transferring into a warehouse that doesn't yet stock this product is a
// legitimate "first stock" scenario, so it's not filtered the same way.
// Both still use the SAME SearchableSelect component and mutually
// exclude each other's current selection — a client-side guard against a
// transfer-to-itself request, since whether the backend rejects that on
// its own is unconfirmed. Same category of caution as
// Departments/Categories' circular-hierarchy guards, applied here to
// warehouse identity instead of hierarchy.
//
// This component owns step state and field values; the page hosting it
// owns the actual mutation call, the product-stock fetch, and
// success/error handling (matching how every other module's forms
// separate "the form" from "the page that submits it").

import { useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { SearchableSelect } from "../../common/SearchableSelect";
import type { Product } from "@/services/api/products.api";
import type { WarehouseResponse } from "@/types/warehouses.types";
import type { StockLevel } from "@/services/api/stock.api";

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
  // Per-warehouse stock levels for the currently selected product
  // (from GET /api/Stock/products/{id} via useProductStock). Undefined
  // while nothing is selected yet or the fetch hasn't resolved.
  sourceStock: StockLevel[] | undefined;
  isLoadingSourceStock: boolean;
  initialValues?: Partial<TransferFormValues>;
  isSubmitting: boolean;
  submitError: string | null;
  // Fired whenever the selected product changes (including to null), so
  // the hosting page can trigger/cancel the stock fetch. The wizard
  // itself never calls the API.
  onProductChange: (productId: string | null) => void;
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
  sourceStock,
  isLoadingSourceStock,
  initialValues,
  isSubmitting,
  submitError,
  onProductChange,
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

  // Fire once on mount if we were pre-filled with a productId (e.g. from
  // a row action elsewhere), so the page starts fetching stock right away.
  useEffect(() => {
    if (initialValues?.productId) onProductChange(initialValues.productId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Only warehouses that actually hold stock (> 0) of the selected
  // product are eligible as Source. Zero-stock rows are excluded rather
  // than shown-and-disabled, since the product picker already narrows
  // the world down to one product and a long "unavailable" list adds
  // noise without adding safety.
  const eligibleSourceEntries = (sourceStock ?? []).filter((s) => s.quantityOnHand > 0);
  const sourceWarehouseOptions = eligibleSourceEntries.map((s) => ({
    value: s.warehouseId,
    label: s.warehouseName,
    secondaryLabel: t("stock.transfer.fields.quantityAvailable", { count: s.quantityOnHand }),
  }));

  // If the previously selected source warehouse is no longer in the
  // eligible set (product changed, or stock ran out), clear it so the
  // user can't silently carry forward a stale/invalid selection.
  useEffect(() => {
    if (
      values.fromWarehouseId &&
      sourceStock !== undefined &&
      !eligibleSourceEntries.some((s) => s.warehouseId === values.fromWarehouseId)
    ) {
      setValues((v) => ({ ...v, fromWarehouseId: null }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceStock]);

  const productOptions = products.map((p) => ({ value: p.id, label: p.name, secondaryLabel: p.sku }));
  // Destination is deliberately NOT filtered by stock — see file header.
  const destWarehouseOptions = warehouses.map((w) => ({ value: w.id, label: w.name }));

  const selectedProduct = products.find((p) => p.id === values.productId);
  const sourceWarehouse = warehouses.find((w) => w.id === values.fromWarehouseId);
  const destWarehouse = warehouses.find((w) => w.id === values.toWarehouseId);
  const sourceWarehouseStockEntry = eligibleSourceEntries.find((s) => s.warehouseId === values.fromWarehouseId);

  const quantityNumber = Number(values.quantity);
  const isQuantityValid =
    values.quantity.trim().length > 0 &&
    quantityNumber > 0 &&
    (sourceWarehouseStockEntry === undefined || quantityNumber <= sourceWarehouseStockEntry.quantityOnHand);

  const hasNoEligibleSourceWarehouses =
    !!values.productId && sourceStock !== undefined && !isLoadingSourceStock && eligibleSourceEntries.length === 0;

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

  function handleProductChange(productId: string | null) {
    setValues((v) => ({ ...v, productId, fromWarehouseId: null }));
    onProductChange(productId);
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
              onChange={handleProductChange}
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
            {isLoadingSourceStock ? (
              <p className="text-sm text-[var(--ink-tertiary)]">{t("common.loading")}</p>
            ) : hasNoEligibleSourceWarehouses ? (
              <p className="text-sm text-[var(--error)]">
                {t("stock.transfer.errors.noStockAnywhere", { product: selectedProduct?.name ?? "" })}
              </p>
            ) : (
              <SearchableSelect
                options={sourceWarehouseOptions}
                value={values.fromWarehouseId}
                onChange={(value) => setValues((v) => ({ ...v, fromWarehouseId: value }))}
                placeholder={t("stock.movement.fields.warehousePlaceholder")}
                searchPlaceholder={t("stock.movement.fields.searchWarehouses")}
                excludedValues={values.toWarehouseId ? new Set([values.toWarehouseId]) : undefined}
              />
            )}
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
              options={destWarehouseOptions}
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
                max={sourceWarehouseStockEntry?.quantityOnHand}
                value={values.quantity}
                onChange={(e) => setValues((v) => ({ ...v, quantity: e.target.value }))}
                className="w-full rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--ink-primary)] focus:border-[var(--signal)] focus:outline-none focus:ring-2 focus:ring-[var(--synapse)]/30"
              />
              {sourceWarehouseStockEntry && (
                <p className="mt-1 text-xs text-[var(--ink-tertiary)]">
                  {t("stock.transfer.fields.quantityAvailable", { count: sourceWarehouseStockEntry.quantityOnHand })}
                </p>
              )}
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
            disabled={!stepIsValid[stepIndex] || isSubmitting || (stepIndex === 1 && hasNoEligibleSourceWarehouses)}
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