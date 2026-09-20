// Intended project path: src/components/admin/cashier/CashierOrdersTable.tsx
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { CASHIER_ORDER_STATUS_TONE } from "../../../constants/cashierConfig";
import type { CashierOrderResponse } from "../../../services/api/cashier.api";

interface CashierOrdersTableProps {
  orders: CashierOrderResponse[];
  isLoading: boolean;
}

// GET /api/cashier/orders documents no pagination/filter/search/sort params,
// so this is a plain client-rendered full list — same precedent as
// Departments/Suppliers/Purchase&Sales Orders full-list pages.
export const CashierOrdersTable = ({ orders, isLoading }: CashierOrdersTableProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded-md bg-[var(--sunken)]" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--hairline)] py-16 text-center text-[var(--ink-tertiary)]">
        <p className="text-sm">{t("cashier.orders.empty")}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--hairline)]">
      <table className="w-full text-sm">
        <thead className="border-b border-[var(--hairline)] bg-[var(--sunken)]">
          <tr className="text-start text-xs text-[var(--ink-tertiary)]">
            <th className="px-4 py-3 text-start font-medium">{t("cashier.orders.orderNumber")}</th>
            <th className="px-4 py-3 text-start font-medium">{t("cashier.orders.date")}</th>
            <th className="px-4 py-3 text-start font-medium">{t("cashier.orders.customer")}</th>
            <th className="px-4 py-3 text-start font-medium">{t("cashier.orders.status")}</th>
            <th className="px-4 py-3 text-end font-medium">{t("cashier.orders.total")}</th>
            <th className="px-4 py-3 text-start font-medium">{t("cashier.invoice.number")}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--hairline)]">
          {orders.map((order) => {
            const tone = order.status ? CASHIER_ORDER_STATUS_TONE[order.status] ?? "neutral" : "neutral";
            return (
              <tr
                key={order.id}
                onClick={() => navigate(`/cashier/orders/${order.id}`)}
                className="cursor-pointer transition hover:bg-[var(--sunken)]"
              >
                <td className="px-4 py-3 font-mono text-[var(--ink-primary)]">
                  {order.orderNumber ?? "—"}
                </td>
                <td className="px-4 py-3 text-[var(--ink-secondary)]">
                  {new Date(order.orderDate).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-[var(--ink-secondary)]">
                  {order.customerId ? t("cashier.customer.registered") : order.walkInCustomerName ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${
                      tone === "success"
                        ? "bg-[color-mix(in_srgb,var(--success)_15%,transparent)] text-[var(--success)]"
                        : tone === "error"
                          ? "bg-[color-mix(in_srgb,var(--error)_15%,transparent)] text-[var(--error)]"
                          : tone === "warning"
                            ? "bg-[color-mix(in_srgb,var(--warning)_15%,transparent)] text-[var(--warning)]"
                            : "bg-[var(--sunken)] text-[var(--ink-secondary)]"
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {order.status ?? "—"}
                  </span>
                </td>
                <td className="px-4 py-3 text-end font-semibold tabular-nums text-[var(--ink-primary)]">
                  {order.totalAmount.toFixed(2)}
                </td>
                <td className="px-4 py-3 font-mono text-[var(--ink-tertiary)]">
                  {order.invoiceNumber ?? "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
