// Project path: src/pages/admin/stock/RecordMovementPage.tsx
//
// CHANGED: Product↔Warehouse cross-filtering added, using
// useWarehouseStock/useProductStock — applied unconditionally, same as
// Purchase/Sales Orders (previous version gated this to only "Out"/
// "AdjustmentDecrease" movement types; removed per instruction to match
// the same idea everywhere). Note this means for "In"/"AdjustmentIncrease"
// movements, Product will also be narrowed to what's already stocked at
// the chosen warehouse, which can make it impossible to record a first-time
// stock-in for a brand-new product/warehouse pairing — flagged again here,
// same as the Purchase Orders note.
//
// - Choosing a warehouse narrows Product to items with quantityOnHand > 0
//   there.
// - Choosing a product (before a warehouse is chosen) narrows Warehouse to
//   ones stocking it.
// - Changing warehouse/product in a way that invalidates the current
//   pairing clears the now-invalid selection, mirroring the Purchase/Sales
//   Orders line-clearing pattern.

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router";
import { ArrowLeft } from "lucide-react";
import { SearchableSelect } from "../../../components/common/SearchableSelect";
import { MovementConfirmation } from "../../../components/admin/stock/MovementConfirmation";
import { useRecordMovement, useWarehouseStock, useProductStock } from "../../../hooks/useStock";
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

  const { data: products = [], isRefetching } = useProducts();
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

  // Product driving the warehouse narrowing — only relevant while no
  // warehouse has been chosen yet.
  const productIdForWarehouseFilter = !form.warehouseId ? form.productId ?? undefined : undefined;

  const { data: warehouseStockLevels, isLoading: warehouseStockLoading } = useWarehouseStock(
    form.warehouseId ?? undefined
  );

  const { data: productStockLevels, isLoading: productStockLoading } = useProductStock(
    productIdForWarehouseFilter
  );

  const rawProductOptions = useMemo(
    () => products.map((p) => ({ value: p.id, label: p.name, secondaryLabel: p.sku })),
    [products]
  );

  const rawWarehouseOptions = useMemo(
    () => warehouses.map((w) => ({ value: w.id, label: w.name })),
    [warehouses]
  );

  const warehouseFilteredProductOptions = useMemo(() => {
    if (!warehouseStockLevels) return undefined;
    return warehouseStockLevels
      .filter((s) => s.quantityOnHand > 0)
      .map((s) => ({ value: s.productId, label: s.productName, secondaryLabel: s.productSku }));
  }, [warehouseStockLevels]);

  const productFilteredWarehouseOptions = useMemo(() => {
    if (!productStockLevels) return undefined;
    return productStockLevels
      .filter((s) => s.quantityOnHand > 0)
      .map((s) => ({ value: s.warehouseId, label: s.warehouseName }));
  }, [productStockLevels]);

  const productOptions = form.warehouseId ? (warehouseFilteredProductOptions ?? []) : rawProductOptions;
  const productOptionsLoading = Boolean(form.warehouseId) && warehouseStockLoading;

  const warehouseOptions = productFilteredWarehouseOptions ?? rawWarehouseOptions;
  const warehouseOptionsLoading = Boolean(productIdForWarehouseFilter) && productStockLoading;

  // Clear the product if it's no longer valid for the current warehouse
  // (user-driven changes only, not on initial mount from the prefilled
  // searchParams).
  const isFirstFilterRun = useRef(true);
  useEffect(() => {
    if (isFirstFilterRun.current) {
      isFirstFilterRun.current = false;
      return;
    }
    if (!form.warehouseId || !warehouseFilteredProductOptions) return;

    const allowed = new Set(warehouseFilteredProductOptions.map((o) => o.value));
    if (form.productId && !allowed.has(form.productId)) {
      setForm((f) => ({ ...f, productId: null }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.warehouseId, warehouseFilteredProductOptions]);

  const productOptionsFinal = productOptions;

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
                options={productOptionsFinal}
                value={form.productId}
                onChange={(value) =>
                  setForm((f) => ({
                    ...f,
                    productId: value,
                  }))
                }
                placeholder={ productOptionsLoading ? t(
                  "common.loading"
                ): t("stock.movement.fields.productPlaceholder")}
                searchPlaceholder={t(
                  "stock.movement.fields.productPlaceholder"
                )}
                disabled={productOptionsLoading}
              />

              {touched.productId && !form.productId && (
                <p className="mt-1 text-xs text-[var(--error)]">
                  {t("stock.movement.errors.required")}
                </p>
              )}
              {form.warehouseId && (
                <p className="mt-1 text-xs text-[var(--ink-tertiary)]">
                  {t("stock.movement.warehouseFilteredHint")}
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
                placeholder={ warehouseOptionsLoading ? t(
                  "common.loading"
                ):t(
                  "stock.movement.fields.warehousePlaceholder"
                )}
                searchPlaceholder={t(
                  "stock.movement.fields.searchWarehouses"
                )}
                disabled={warehouseOptionsLoading}
              />

              {touched.warehouseId && !form.warehouseId && (
                <p className="mt-1 text-xs text-[var(--error)]">
                  {t("stock.movement.errors.required")}
                </p>
              )}
              {productIdForWarehouseFilter && (
                <p className="mt-1 text-xs text-[var(--ink-tertiary)]">
                  {t("stock.movement.productFilteredHint")}
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