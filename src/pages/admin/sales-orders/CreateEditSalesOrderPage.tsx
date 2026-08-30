// Project path: src/pages/admin/sales-orders/CreateEditSalesOrderPage.tsx
// Routes: /sales-orders/create, /sales-orders/:id/edit
//
// CHANGED: warehouse↔product cross-filtering added, built on the real
// hooks/useStock.ts (useWarehouseStock / useProductStock over
// GET /api/Stock/warehouses/{id} and GET /api/Stock/products/{id}).
// - Selecting a warehouse narrows every line's product selector to
//   products with quantityOnHand > 0 at that warehouse.
// - Before any warehouse is chosen, selecting a product on the FIRST line
//   that has one narrows the warehouse dropdown to warehouses stocking it.
//   This only drives the warehouse options in the product->warehouse
//   direction; once a warehouse is actually selected, the
//   warehouse->product direction takes over and is authoritative.
// - If the warehouse is changed by the user after lines already have
//   products picked, any line whose product isn't stocked at the new
//   warehouse gets its product cleared (same pattern as Employees'
//   Branch/Department cross-filter clearing).
//
// Full page, not a Drawer — same exception as Purchase Orders' Create/Edit,
// justified by the line-items grid. No Expected Date field — this order has
// no equivalent to Purchase Orders' expectedDate.

import { useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import { salesOrderFormSchema, type SalesOrderFormValues } from "../../../schemas/salesOrders.schema";
import { useSalesOrder, useCustomersLookup, useSalesOrderProductsLookup } from "../../../hooks/useSalesOrders";
import { useCreateSalesOrder, useUpdateSalesOrder } from "../../../hooks/useSalesOrderMutations";
import { useWarehouseStock, useProductStock } from "../../../hooks/useStock";
import { SearchableEntitySelect } from "../../../components/admin/purchase-orders/SearchableEntitySelect";
import { LineItemsEditableGrid } from "../../../components/admin/sales-orders/LineItemsEditableGrid";
import { useWarehouses } from "../../../hooks/useWarehouses"; // existing module
import axios from "axios";
import { handleErrors } from "@/utils/HandleErrors";
import Optional from "@/components/common/Optional";

const EMPTY_LINE = { productId: "", quantity: 0, unitPrice: 0 };

export function CreateEditSalesOrderPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const isEdit = Boolean(id);
  const { data: existingOrder, isLoading: orderLoading } = useSalesOrder(id);
  const { data: customers = [] } = useCustomersLookup();
  const { data: warehouses = [] } = useWarehouses();
  const { data: products = [], isLoading: productsLoading } = useSalesOrderProductsLookup();

  const createOrder = useCreateSalesOrder();
  const updateOrder = useUpdateSalesOrder(id ?? "");

  const duplicateFrom = (location.state as { duplicateFrom?: SalesOrderFormValues } | null)
    ?.duplicateFrom;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SalesOrderFormValues>({
    resolver: zodResolver(salesOrderFormSchema),
    defaultValues: duplicateFrom ?? {
      customerId: "",
      warehouseId: "",
      orderDate: new Date().toISOString().slice(0, 10),
      notes: "",
      lines: [EMPTY_LINE],
    },
  });

  useEffect(() => {
    if (isEdit && existingOrder) {
      reset({
        customerId: existingOrder.customerId,
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

  const customerId = watch("customerId");
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

  const onSubmit = async (values: SalesOrderFormValues) => {
    try {
      if (isEdit && id) {
        await updateOrder.mutateAsync(values);
        toast.success(t("salesOrders.toasts.updated"));
        navigate(`/sales/sales-orders/${id}`);
      } else {
        const created = await createOrder.mutateAsync(values);
        toast.success(t("salesOrders.toasts.created"));
        navigate(`/sales/sales-orders/${created.id}`);
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
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
      <div className="flex flex-col gap-6 p-6 pb-28">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex w-fit items-center gap-1.5 text-sm text-[--ink-secondary] hover:text-[--ink-primary]"
        >
          <ArrowLeft size={16} className="rtl:rotate-180" />
          {t("salesOrders.details.back")}
        </button>

        <div>
          <h1 className="text-2xl font-semibold text-[--ink-primary]">
            {isEdit ? t("salesOrders.form.editTitle") : t("salesOrders.form.createTitle")}
          </h1>
          <p className="mt-1 text-sm text-[--ink-secondary]">{t("salesOrders.form.subtitle")}</p>
        </div>

        <section className="grid grid-cols-1 gap-4 rounded-lg border border-[--hairline] bg-[--panel] p-5 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-[--ink-secondary]">{t("salesOrders.fields.customer")}</label>
            <SearchableEntitySelect
              options={customers}
              value={customerId}
              onChange={(v) => setValue("customerId", v, { shouldValidate: true, shouldDirty: true })}
              placeholder={t("salesOrders.form.selectCustomer")}
              searchPlaceholder={t("salesOrders.form.searchCustomers")}
              noResultsLabel={t("salesOrders.form.noCustomersFound")}
              hasError={Boolean(errors.customerId)}
            />
            {errors.customerId && <p className="mt-1 text-xs text-[--error]">{t(errors.customerId.message as string)}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm text-[--ink-secondary]">{t("salesOrders.fields.warehouse")}</label>
            <SearchableEntitySelect
              options={warehouseOptions}
              value={warehouseId}
              onChange={(v) => setValue("warehouseId", v, { shouldValidate: true, shouldDirty: true })}
              placeholder={t("salesOrders.form.selectWarehouse")}
              searchPlaceholder={t("salesOrders.form.searchWarehouses")}
              noResultsLabel={t("salesOrders.form.noWarehousesFound")}
              hasError={Boolean(errors.warehouseId)}
              isLoading={warehouseOptionsLoading}
            />
            {errors.warehouseId && <p className="mt-1 text-xs text-[--error]">{t(errors.warehouseId.message as string)}</p>}
            {productIdForWarehouseFilter && (
              <p className="mt-1 text-xs text-[--ink-tertiary]">{t("salesOrders.form.warehouseFilteredHint")}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm text-[--ink-secondary]">{t("salesOrders.fields.orderDate")}</label>
            <input
              type="date"
              {...register("orderDate")}
              className="w-full rounded-md border border-[--hairline] bg-[--sunken] px-3 py-2 text-sm outline-none focus:border-[--signal] focus:ring-2 focus:ring-[--synapse]/30"
            />
            {errors.orderDate && <p className="mt-1 text-xs text-[--error]">{t(errors.orderDate.message as string)}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm text-[--ink-secondary]">
              {t("salesOrders.fields.notes")}{" "}
              <Optional/>
            </label>
            <textarea
              {...register("notes")}
              rows={1}
              className="w-full rounded-md border border-[--hairline] bg-[--sunken] px-3 py-2 text-sm outline-none focus:border-[--signal] focus:ring-2 focus:ring-[--synapse]/30"
            />
          </div>
        </section>

        <section className="rounded-lg border border-[--hairline] bg-[--panel] p-5">
          {!warehouseId && (
            <p className="mb-3 text-xs text-[--ink-tertiary]">{t("salesOrders.lines.selectWarehouseHint")}</p>
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
        <button type="button" onClick={() => navigate(-1)} className="rounded-md px-4 py-2 text-sm font-medium text-[--ink-secondary] hover:bg-[--sunken]">
          {t("common.actions.cancel")}
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-[--signal] px-4 py-2 text-sm font-medium text-white hover:bg-[--signal-hover] disabled:opacity-60"
        >
          {isEdit ? t("common.actions.saveChanges") : t("salesOrders.actions.saveDraft")}
        </button>
      </div>
    </form>
  );
}