// src/pages/admin/stock/TransferStockPage.tsx
//
// Hosts TransferStockWizard, owns the actual POST /api/Stock/transfer
// call and success/error state, and also owns the product-stock fetch
// (via the existing useProductStock hook, GET /api/Stock/products/{id})
// that drives the wizard's Source Warehouse filtering — the wizard
// itself only manages step navigation and field values, and never calls
// the API directly.
//
// Reads ?productId=&fromWarehouseId= from the URL to pre-fill when
// opened from a row/card action elsewhere.
//
// Success uses the same MovementConfirmation component as Record
// Movement — same reasoning: no history endpoint exists, so this is the
// only place this transfer's details will ever be visible again.

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router";
import { TransferStockWizard } from "../../../components/admin/stock/TransferStockWizard";
import { MovementConfirmation } from "../../../components/admin/stock/MovementConfirmation";
import { useTransferStock, useProductStock } from "../../../hooks/useStock";
import { useProducts } from "../../../hooks/useProducts";
import { useWarehouses } from "../../../hooks/useWarehouses";
import type { MovementResponse } from "../../../services/api/stock.api";
import axios from "axios";
import { handleErrors } from "@/utils/HandleErrors";

export function TransferStockPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { data: products = [] } = useProducts();
  const { data: warehouses = [] } = useWarehouses();
  const transferMutation = useTransferStock();

  // useProductStock takes `string | undefined` (not null) — normalize
  // at this boundary since the wizard's own internal state uses null
  // for "nothing selected", matching its other nullable fields.
  const [selectedProductId, setSelectedProductId] = useState<string | undefined>(
    searchParams.get("productId") ?? undefined,
  );
  const { data: sourceStock, isLoading: isLoadingSourceStock } = useProductStock(selectedProductId);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<MovementResponse | null>(null);
  const [wizardKey, setWizardKey] = useState(0); // bump to remount the wizard with a clean step state

  const initialValues = {
    productId: searchParams.get("productId"),
    fromWarehouseId: searchParams.get("fromWarehouseId"),
  };

  async function handleSubmit(values: {
    productId: string;
    fromWarehouseId: string;
    toWarehouseId: string;
    quantity: number;
    reference: string | null;
  }) {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const result: MovementResponse[] = await transferMutation.mutateAsync(values);
      setSuccessResult(result[1]);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        handleErrors(error.response?.data.errors);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (successResult) {
    return (
      <div className="mx-auto flex max-w-lg flex-col gap-4">
        <MovementConfirmation
          movement={successResult}
          onRecordAnother={() => {
            setSuccessResult(null);
            setSelectedProductId(undefined);
            setWizardKey((k) => k + 1);
          }}
          onDone={() => navigate("/inventory/stock")}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl py-6 flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-[var(--ink-primary)]">
          {t("stock.transfer.title")}
        </h1>
        <p className="text-sm text-[var(--ink-tertiary)]">{t("stock.transfer.subtitle")}</p>
      </div>

      <TransferStockWizard
        key={wizardKey}
        products={products}
        warehouses={warehouses}
        sourceStock={sourceStock}
        isLoadingSourceStock={isLoadingSourceStock}
        initialValues={initialValues}
        isSubmitting={isSubmitting}
        submitError={submitError}
        onProductChange={(id) => setSelectedProductId(id ?? undefined)}
        onSubmit={handleSubmit}
        onCancel={() => navigate(-1)}
      />
    </div>
  );
}