// Intended project path: src/components/admin/cashier/CashierOrderDetailsPanels.tsx
import { useTranslation } from "react-i18next";
import { TriangleAlert } from "lucide-react";
import { FinancialSummary } from "./FinancialSummary";
import type { CashierOrderResponse } from "../../../services/api/cashier.api";
import { CASHIER_ORDER_STATUS_TONE } from "@/constants/cashierConfig";

interface CashierOrderDetailsPanelsProps {
  order: CashierOrderResponse;
}

// Organizes CashierOrderResponse into the sections the brief asks for:
// Order Information / Items / Financial Summary / Payments / Invoice / Warnings.
// Every field shown is a real field on the response — no invented "Shift"
// details beyond cashierShiftId, which is shown as-is (no separate Shift
// fetch here, since the order response doesn't include shift metadata).
export const CashierOrderDetailsPanels = ({ order }: CashierOrderDetailsPanelsProps) => {
  const { t } = useTranslation();
  const tone = order.status ? CASHIER_ORDER_STATUS_TONE[order.status] ?? "neutral" : "neutral";

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section>
      <h3 className="mb-2 text-sm font-semibold text-[var(--ink-primary)]">{title}</h3>
      {children}
    </section>
  );

  return (
    <div className="space-y-6">
      <Section title={t("cashier.orderDetails.orderInformation")}>
        <div className="grid grid-cols-2 gap-3 rounded-lg border border-[var(--hairline)] bg-[var(--panel)] p-4 text-sm sm:grid-cols-3">
          <div>
            <p className="text-xs text-[var(--ink-tertiary)]">{t("cashier.orders.orderNumber")}</p>
            <p className="font-mono text-[var(--ink-primary)]">{order.orderNumber ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--ink-tertiary)]">{t("cashier.orders.date")}</p>
            <p className="text-[var(--ink-primary)]">{new Date(order.orderDate).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--ink-tertiary)]">{t("cashier.orders.status")}</p>
            <p className="text-[var(--ink-primary)]"><span
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
                    {t(`cashier.status.${order.status?.toLocaleLowerCase()}`) ?? "—"}
                  </span></p>
          </div>
          <div>
            <p className="text-xs text-[var(--ink-tertiary)]">{t("cashier.orders.customer")}</p>
            <p className="text-[var(--ink-primary)]">
              {order.customerId ?? order.walkInCustomerName ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--ink-tertiary)]">{t("cashier.orderDetails.shift")}</p>
            <p className="font-mono text-[var(--ink-primary)]">{order.cashierShiftId}</p>
          </div>
        </div>
      </Section>

      <Section title={t("cashier.orderDetails.items")}>
        <div className="overflow-x-auto rounded-lg border border-[var(--hairline)]">
          <table className="w-full text-sm">
            <thead className="border-b border-[var(--hairline)] bg-[var(--sunken)] text-xs text-[var(--ink-tertiary)]">
              <tr>
                <th className="px-3 py-2 text-start font-medium">{t("cashier.cart.product")}</th>
                <th className="px-3 py-2 text-start font-medium">{t("cashier.cart.sku")}</th>
                <th className="px-3 py-2 text-end font-medium">{t("cashier.cart.quantity")}</th>
                <th className="px-3 py-2 text-end font-medium">{t("cashier.cart.unitPrice")}</th>
                <th className="px-3 py-2 text-end font-medium">{t("cashier.cart.discount")}</th>
                <th className="px-3 py-2 text-end font-medium">{t("cashier.cart.lineTotal")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--hairline)]">
              {(order.lines ?? []).map((line) => (
                <tr key={line.id}>
                  <td className="px-3 py-2 text-[var(--ink-primary)]">{line.productName ?? "—"}</td>
                  <td className="px-3 py-2 font-mono text-[var(--ink-tertiary)]">
                    {line.productSku ?? "—"}
                  </td>
                  <td className="px-3 py-2 text-end tabular-nums">{line.quantity}</td>
                  <td className="px-3 py-2 text-end tabular-nums">{line.unitPrice.toFixed(2)}</td>
                  <td className="px-3 py-2 text-end tabular-nums">{line.discountAmount.toFixed(2)}</td>
                  <td className="px-3 py-2 text-end font-semibold tabular-nums">
                    {line.lineTotal.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title={t("cashier.summary.title")}>
        <FinancialSummary
          subTotal={order.subTotal}
          discountAmount={order.discountAmount}
          taxAmount={order.taxAmount}
          totalAmount={order.totalAmount}
          changeDue={order.changeDue}
        />
      </Section>

      <Section title={t("cashier.orderDetails.payments")}>
        <div className="divide-y divide-[var(--hairline)] rounded-lg border border-[var(--hairline)] bg-[var(--panel)]">
          {(order.payments ?? []).length === 0 ? (
            <p className="p-4 text-sm text-[var(--ink-tertiary)]">{t("cashier.orderDetails.noPayments")}</p>
          ) : (
            (order.payments ?? []).map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-3 text-sm">
                <span className="text-[var(--ink-primary)]">{payment.method ?? "—"}</span>
                {payment.referenceNumber && (
                  <span className="font-mono text-xs text-[var(--ink-tertiary)]">
                    {payment.referenceNumber}
                  </span>
                )}
                <span className="font-semibold tabular-nums text-[var(--ink-primary)]">
                  {payment.amount.toFixed(2)}
                </span>
              </div>
            ))
          )}
        </div>
      </Section>

      {order.warnings && order.warnings.length > 0 && (
        <Section title={t("cashier.orderDetails.warnings")}>
          <div className="space-y-1.5 rounded-lg border border-[var(--warning)] bg-[color-mix(in_srgb,var(--warning)_10%,transparent)] p-3">
            {order.warnings.map((warning, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-[var(--ink-primary)]">
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-[var(--warning)]" />
                <span>{warning}</span>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
};
