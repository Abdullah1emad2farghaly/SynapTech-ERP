// src/components/admin/products/ProductDrawer.tsx
//
// Single drawer instance handling Create, Edit, and Duplicate — same combined
// pattern as DepartmentDrawer/BranchDrawer (Section 5.2/5.3). Duplicate is UI
// composition (pre-fills Create from an existing record), not a new endpoint,
// per Section 13 decision #5.
//
// Uses React Hook Form + Zod (see schemas/product.schema.ts) rather than the plain
// useState pattern DepartmentDrawer/BranchDrawer use — a deliberate, scoped choice
// for this new module, not a retroactive change to the other two drawers.
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { Drawer } from "../../common/Drawer";
import {
  productFormDefaultValues,
  productFormSchema,
  type ProductFormValues,
} from "../../../schemas/product.schema";
import { useCreateProduct, useUpdateProduct } from "../../../hooks/useProducts";
import { useCategories } from "../../../hooks/useCategories";
import type { Product } from "../../../services/api/products.api";
import axios from "axios";
import { handleErrors } from "@/utils/HandleErrors";

export type ProductDrawerMode = "create" | "edit" | "duplicate";

export interface ProductDrawerProps {
  open: boolean;
  mode: ProductDrawerMode;
  product?: Product | null;
  onClose: () => void;
}

function toFormValues(product: Product, mode: ProductDrawerMode): ProductFormValues {
  return {
    sku: mode === "duplicate" ? "" : product.sku,
    name: mode === "duplicate" ? `${product.name} (${"Copy"})` : product.name,
    description: product.description ?? "",
    categoryId: product?.categoryId,
    unitOfMeasure: product.unitOfMeasure,
    costPrice: product.costPrice,
    salePrice: product.salePrice,
    isActive: mode === "duplicate" ? true : product.isActive,
  };
}

