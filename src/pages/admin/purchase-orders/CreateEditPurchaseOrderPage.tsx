// Project path: src/pages/admin/purchase-orders/CreateEditPurchaseOrderPage.tsx
//
// CHANGED: warehouse↔product cross-filtering added, mirroring Sales Orders'
// implementation on hooks/useStock.ts (useWarehouseStock / useProductStock).
// - Selecting a warehouse narrows every line's product selector to products
//   with quantityOnHand > 0 at that warehouse.
// - Before any warehouse is chosen, selecting a product on the FIRST line
//   that has one narrows the warehouse dropdown to warehouses stocking it.
// - Changing warehouse after lines have products clears any line's product
//   no longer stocked at the new warehouse.
//
// FLAGGED: unlike Sales Orders (shipping stock OUT, so "only show what's in
// stock" is the correct constraint), a Purchase Order brings stock IN — the
// most common real case is ordering a product that is NOT yet stocked (or
// is at zero) at the destination warehouse. Filtering the product picker
// down to "already stocked here" may actively block that case. Built as
// requested (mirroring Sales Orders exactly), but this is worth revisiting
// — e.g. showing all products with a "not currently stocked here" hint
// instead of hiding options — before relying on it in production.

import { useEffect, useMemo, useRef } from "react";
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
import { usePurchaseOrder, useProductsLookup } from "../../../hooks/usePurchaseOrders";
import {
  useCreatePurchaseOrder,
  useUpdatePurchaseOrder,
} from "../../../hooks/usePurchaseOrderMutations";
import { useWarehouseStock, useProductStock } from "../../../hooks/useStock";
import { SearchableEntitySelect } from "../../../components/admin/purchase-orders/SearchableEntitySelect";
import { LineItemsEditableGrid } from "../../../components/admin/purchase-orders/LineItemsEditableGrid";
import { useSuppliers } from "../../../hooks/useSuppliers"; // existing module
import { useWarehouses } from "../../../hooks/useWarehouses"; // existing module
import axios from "axios";
import { handleErrors } from "@/utils/HandleErrors";
import Optional from "@/components/common/Optional";

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
  const { data: products = [], isLoading: productsLoading } = useProductsLookup();

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

  // Product driving the warehouse narrowing — only relevant while no
  // warehouse has been chosen yet. First line with a product wins.
  const productIdForWarehouseFilter = !warehouseId
    ? lines.find((l) => l.productId)?.productId
    : undefined;

  const { data: warehouseStockLevels, isLoading: warehouseStockLoading } =
    useWarehouseStock(warehouseId || undefined);

  const { data: productStockLevels, isLoading: productStockLoading } =
    useProductStock(productIdForWarehouseFilter);

  const rawWarehouseOptions = useMemo(
    () => warehouses.map((w) => ({ id: w.id, name: w.name })),
    [warehouses]
  );

  const productFilteredWarehouseOptions = useMemo(() => {
    if (!productStockLevels) return undefined;
    return productStockLevels
      .filter((s) => s.quantityOnHand > 0)
      .map((s) => ({ id: s.warehouseId, name: s.warehouseName }));
  }, [productStockLevels]);

  const warehouseOptions = productFilteredWarehouseOptions ?? rawWarehouseOptions;
  const warehouseOptionsLoading = Boolean(productIdForWarehouseFilter) && productStockLoading;

  const warehouseFilteredProducts = useMemo(() => {
    if (!warehouseStockLevels) return undefined;
    return warehouseStockLevels
      .filter((s) => s.quantityOnHand > 0)
      .map((s) => ({ id: s.productId, name: s.productName }));
  }, [warehouseStockLevels]);

  const gridProducts = warehouseId ? (warehouseFilteredProducts ?? []) : products;
  const gridProductsLoading = warehouseId ? warehouseStockLoading : productsLoading;

  // Clear any line's product that no longer belongs to the newly-selected
  // warehouse — only on an actual user-driven warehouse change, never on
  // initial mount / edit-mode populate.
  const prevWarehouseIdRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (!warehouseId || !warehouseFilteredProducts) return;

    const isUserChange =
      prevWarehouseIdRef.current !== undefined && prevWarehouseIdRef.current !== warehouseId;
    prevWarehouseIdRef.current = warehouseId;
    if (!isUserChange) return;

    const allowedIds = new Set(warehouseFilteredProducts.map((p) => p.id));
    const updated = lines.map((l) =>
      l.productId && !allowedIds.has(l.productId) ? { ...l, productId: "" } : l
    );
    const changed = updated.some((l, i) => l.productId !== lines[i].productId);
    if (changed) {
      setValue("lines", updated, { shouldDirty: true, shouldValidate: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [warehouseId, warehouseFilteredProducts]);

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
        navigate(`/purchasing/purchase-orders/${id}`);
      } else {
        const created = await createOrder.mutateAsync(values);
        toast.success(t("purchaseOrders.toasts.created"));
        navigate(`/purchasing/purchase-orders/${created.id}`);
      }
    } catch (error) {
      if(axios.isAxiosError(error)){
        handleErrors(error.response?.data.errors)
      }
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
    <form onSubmit={handleSubmit(onSubmit, (validationErrors) => {
      console.log("FORM VALIDATION ERRORS:", validationErrors);
    })} className="flex flex-col">
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
              options={warehouseOptions}
              value={warehouseId}
              onChange={(v) => setValue("warehouseId", v, { shouldValidate: true, shouldDirty: true })}
              placeholder={t("purchaseOrders.form.selectWarehouse")}
              searchPlaceholder={t("purchaseOrders.form.searchWarehouses")}
              noResultsLabel={t("purchaseOrders.form.noWarehousesFound")}
              hasError={Boolean(errors.warehouseId)}
              isLoading={warehouseOptionsLoading}
            />
            {errors.warehouseId && <p className="mt-1 text-xs text-[--error]">{t(errors.warehouseId.message as string)}</p>}
            {productIdForWarehouseFilter && (
              <p className="mt-1 text-xs text-[--ink-tertiary]">{t("purchaseOrders.form.warehouseFilteredHint")}</p>
            )}
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
            <label className="mb-1 block text-sm text-[--ink-secondary]">{t("purchaseOrders.fields.notes")}<Optional/></label>
            <textarea
              {...register("notes")}
              rows={1}
              className="w-full rounded-md border border-[--hairline] bg-[--sunken] px-3 py-2 text-sm outline-none focus:border-[--signal] focus:ring-2 focus:ring-[--synapse]/30"
            />
          </div>
        </section>

        <section className="rounded-lg border border-[--hairline] bg-[--panel] p-5">
          {!warehouseId && (
            <p className="mb-3 text-xs text-[--ink-tertiary]">{t("purchaseOrders.lines.selectWarehouseHint")}</p>
          )}
          <LineItemsEditableGrid
            lines={lines}
            products={gridProducts}
            productsLoading={gridProductsLoading}
            onChange={handleLineChange}
            onAdd={() => setValue("lines", [...lines, EMPTY_LINE], { shouldDirty: true })}
            onRemove={(i) => setValue("lines", lines.filter((_, idx) => idx !== i), { shouldDirty: true, shouldValidate: true })}
            onDuplicate={(i) => {
              const copy = [...lines];
              copy.splice(i + 1, 0, { ...lines[i] });
              setValue("lines", copy, { shouldDirty: true });
            }}
          />
          {errors?.lines?.[0] && (
            <ul>
              <li className="mt-2 text-sm text-[--error]">{t(errors?.lines?.[0]?.productId?.message as string)}</li>
              <li className="mt-2 text-sm text-[--error]">{t(errors?.lines?.[0]?.quantity?.message as string)}</li>
            </ul>
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