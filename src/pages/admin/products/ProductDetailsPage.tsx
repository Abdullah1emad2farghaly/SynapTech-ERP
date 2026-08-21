
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useProduct, useDeleteProduct } from "../../../hooks/useProducts";
import { StatusBadge } from "../../../components/common/StatusBadge";
import { ConfirmationDialog } from "../../../components/common/ConfirmationDialog";
import {
  ProductDrawer,
  type ProductDrawerMode,
} from "../../../components/admin/products/ProductDrawer";
import axios from "axios";
import { handleErrors } from "@/utils/HandleErrors";
import { hasAnyPermission } from "@/utils/permissions";
import { getUserPermissions } from "@/pages/common/LoginPage";

function formatCurrency(value: number): string {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function ProductDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: product, isLoading, isError, refetch } = useProduct(id);
  const deleteProduct = useDeleteProduct();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode] = useState<ProductDrawerMode>("edit");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const canManageAccess = hasAnyPermission(['inventory.products.manage'], getUserPermissions())
  

  async function handleConfirmDelete(): Promise<void> {
    if (!product) return;
    try {
      await deleteProduct.mutateAsync(product.id);
      toast.success(t("products.toasts.deleteSuccess") ?? "");
      navigate("/inventory/products");
    } catch (error) {
      if(axios.isAxiosError(error)){
        handleErrors(error.response?.data.errors)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1000px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="space-y-4">
          <div className="h-6 w-40 animate-pulse rounded-[6px] bg-[var(--sunken)]" />
          <div className="h-40 w-full animate-pulse rounded-lg bg-[var(--sunken)]" />
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="mx-auto flex max-w-[1000px] flex-col items-center gap-3 px-4 py-16 text-center">
        <p className="text-sm font-medium text-[var(--ink-primary)]">
          {t("products.details.errorTitle")}
        </p>
        <p className="text-sm text-[var(--ink-tertiary)]">
          {t("products.details.errorBody")}
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-1 rounded-md bg-[var(--signal)] px-4 py-2 text-sm font-medium text-white transition-colors duration-150 ease-out hover:bg-[var(--signal-hover)]"
        >
          {t("common.actions.retry")}
        </button>
      </div>
    );
  }

  const margin = product.salePrice - product.costPrice;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto flex flex-col gap-6 py-6 md:px-6 px-2"
    >
      <button
        type="button"
        onClick={() => navigate("/inventory/products")}
        className="flex w-fit items-center gap-2 text-sm font-medium text-[var(--ink-secondary)] transition-colors duration-150 ease-out hover:text-[var(--ink-primary)]"
      >
        <ArrowLeft size={16} />
        {t("products.details.back")}
      </button>

      <div className="flex flex-col gap-4 rounded-lg border border-[var(--hairline)] bg-[var(--panel)] p-5 shadow-[var(--elevation-1)] sm:flex-row sm:items-start sm:justify-between sm:p-6">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-semibold text-[var(--ink-primary)]">
              {product.name}
            </h1>
            <StatusBadge
              status={product.isActive ? "active" : "inactive"}
              label={t(
                product.isActive ? "common.status.active" : "common.status.inactive"
              )}
              size="sm"
            />
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[var(--ink-secondary)]">
            <span className="font-mono text-xs">{product.sku}</span>
            <span aria-hidden="true">·</span>
            <span>{product.categoryId}</span>
          </div>
        </div>

        {
          canManageAccess && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="flex h-10 min-w-[44px] items-center gap-2 rounded-md border border-[var(--hairline)] bg-[var(--panel)] px-4 text-sm font-medium text-[var(--ink-secondary)] transition-colors duration-150 ease-out hover:bg-[var(--sunken)]"
              >
                <Pencil size={16} />
                {t("common.actions.edit")}
              </button>
              <button
                type="button"
                onClick={() => setIsConfirmOpen(true)}
                className="flex h-10 min-w-[44px] items-center gap-2 rounded-md border border-[var(--hairline)] bg-[var(--panel)] px-4 text-sm font-medium text-[var(--error)] transition-colors duration-150 ease-out hover:bg-[var(--sunken)]"
              >
                <Trash2 size={16} />
                {t("common.actions.delete")}
              </button>
            </div>
          )
        }
      </div>

      {product.description && (
        <div className="rounded-lg border border-[var(--hairline)] bg-[var(--panel)] p-5 shadow-[var(--elevation-1)] sm:p-6">
          <h2 className="mb-2 text-sm font-semibold text-[var(--ink-primary)]">
            {t("products.details.description")}
          </h2>
          <p className="text-sm leading-relaxed text-[var(--ink-secondary)]">
            {product.description}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-[var(--hairline)] bg-[var(--panel)] p-5 shadow-[var(--elevation-1)]">
          <h2 className="mb-3 text-sm font-semibold text-[var(--ink-primary)]">
            {t("products.details.classification")}
          </h2>
          <dl className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-[var(--ink-tertiary)]">
                {t("products.form.category")}
              </dt>
              <dd className="font-medium text-[var(--ink-primary)]">
                {product.categoryId}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-[var(--ink-tertiary)]">
                {t("products.form.unitOfMeasure")}
              </dt>
              <dd className="font-medium text-[var(--ink-primary)]">
                {product.unitOfMeasure}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-lg border border-[var(--hairline)] bg-[var(--panel)] p-5 shadow-[var(--elevation-1)]">
          <h2 className="mb-3 text-sm font-semibold text-[var(--ink-primary)]">
            {t("products.details.pricing")}
          </h2>
          <dl className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-[var(--ink-tertiary)]">
                {t("products.form.costPrice")}
              </dt>
              <dd className="tabular-nums font-medium text-[var(--ink-primary)]">
                {formatCurrency(product.costPrice)}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-[var(--ink-tertiary)]">
                {t("products.form.salePrice")}
              </dt>
              <dd className="tabular-nums font-medium text-[var(--ink-primary)]">
                {formatCurrency(product.salePrice)}
              </dd>
            </div>
            <div className="flex items-center justify-between border-t border-[var(--hairline)] pt-2">
              <dt className="text-[var(--ink-tertiary)]">
                {t("products.details.margin")}
              </dt>
              <dd
                className={`tabular-nums font-medium ${
                  margin >= 0 ? "text-[var(--success)]" : "text-[var(--error)]"
                }`}
              >
                {formatCurrency(margin)}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <ProductDrawer
        open={drawerOpen}
        mode={drawerMode}
        product={product}
        onClose={() => setDrawerOpen(false)}
      />

      <ConfirmationDialog
        open={isConfirmOpen}
        tone="destructive"
        title={t("products.deleteDialog.title")}
        body={t("products.deleteDialog.body", { name: product.name })}
        confirmLabel={t("common.actions.delete")}
        cancelLabel={t("common.actions.cancel")}
        isSubmitting={deleteProduct.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </motion.div>
  );
}
