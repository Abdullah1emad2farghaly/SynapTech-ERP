
import { useTranslation } from "react-i18next";
import { Printer } from "lucide-react";
import { FinancialSummary } from "./FinancialSummary";
import type { CashierInvoiceResponse } from "../../../services/api/cashier.api";

interface InvoiceViewProps {
  invoice: CashierInvoiceResponse;
}

export const InvoiceView = ({ invoice }: InvoiceViewProps) => {
  const { t } = useTranslation();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="h-fit">
      <style>{`
        @media print {
          @page {
            size: A5;
            margin: 10mm;
          }

          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            min-height: 0 !important;
          }

          body {
            overflow: visible !important;
          }

          body * {
            visibility: hidden;
          }

          #cashier-invoice-print,
          #cashier-invoice-print * {
            visibility: visible;
          }

          # {
            position: static !important;

            width: 100% !important;
            min-width: 0 !important;
            max-width: none !important;

            height: fit-content !important;
            min-height: 0 !important;
            max-height: none !important;

            margin: 0 !important;
            padding: 0 !important;

            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;

            overflow: visible !important;

            box-sizing: border-box;
          }

          #cashier-invoice-print table {
            width: 100% !important;
            border-collapse: collapse !important;
          }

          #cashier-invoice-print tr {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          #cashier-invoice-print thead {
            display: table-header-group;
          }

          #cashier-invoice-print tbody {
            display: table-row-group;
          }

          #cashier-invoice-print .financial-summary {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>

      {/* Print button */}
      <div className="mb-3 flex justify-end print:hidden">
        <button
          type="button"
          onClick={handlePrint}
          className="flex items-center gap-1.5 rounded-md border border-[var(--hairline)] px-3 py-1.5 text-sm font-medium text-[var(--ink-secondary)] transition hover:border-[var(--signal)] hover:text-[var(--ink-primary)]"
        >
          <Printer className="h-4 w-4" />
          {t("common.print")}
        </button>
      </div>

      {/* Invoice */}
      <div
        id="cashier-invoice-print"
        className="
          mx-auto
          max-w-xl
          space-y-6
          rounded-lg
          border
          border-[var(--hairline)]
          bg-[var(--panel)]
          p-6
          print:mx-0
          print:max-w-none
        "
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[var(--hairline)] pb-4">
          <div>
            <p className="text-xs text-[var(--ink-tertiary)]">
              {t("cashier.invoice.number")}
            </p>

            <p className="font-mono text-lg font-semibold text-[var(--ink-primary)]">
              {invoice.invoiceNumber ?? "—"}
            </p>
          </div>

          <div className="text-end">
            <p className="text-xs text-[var(--ink-tertiary)]">
              {t("cashier.invoice.date")}
            </p>

            <p className="text-sm text-[var(--ink-primary)]">
              {new Date(invoice.invoiceDate).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Customer */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--ink-secondary)]">
            {invoice.customerId
              ? t("cashier.customer.registered")
              : t("cashier.customer.walkIn")}
          </span>

          <span className="text-[var(--ink-primary)]">
            {invoice.customerId ?? invoice.walkInCustomerName ?? "—"}
          </span>
        </div>

        {/* Invoice Lines */}
        <div className="overflow-hidden rounded-lg border border-[var(--hairline)]">
          <table className="w-full  text-sm">
            <thead className="border-b border-[var(--hairline)] bg-[var(--sunken)] text-xs text-[var(--ink-tertiary)]">
              <tr>
                <th className="px-3 py-2 text-start font-medium">
                  {t("cashier.cart.product")}
                </th>

                <th className="px-3 py-2 text-start font-medium">
                  {t("cashier.cart.sku")}
                </th>

                <th className="px-3 py-2 text-end font-medium">
                  {t("cashier.cart.quantity")}
                </th>

                <th className="px-3 py-2 text-end font-medium">
                  {t("cashier.cart.unitPrice")}
                </th>

                <th className="px-3 py-2 text-end font-medium">
                  {t("cashier.cart.lineTotal")}
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[var(--hairline)]">
              {(invoice.lines ?? []).map((line, i) => (
                <tr key={i}>
                  <td className="px-3 py-2 text-[var(--ink-primary)]">
                    {line.productName ?? "—"}
                  </td>

                  <td className="px-3 py-2 font-mono text-[var(--ink-tertiary)]">
                    {line.sku ?? "—"}
                  </td>

                  <td className="px-3 py-2 text-end tabular-nums">
                    {line.quantity}
                  </td>

                  <td className="px-3 py-2 text-end tabular-nums">
                    {line.unitPrice.toFixed(2)}
                  </td>

                  <td className="px-3 py-2 text-end font-semibold tabular-nums">
                    {line.lineTotal.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Financial Summary */}
        <div className="financial-summary">
          <FinancialSummary
            subTotal={invoice.subTotal}
            discountAmount={invoice.discountAmount}
            taxAmount={invoice.taxAmount}
            totalAmount={invoice.totalAmount}
            amountPaid={invoice.amountPaid}
            changeDue={invoice.changeDue}
          />
        </div>
      </div>
    </div>
  );
};

