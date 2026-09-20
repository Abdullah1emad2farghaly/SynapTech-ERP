// Intended project path: src/components/admin/cashier/CartPanel.tsx
import { useTranslation } from "react-i18next";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import type { CashierCartLine } from "./cashierCart.types";

interface CartPanelProps {
  lines: CashierCartLine[];
  onQuantityChange: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

// Renders the in-progress cart, shaped so it maps 1:1 onto
// CashierOrderLineRequest when the order is submitted, and onto
// CashierOrderLineResponse once the order comes back.
export const CartPanel = ({ lines, onQuantityChange, onRemove }: CartPanelProps) => {
  const { t } = useTranslation();

  if (lines.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center text-[var(--ink-tertiary)]">
        <ShoppingCart className="h-8 w-8" />
        <p className="text-sm">{t("cashier.pos.emptyCart")}</p>
        <p className="text-xs">{t("cashier.pos.emptyCartHint")}</p>
      </div>
    );
  }

  return (
    <ul className="flex-1 divide-y divide-[var(--hairline)] overflow-y-auto">
      {lines.map((line) => {
        const lineTotal = line.quantity * line.unitPrice - line.discountAmount;
        return (
          <li key={line.productId} className="flex items-start gap-3 py-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[var(--ink-primary)]">
                {line.productName}
              </p>
              {line.productSku && (
                <p className="font-mono text-xs text-[var(--ink-tertiary)]">{line.productSku}</p>
              )}
              <p className="text-xs text-[var(--ink-secondary)]">
                {line.unitPrice.toFixed(2)} × {line.quantity}
                {line.discountAmount > 0 && (
                  <span className="text-[var(--warning)]">
                    {" "}
                    − {line.discountAmount.toFixed(2)}
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-1 rounded-md border border-[var(--hairline)] bg-[var(--sunken)]">
              <button
                type="button"
                aria-label={t("cashier.pos.decreaseQuantity")}
                onClick={() => onQuantityChange(line.productId, Math.max(1, line.quantity - 1))}
                className="p-1.5 text-[var(--ink-secondary)] transition hover:text-[var(--ink-primary)]"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-6 text-center text-sm tabular-nums text-[var(--ink-primary)]">
                {line.quantity}
              </span>
              <button
                type="button"
                aria-label={t("cashier.pos.increaseQuantity")}
                onClick={() => onQuantityChange(line.productId, line.quantity + 1)}
                className="p-1.5 text-[var(--ink-secondary)] transition hover:text-[var(--ink-primary)]"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            <span className="w-16 shrink-0 text-end text-sm font-semibold tabular-nums text-[var(--ink-primary)]">
              {lineTotal.toFixed(2)}
            </span>

            <button
              type="button"
              aria-label={t("common.remove")}
              onClick={() => onRemove(line.productId)}
              className="p-1.5 text-[var(--ink-tertiary)] transition hover:text-[var(--error)]"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        );
      })}
    </ul>
  );
};
