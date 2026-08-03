// Project path: src/pages/admin/purchase-orders/CreateEditPurchaseOrderPage.tsx
// Routes: /purchase-orders/create, /purchase-orders/:id/edit
//
// Full page, not a Drawer — the one exception to this project's Drawer-for-
// all-forms convention, justified by the line-items grid needing real width
// (see spec §7). Edit only reachable for Draft orders — gated by the caller
// (route/list/details all check canPerform("edit", status) before linking here).

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import {
  purchaseOrderFormSchema,
  type PurchaseOrderFormValues,
} from "../../../schemas/purchaseOrders.schema";
import { usePurchaseOrder } from "../../../hooks/usePurchaseOrders";
import {
  useCreatePurchaseOrder,
  useUpdatePurchaseOrder,
} from "../../../hooks/usePurchaseOrderMutations";
import { SearchableEntitySelect } from "../../../components/admin/purchase-orders/SearchableEntitySelect";
import { LineItemsEditableGrid } from "../../../components/admin/purchase-orders/LineItemsEditableGrid";
import { useSuppliers } from "../../../hooks/useSuppliers"; // existing module
import { useWarehouses } from "../../../hooks/useWarehouses"; // existing module

const EMPTY_LINE = { productId: "", quantity: 0, unitPrice: 0 };

export function CreateEditPurchaseOrderPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const isEdit = Boolean(id);
  const { data: existingOrder, isLoading: orderLoading } = usePurchaseOrder(id);
  const { data: suppliers = [] } = useSuppliers();
  const { data: warehouses = [] } = useWarehouses();

  const createOrder = useCreatePurchaseOrder();
  const updateOrder = useUpdatePurchaseOrder(id ?? "");

  // "Duplicate" navigates here with prefill state instead of an id — see
  // PurchaseOrdersListPage's onDuplicate handler.
  const duplicateFrom = (location.state as { duplicateFrom?: PurchaseOrderFormValues } | null)
    ?.duplicateFrom;

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<PurchaseOrderFormValues>({
    resolver: zodResolver(purchaseOrderFormSchema),
    defaultValues: duplicateFrom ?? {
      supplierId: "",
      warehouseId: "",
      orderDate: new Date().toISOString().slice(0, 10),
      expectedDate: new Date().toISOString().slice(0, 10),
      notes: "",
      lines: [EMPTY_LINE],
    },
  });

  useEffect(() => {
    if (isEdit && existingOrder) {
      reset({
        supplierId: existingOrder.supplierId,
        warehouseId: existingOrder.warehouseId,
        orderDate: existingOrder.orderDate.slice(0, 10),
        expectedDate: existingOrder?.expectedDate?.slice(0, 10),
        notes: existingOrder.notes,
        lines: existingOrder.lines.map((l) => ({
          productId: l.productId,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
        })),
      });
    }
  }, [isEdit, existingOrder, reset]);

  const supplierId = watch("supplierId");
  const warehouseId = watch("warehouseId");
  const lines = watch("lines");

  const handleLineChange = (
    index: number,
    field: "productId" | "quantity" | "unitPrice",
    value: string | number
  ) => {
    setValue(`lines.${index}.${field}` as const, value as never, { shouldValidate: true, shouldDirty: true });
  };

  const onSubmit = async (values: PurchaseOrderFormValues) => {
    try {
      if (isEdit && id) {
        await updateOrder.mutateAsync(values);
        toast.success(t("purchaseOrders.toasts.updated"));
        navigate(`/inventory/purchase-orders/${id}`);
      } else {
        const created = await createOrder.mutateAsync(values);
        toast.success(t("purchaseOrders.toasts.created"));
        navigate(`/inventory/purchase-orders/${created.id}`);
      }
    } catch {
      toast.error(t("common.errors.actionFailed"));
    }
  };

  if (isEdit && orderLoading) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <div className="h-8 w-64 animate-pulse rounded bg-[--sunken]" />
        <div className="h-96 animate-pulse rounded-lg bg-[--sunken]" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
      <div className="flex flex-col gap-6 p-6 pb-28">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex w-fit items-center gap-1.5 text-sm text-[--ink-secondary] hover:text-[--ink-primary]"
        >
          <ArrowLeft size={16} className="rtl:rotate-180" />
          {t("purchaseOrders.details.back")}
        </button>

        <div>
          <h1 className="text-2xl font-semibold text-[--ink-primary]">
            {isEdit ? t("purchaseOrders.form.editTitle") : t("purchaseOrders.form.createTitle")}
          </h1>
          <p className="mt-1 text-sm text-[--ink-secondary]">{t("purchaseOrders.form.subtitle")}</p>
        </div>

        <section className="grid grid-cols-1 gap-4 rounded-lg border border-[--hairline] bg-[--panel] p-5 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-[--ink-secondary]">{t("purchaseOrders.fields.supplier")}</label>
            <SearchableEntitySelect
              options={suppliers.map((s) => ({ id: s.id, name: s.name }))}
              value={supplierId}
              onChange={(v) => setValue("supplierId", v, { shouldValidate: true, shouldDirty: true })}
              placeholder={t("purchaseOrders.form.selectSupplier")}
              searchPlaceholder={t("purchaseOrders.form.searchSuppliers")}
              noResultsLabel={t("purchaseOrders.form.noSuppliersFound")}
              hasError={Boolean(errors.supplierId)}
            />
            {errors.supplierId && <p className="mt-1 text-xs text-[--error]">{t(errors.supplierId.message as string)}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm text-[--ink-secondary]">{t("purchaseOrders.fields.warehouse")}</label>
            <SearchableEntitySelect
              options={warehouses.map((w) => ({ id: w.id, name: w.name }))}
              value={warehouseId}
              onChange={(v) => setValue("warehouseId", v, { shouldValidate: true, shouldDirty: true })}
              placeholder={t("purchaseOrders.form.selectWarehouse")}
              searchPlaceholder={t("purchaseOrders.form.searchWarehouses")}
              noResultsLabel={t("purchaseOrders.form.noWarehousesFound")}
              hasError={Boolean(errors.warehouseId)}
            />
            {errors.warehouseId && <p className="mt-1 text-xs text-[--error]">{t(errors.warehouseId.message as string)}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm text-[--ink-secondary]">{t("purchaseOrders.fields.orderDate")}</label>
            <input
              type="date"
              {...register("orderDate")}
              className="w-full rounded-md border border-[--hairline] bg-[--sunken] px-3 py-2 text-sm outline-none focus:border-[--signal] focus:ring-2 focus:ring-[--synapse]/30"
            />
            {errors.orderDate && <p className="mt-1 text-xs text-[--error]">{t(errors.orderDate.message as string)}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm text-[--ink-secondary]">{t("purchaseOrders.fields.expectedDate")}</label>
            <input
              type="date"
              {...register("expectedDate")}
              className="w-full rounded-md border border-[--hairline] bg-[--sunken] px-3 py-2 text-sm outline-none focus:border-[--signal] focus:ring-2 focus:ring-[--synapse]/30"
            />
            {errors.expectedDate && <p className="mt-1 text-xs text-[--error]">{t(errors.expectedDate.message as string)}</p>}
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm text-[--ink-secondary]">{t("purchaseOrders.fields.notes")}</label>
            <textarea
              {...register("notes")}
              rows={2}
              className="w-full rounded-md border border-[--hairline] bg-[--sunken] px-3 py-2 text-sm outline-none focus:border-[--signal] focus:ring-2 focus:ring-[--synapse]/30"
            />
          </div>
        </section>

        <section className="rounded-lg border border-[--hairline] bg-[--panel] p-5">
          <LineItemsEditableGrid
            lines={lines}
            onChange={handleLineChange}
            onAdd={() => setValue("lines", [...lines, EMPTY_LINE], { shouldDirty: true })}
            onRemove={(i) => setValue("lines", lines.filter((_, idx) => idx !== i), { shouldDirty: true, shouldValidate: true })}
            onDuplicate={(i) => {
              const copy = [...lines];
              copy.splice(i + 1, 0, { ...lines[i] });
              setValue("lines", copy, { shouldDirty: true });
            }}
          />
          {errors.lines?.message && (
            <p className="mt-2 text-sm text-[--error]">{t(errors.lines.message as string)}</p>
          )}
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 flex items-center justify-end gap-3 border-t border-[--hairline] bg-[--panel] px-6 py-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-md px-4 py-2 text-sm font-medium text-[--ink-secondary] hover:bg-[--sunken]"
        >
          {t("common.actions.cancel")}
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-[--signal] px-4 py-2 text-sm font-medium text-white hover:bg-[--signal-hover] disabled:opacity-60"
        >
          {isEdit ? t("common.actions.saveChanges") : t("purchaseOrders.actions.saveDraft")}
        </button>
      </div>
    </form>
  );
}
