// Project path: src/components/admin/sales-orders/LineItemsEditableGrid.tsx
//
// CHANGED: no longer fetches products itself via useSalesOrderProductsLookup.
// Products (and their loading state) are now passed in as props so the
// parent page can control whether the full product list or a
// warehouse-filtered list is shown.

import { useTranslation } from "react-i18next";
import { Plus, Copy, Trash2 } from "lucide-react";
import { SearchableEntitySelect } from "../purchase-orders/SearchableEntitySelect";
import type { SalesOrderLineRequest } from "../../../types/salesOrders.types";
import { useNavigate } from "react-router-dom";

interface ProductOption {
  id: string;
  name: string;
}

interface LineItemsEditableGridProps {
  lines: SalesOrderLineRequest[];
  products: ProductOption[];
  productsLoading?: boolean;
  onChange: (index: number, field: keyof SalesOrderLineRequest, value: string | number) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onDuplicate: (index: number) => void;
}

export function LineItemsEditableGrid({
  lines,
  products,
  productsLoading,
  onChange,
  onAdd,
  onRemove,
  onDuplicate,
}: LineItemsEditableGridProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const grandTotal = lines.reduce((sum, l) => sum + (Number(l.quantity) || 0) * (Number(l.unitPrice) || 0), 0);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[--ink-primary]">{t("salesOrders.lines.title")}</h3>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-1.5 rounded-md border border-[--hairline] px-3 py-1.5 text-sm font-medium text-[--ink-primary] hover:bg-[--sunken]"
        >
          <Plus size={15} />
          {t("salesOrders.lines.addRow")}
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {lines.map((line, index) => {
          const lineTotal = (Number(line.quantity) || 0) * (Number(line.unitPrice) || 0);
          return (
            <div key={index} className="grid grid-cols-1 gap-2 rounded-lg border border-[--hairline] p-3 sm:grid-cols-[2.5fr_1fr_1fr_1fr_auto]">
              <SearchableEntitySelect
                options={products}
                value={line.productId}
                onChange={(id) => onChange(index, "productId", id)}
                placeholder={t("salesOrders.lines.selectProduct")}
                searchPlaceholder={t("salesOrders.lines.searchProducts")}
                noResultsLabel={t("salesOrders.lines.noProductsFound")}
                isLoading={productsLoading}
                button={
                  <button
                    type="button"
                    onClick={() => navigate("/inventory/products")}
                    className="w-full rounded-md px-3 py-2 text-sm font-medium border border-[var(--signal)] text-[--signal] hover:bg-[--sunken]"
                  >
                    {t("products.toolbar.addProduct")}
                  </button>
                }
              />
              <input
                type="number"
                min={0}
                step="1"
                value={line.quantity || ""}
                onChange={(e) => onChange(index, "quantity", Number(e.target.value))}
                placeholder={t("salesOrders.lines.quantity")}
                className="rounded-md border border-[--hairline] bg-[--sunken] px-2.5 py-2 text-sm outline-none focus:border-[--signal] focus:ring-2 focus:ring-[--synapse]/30"
              />
              <input
                type="number"
                min={0}
                step="0.01"
                value={line.unitPrice || ""}
                onChange={(e) => onChange(index, "unitPrice", Number(e.target.value))}
                placeholder={t("salesOrders.lines.unitPrice")}
                className="rounded-md border border-[--hairline] bg-[--sunken] px-2.5 py-2 text-sm outline-none focus:border-[--signal] focus:ring-2 focus:ring-[--synapse]/30"
              />
              <div className="flex items-center justify-end px-1 text-sm font-medium text-[--ink-primary]">
                {lineTotal.toFixed(2)}
              </div>
              <div className="flex items-center justify-end gap-1">
                <button type="button" title={t("salesOrders.lines.duplicateRow")} onClick={() => onDuplicate(index)} className="rounded-md p-2 text-[--ink-secondary] hover:bg-[--sunken]">
                  <Copy size={15} />
                </button>
                <button
                  type="button"
                  title={t("salesOrders.lines.removeRow")}
                  onClick={() => onRemove(index)}
                  disabled={lines.length <= 1}
                  className="rounded-md p-2 text-[--error] hover:bg-[--sunken] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-[--hairline] pt-3">
        <span className="text-sm text-[--ink-secondary]">{t("salesOrders.lines.grandTotal")}</span>
        <span className="text-lg font-semibold text-[--ink-primary]">{grandTotal.toFixed(2)}</span>
      </div>
    </div>
  );
}