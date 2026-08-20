// Project path: src/pages/admin/stock/RecordMovementPage.tsx

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router";
import { ArrowLeft } from "lucide-react";
import { SearchableSelect } from "../../../components/common/SearchableSelect";
import { MovementConfirmation } from "../../../components/admin/stock/MovementConfirmation";
import { useRecordMovement } from "../../../hooks/useStock";
import { useProducts } from "../../../hooks/useProducts";
import { useWarehouses } from "../../../hooks/useWarehouses";
import type { MovementResponse } from "../../../services/api/stock.api";
import axios from "axios";
import { handleErrors } from "@/utils/HandleErrors";

interface FormState {
  productId: string | null;
  warehouseId: string | null;
  movementType: string;
  quantity: string;
  reference: string;
}



export function RecordMovementPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { data: products = [] } = useProducts();
  const { data: warehouses = [] } = useWarehouses();
  const recordMovementMutation = useRecordMovement();

  const movementTypeOptions = [
    {
      value: "In",
      label: t("stock.movement.In"),
    },
    {
      value: "Out",
      label: t("stock.movement.Out"),
    },
    {
      value: "AdjustmentIncrease",
      label: t("stock.movement.AdjustmentIncrease"),
    },
    {
      value: "AdjustmentDecrease",
      label: t("stock.movement.AdjustmentDecrease"),
    },
  ];

  const [form, setForm] = useState<FormState>({
    productId: searchParams.get("productId"),
    warehouseId: searchParams.get("warehouseId"),
    movementType: "",
    quantity: "",
    reference: "",
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successResult, setSuccessResult] =
    useState<MovementResponse | null>(null);

  const productOptions = products.map((p) => ({
    value: p.id,
    label: p.name,
    secondaryLabel: p.sku,
  }));

  const warehouseOptions = warehouses.map((w) => ({
    value: w.id,
    label: w.name,
  }));

  const quantityNumber = Number(form.quantity);

  const isQuantityValid =
    form.quantity.trim().length > 0 && quantityNumber > 0;

  const isValid =
    !!form.productId &&
    !!form.warehouseId &&
    form.movementType.trim().length > 0 &&
    isQuantityValid;

  function resetForm(keepContext: boolean) {
    setForm({
      productId: keepContext ? form.productId : null,
      warehouseId: keepContext ? form.warehouseId : null,
      movementType: "",
      quantity: "",
      reference: "",
    });

    setTouched({});
    setSubmitError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setTouched({
      productId: true,
      warehouseId: true,
      movementType: true,
      quantity: true,
    });

    if (!isValid) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = await recordMovementMutation.mutateAsync({
        productId: form.productId!,
        warehouseId: form.warehouseId!,
        movementType: form.movementType.trim(),
        quantity: quantityNumber,
        reference: form.reference.trim() || null,
      });

      setSuccessResult(result);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        handleErrors(error.response?.data.errors);
      }

      setSubmitError(t("common.errors.actionFailed"));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (successResult) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-4">
        <MovementConfirmation
          movement={successResult}
          onRecordAnother={() => {
            setSuccessResult(null);
            resetForm(true);
          }}
          onDone={() => navigate("/inventory/stock")}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto flex py-6 md:px-6 px-2 flex-col gap-4">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]"
      >
        <ArrowLeft size={15} className="rtl:rotate-180" />
        {t("stock.movement.back")}
      </button>

      <div className="rounded-[16px] border border-[var(--hairline)] bg-[var(--panel)] p-6">
        <h1 className="mb-1 text-lg font-semibold text-[var(--ink-primary)]">
          {t("stock.movement.title")}
        </h1>

        <p className="mb-5 text-sm text-[var(--ink-tertiary)]">
          {t("stock.movement.subtitle")}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid md:grid-cols-2 gap-3">
            {/* Product */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--ink-primary)]">
                {t("stock.movement.fields.product")}
              </label>

              <SearchableSelect
                options={productOptions}
                value={form.productId}
                onChange={(value) =>
                  setForm((f) => ({
                    ...f,
                    productId: value,
                  }))
                }
                placeholder={t(
                  "stock.movement.fields.productPlaceholder"
                )}
                searchPlaceholder={t(
                  "stock.movement.fields.searchProducts"
                )}
              />

              {touched.productId && !form.productId && (
                <p className="mt-1 text-xs text-[var(--error)]">
                  {t("stock.movement.errors.required")}
                </p>
              )}
            </div>

            {/* Warehouse */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--ink-primary)]">
                {t("stock.movement.fields.warehouse")}
              </label>

              <SearchableSelect
                options={warehouseOptions}
                value={form.warehouseId}
                onChange={(value) =>
                  setForm((f) => ({
                    ...f,
                    warehouseId: value,
                  }))
                }
                placeholder={t(
                  "stock.movement.fields.warehousePlaceholder"
                )}
                searchPlaceholder={t(
                  "stock.movement.fields.searchWarehouses"
                )}
              />

              {touched.warehouseId && !form.warehouseId && (
                <p className="mt-1 text-xs text-[var(--error)]">
                  {t("stock.movement.errors.required")}
                </p>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            {/* Movement Type */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--ink-primary)]">
                {t("stock.movement.fields.movementType")}
              </label>

              <SearchableSelect
                options={movementTypeOptions}
                value={form.movementType || null}
                onChange={(value) =>
                  setForm((f) => ({
                    ...f,
                    movementType: value ?? "",
                  }))
                }
                placeholder="Select movement type"
                searchPlaceholder="Search movement type..."
              />

              {touched.movementType &&
                form.movementType.trim().length === 0 && (
                  <p className="mt-1 text-xs text-[var(--error)]">
                    {t("stock.movement.errors.required")}
                  </p>
                )}

              <p className="mt-1 text-xs text-[var(--ink-tertiary)]">
                {t("stock.movement.movementTypeNote")}
              </p>
            </div>

            {/* Quantity */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--ink-primary)]">
                {t("stock.movement.fields.quantity")}
              </label>

              <input
                type="number"
                min={1}
                value={form.quantity}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    quantity: e.target.value,
                  }))
                }
                onBlur={() =>
                  setTouched((tt) => ({
                    ...tt,
                    quantity: true,
                  }))
                }
                className="w-full rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--ink-primary)] focus:border-[var(--signal)] focus:outline-none focus:ring-2 focus:ring-[var(--synapse)]/30"
              />

              {touched.quantity && !isQuantityValid && (
                <p className="mt-1 text-xs text-[var(--error)]">
                  {t("stock.movement.errors.quantityInvalid")}
                </p>
              )}
            </div>
          </div>

          {/* Reference */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--ink-primary)]">
              {t("stock.movement.fields.reference")}
            </label>

            <input
              value={form.reference}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  reference: e.target.value,
                }))
              }
              placeholder={t(
                "stock.movement.fields.referencePlaceholder"
              )}
              className="w-full rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--ink-primary)] focus:border-[var(--signal)] focus:outline-none focus:ring-2 focus:ring-[var(--synapse)]/30"
            />
          </div>

          {submitError && (
            <p className="text-sm text-[var(--error)]">
              {submitError}
            </p>
          )}

          <div className="mt-2 flex justify-end gap-2 border-t border-[var(--hairline)] pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-[10px] px-4 py-2 text-sm font-medium text-[var(--ink-secondary)] hover:bg-[var(--sunken)]"
            >
              {t("users.actions.cancel")}
            </button>

            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="rounded-[10px] bg-[var(--signal)] px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-[var(--signal-hover)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting
                ? t("stock.movement.submitting")
                : t("stock.movement.submit")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}