export function ProductDrawer({
  open,
  mode,
  product,
  onClose,
}: ProductDrawerProps) {
  const { t } = useTranslation();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const {
    data: categories,
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
    refetch: refetchCategories,
  } = useCategories();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: productFormDefaultValues,
  });

  useEffect(() => {
    if (!open) return;
    if ((mode === "edit" || mode === "duplicate") && product) {
      reset(toFormValues(product, mode));
    } else {
      reset(productFormDefaultValues);
    }
  }, [open, mode, product, reset]);

  const isEditing = mode === "edit" && Boolean(product);

  async function onSubmit(values: ProductFormValues): Promise<void> {
    try {
      if (isEditing && product) {
        console.log(product)
        await updateProduct.mutateAsync({
          id: product.id,
          payload: {
            name: values.name,
            sku: product.sku,
            description: values.description || undefined,
            categoryId: values.categoryId,
            unitOfMeasure: values.unitOfMeasure,
            costPrice: values.costPrice,
            salePrice: values.salePrice,
            isActive: values.isActive,
          },
        });
        toast.success(t("products.toasts.updateSuccess") ?? "");
      } else {
        await createProduct.mutateAsync({
          sku: values.sku,
          name: values.name,
          description: values.description || undefined,
          categoryId: values.categoryId,
          unitOfMeasure: values.unitOfMeasure,
          costPrice: values.costPrice,
          salePrice: values.salePrice,
        });
        toast.success(t("products.toasts.createSuccess") ?? "");
      }
      onClose();
    } catch (error){
      if(axios.isAxiosError(error)){
        console.log(error.response?.data.errors)
        handleErrors(error.response?.data.errors)
      }
    }
  }

  const titleKey =
    mode === "edit"
      ? "products.drawer.editTitle"
      : mode === "duplicate"
      ? "products.drawer.duplicateTitle"
      : "products.drawer.createTitle";

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={t(titleKey)}
      subtitle={t("products.drawer.subtitle") ?? undefined}
      widthClassName="w-full sm:w-[480px]"
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex h-full flex-col"
        noValidate
      >
        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
          <fieldset className="space-y-4">
            <legend className="text-sm font-semibold text-[var(--ink-primary)]">
              {t("products.drawer.sections.basicInfo")}
            </legend>

            <div>
              <label
                htmlFor="product-sku"
                className="mb-1.5 block text-sm font-medium text-[var(--ink-primary)]"
              >
                {t("products.form.sku")}
                <span className="ml-0.5 text-[var(--error)]" aria-hidden="true">
                  *
                </span>
              </label>
              <input
                id="product-sku"
                type="text"
                disabled={isEditing}
                aria-required="true"
                aria-invalid={Boolean(errors.sku)}
                aria-describedby={errors.sku ? "product-sku-error" : undefined}
                {...register("sku")}
                className="h-10 w-full rounded-md border border-[var(--hairline)] bg-[var(--sunken)] px-3 text-sm text-[var(--ink-primary)] focus:border-[var(--signal)] focus:outline-none focus:ring-2 focus:ring-[var(--synapse)]/40 disabled:opacity-60"
              />
              {isEditing && (
                <p className="mt-1 text-xs text-[var(--ink-tertiary)]">
                  {t("products.form.hints.skuLocked")}
                </p>
              )}
              {errors.sku && (
                <p id="product-sku-error" className="mt-1 text-xs text-[var(--error)]">
                  {t(errors.sku.message ?? "")}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="product-name"
                className="mb-1.5 block text-sm font-medium text-[var(--ink-primary)]"
              >
                {t("products.form.name")}
                <span className="ml-0.5 text-[var(--error)]" aria-hidden="true">
                  *
                </span>
              </label>
              <input
                id="product-name"
                type="text"
                aria-required="true"
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "product-name-error" : undefined}
                {...register("name")}
                className="h-10 w-full rounded-md border border-[var(--hairline)] bg-[var(--sunken)] px-3 text-sm text-[var(--ink-primary)] focus:border-[var(--signal)] focus:outline-none focus:ring-2 focus:ring-[var(--synapse)]/40"
              />
              {errors.name && (
                <p id="product-name-error" className="mt-1 text-xs text-[var(--error)]">
                  {t(errors.name.message ?? "")}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="product-description"
                className="mb-1.5 block text-sm font-medium text-[var(--ink-primary)]"
              >
                {t("products.form.description")}
              </label>
              <textarea
                id="product-description"
                rows={3}
                aria-invalid={Boolean(errors.description)}
                {...register("description")}
                className="w-full resize-none rounded-md border border-[var(--hairline)] bg-[var(--sunken)] px-3 py-2 text-sm text-[var(--ink-primary)] focus:border-[var(--signal)] focus:outline-none focus:ring-2 focus:ring-[var(--synapse)]/40"
              />
              {errors.description && (
                <p className="mt-1 text-xs text-[var(--error)]">
                  {t(errors.description.message ?? "")}
                </p>
              )}
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-sm font-semibold text-[var(--ink-primary)]">
              {t("products.drawer.sections.classification")}
            </legend>

            <div>
              <label
                htmlFor="product-category"
                className="mb-1.5 block text-sm font-medium text-[var(--ink-primary)]"
              >
                {t("products.form.category")}
                <span className="ml-0.5 text-[var(--error)]" aria-hidden="true">
                  *
                </span>
              </label>
              <select
                id="product-category"
                aria-required="true"
                aria-invalid={Boolean(errors.categoryId)}
                aria-describedby={
                  errors.categoryId
                    ? "product-category-error"
                    : isCategoriesError
                    ? "product-category-load-error"
                    : undefined
                }
                disabled={isCategoriesLoading || isCategoriesError}
                {...register("categoryId")}
                className="h-10 w-full rounded-md border border-[var(--hairline)] bg-[var(--sunken)] px-3 text-sm text-[var(--ink-primary)] focus:border-[var(--signal)] focus:outline-none focus:ring-2 focus:ring-[var(--synapse)]/40 disabled:opacity-60"
              >
                <option value="">
                  {isCategoriesLoading
                    ? t("products.form.categoryLoading") ?? ""
                    : t("products.form.categoryPlaceholder") ?? ""}
                </option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {isCategoriesError && (
                <p
                  id="product-category-load-error"
                  className="mt-1 flex items-center gap-2 text-xs text-[var(--error)]"
                >
                  {t("products.form.categoryLoadError")}
                  <button
                    type="button"
                    onClick={() => refetchCategories()}
                    className="font-medium underline underline-offset-2"
                  >
                    {t("common.actions.retry")}
                  </button>
                </p>
              )}
              {errors.categoryId && (
                <p id="product-category-error" className="mt-1 text-xs text-[var(--error)]">
                  {t(errors.categoryId.message ?? "")}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="product-uom"
                className="mb-1.5 block text-sm font-medium text-[var(--ink-primary)]"
              >
                {t("products.form.unitOfMeasure")}
                <span className="ml-0.5 text-[var(--error)]" aria-hidden="true">
                  *
                </span>
              </label>
              <input
                id="product-uom"
                type="text"
                aria-required="true"
                aria-invalid={Boolean(errors.unitOfMeasure)}
                aria-describedby={
                  errors.unitOfMeasure ? "product-uom-error" : undefined
                }
                {...register("unitOfMeasure")}
                className="h-10 w-full rounded-md border border-[var(--hairline)] bg-[var(--sunken)] px-3 text-sm text-[var(--ink-primary)] focus:border-[var(--signal)] focus:outline-none focus:ring-2 focus:ring-[var(--synapse)]/40"
              />
              {errors.unitOfMeasure && (
                <p id="product-uom-error" className="mt-1 text-xs text-[var(--error)]">
                  {t(errors.unitOfMeasure.message ?? "")}
                </p>
              )}
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-sm font-semibold text-[var(--ink-primary)]">
              {t("products.drawer.sections.pricing")}
            </legend>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="product-cost-price"
                  className="mb-1.5 block text-sm font-medium text-[var(--ink-primary)]"
                >
                  {t("products.form.costPrice")}
                  <span className="ml-0.5 text-[var(--error)]" aria-hidden="true">
                    *
                  </span>
                </label>
                <input
                  id="product-cost-price"
                  type="number"
                  step="0.01"
                  min={0}
                  aria-required="true"
                  aria-invalid={Boolean(errors.costPrice)}
                  {...register("costPrice", { valueAsNumber: true })}
                  className="h-10 w-full rounded-md border border-[var(--hairline)] bg-[var(--sunken)] px-3 text-sm text-[var(--ink-primary)] focus:border-[var(--signal)] focus:outline-none focus:ring-2 focus:ring-[var(--synapse)]/40"
                />
                {errors.costPrice && (
                  <p className="mt-1 text-xs text-[var(--error)]">
                    {t(errors.costPrice.message ?? "")}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="product-sale-price"
                  className="mb-1.5 block text-sm font-medium text-[var(--ink-primary)]"
                >
                  {t("products.form.salePrice")}
                  <span className="ml-0.5 text-[var(--error)]" aria-hidden="true">
                    *
                  </span>
                </label>
                <input
                  id="product-sale-price"
                  type="number"
                  step="0.01"
                  min={0}
                  aria-required="true"
                  aria-invalid={Boolean(errors.salePrice)}
                  {...register("salePrice", { valueAsNumber: true })}
                  className="h-10 w-full rounded-md border border-[var(--hairline)] bg-[var(--sunken)] px-3 text-sm text-[var(--ink-primary)] focus:border-[var(--signal)] focus:outline-none focus:ring-2 focus:ring-[var(--synapse)]/40"
                />
                {errors.salePrice && (
                  <p className="mt-1 text-xs text-[var(--error)]">
                    {t(errors.salePrice.message ?? "")}
                  </p>
                )}
              </div>
            </div>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="text-sm font-semibold text-[var(--ink-primary)]">
              {t("products.drawer.sections.status")}
            </legend>
            <label
              htmlFor="product-is-active"
              className="flex min-h-[44px] cursor-pointer items-center justify-between rounded-md border border-[var(--hairline)] bg-[var(--sunken)] px-3"
            >
              <span className="text-sm text-[var(--ink-primary)]">
                {t("products.form.active")}
              </span>
              <input
                id="product-is-active"
                type="checkbox"
                {...register("isActive")}
                className="h-5 w-5 rounded-[6px] border border-[var(--hairline)] accent-[var(--signal)]"
              />
            </label>
          </fieldset>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-[var(--hairline)] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 min-w-[44px] items-center justify-center rounded-md border border-[var(--hairline)] bg-[var(--panel)] px-4 text-sm font-medium text-[var(--ink-secondary)] transition-colors duration-150 ease-out hover:bg-[var(--sunken)]"
          >
            {t("common.actions.cancel")}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex h-10 min-w-[44px] disabled:cursor-not-allowed items-center justify-center rounded-md bg-[var(--signal)] px-4 text-sm font-medium text-white transition-colors duration-150 ease-out hover:bg-[var(--signal-hover)] disabled:opacity-60"
          >
            {
              isEditing ? 
              t(isEditing && isSubmitting ? "common.actions.saving" : "common.actions.saveChanges") :
              t(!isEditing && isSubmitting ? "common.actions.creating" : "common.actions.create")
            }
          </button>
        </div>
      </form>
    </Drawer>
  );
}
