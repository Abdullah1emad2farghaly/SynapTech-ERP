// Project path: src/components/admin/purchase-orders/LineItemsEditableGrid.tsx
//
// Receiving-related columns (Received Quantity, Remaining) are intentionally
// absent — those only exist on the response, not the create/edit request; a
// pre-receiving grid can't show them (see spec §11).

import { useTranslation } from "react-i18next";
import { Plus, Copy, Trash2 } from "lucide-react";
import { SearchableEntitySelect } from "./SearchableEntitySelect";
import { useProductsLookup } from "../../../hooks/usePurchaseOrders";
import type { PurchaseOrderLineRequest } from "../../../types/purchaseOrders.types";

interface LineItemsEditableGridProps {
  lines: PurchaseOrderLineRequest[];
  onChange: (index: number, field: keyof PurchaseOrderLineRequest, value: string | number) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onDuplicate: (index: number) => void;
  errors?: string[];
}

export function LineItemsEditableGrid({
  lines,
  onChange,
  onAdd,
  onRemove,
  onDuplicate,
}: LineItemsEditableGridProps) {
  const { t } = useTranslation();
  const { data: products = [], isLoading: productsLoading } = useProductsLookup();

  const grandTotal = lines.reduce((sum, l) => sum + (Number(l.quantity) || 0) * (Number(l.unitPrice) || 0), 0);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[--ink-primary]">
          {t("purchaseOrders.lines.title")}
        </h3>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-1.5 rounded-md border border-[--hairline] px-3 py-1.5 text-sm font-medium text-[--ink-primary] hover:bg-[--sunken]"
        >
          <Plus size={15} />
          {t("purchaseOrders.lines.addRow")}
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {lines.map((line, index) => {
          const lineTotal = (Number(line.quantity) || 0) * (Number(line.unitPrice) || 0);
          return (
            <div
              key={index}
              className="grid grid-cols-1 gap-2 rounded-lg border border-[--hairline] p-3 sm:grid-cols-[2.5fr_1fr_1fr_1fr_auto]"
            >
              <SearchableEntitySelect
                options={products}
                value={line.productId}
                onChange={(id) => onChange(index, "productId", id)}
                placeholder={t("purchaseOrders.lines.selectProduct")}
                searchPlaceholder={t("purchaseOrders.lines.searchProducts")}
                noResultsLabel={t("purchaseOrders.lines.noProductsFound")}
                isLoading={productsLoading}
              />
              <input
                type="number"
                min={0}
                step="1"
                value={line.quantity || ""}
                onChange={(e) => onChange(index, "quantity", Number(e.target.value))}
                placeholder={t("purchaseOrders.lines.quantity")}
                className="rounded-md border border-[--hairline] bg-[--sunken] px-2.5 py-2 text-end text-sm outline-none focus:border-[--signal] focus:ring-2 focus:ring-[--synapse]/30"
              />
              <input
                type="number"
                min={0}
                step="0.01"
                value={line.unitPrice || ""}
                onChange={(e) => onChange(index, "unitPrice", Number(e.target.value))}
                placeholder={t("purchaseOrders.lines.unitPrice")}
                className="rounded-md border border-[--hairline] bg-[--sunken] px-2.5 py-2 text-end text-sm outline-none focus:border-[--signal] focus:ring-2 focus:ring-[--synapse]/30"
              />
              <div className="flex items-center justify-end px-1 text-sm font-medium text-[--ink-primary]">
                {lineTotal.toFixed(2)}
              </div>
              <div className="flex items-center justify-end gap-1">
                <button
                  type="button"
                  title={t("purchaseOrders.lines.duplicateRow")}
                  onClick={() => onDuplicate(index)}
                  className="rounded-md p-2 text-[--ink-secondary] hover:bg-[--sunken]"
                >
                  <Copy size={15} />
                </button>
                <button
                  type="button"
                  title={t("purchaseOrders.lines.removeRow")}
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
        <span className="text-sm text-[--ink-secondary]">{t("purchaseOrders.lines.grandTotal")}</span>
        <span className="text-lg font-semibold text-[--ink-primary]">{grandTotal.toFixed(2)}</span>
      </div>
    </div>
  );
}
