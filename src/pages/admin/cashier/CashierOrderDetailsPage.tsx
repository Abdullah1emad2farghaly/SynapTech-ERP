// Intended project path: src/pages/admin/cashier/CashierOrderDetailsPage.tsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Ban, Receipt } from "lucide-react";
import { CashierOrderDetailsPanels } from "../../../components/admin/cashier/CashierOrderDetailsPanels";
import { VoidOrderDialog } from "../../../components/admin/cashier/VoidOrderDialog";
import { InvoiceView } from "../../../components/admin/cashier/InvoiceView";
import { Drawer } from "../../../components/common/Drawer";
import { useCashierOrder, useCashierOrderInvoice } from "../../../hooks/useCashier";
import { hasAnyPermission } from "@/utils/permissions";
import { getUserPermissions } from "@/pages/common/LoginPage";

// Void is only offered when the order isn't already Voided — status has no
// confirmed enum, so this checks the literal "Voided" string defensively
// rather than assuming a fixed status set.
export const CashierOrderDetailsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading } = useCashierOrder(id);

  const [voidDialogOpen, setVoidDialogOpen] = useState(false);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const { data: invoice, isLoading: invoiceLoading } = useCashierOrderInvoice(
    invoiceOpen ? id : undefined
  );

  if (isLoading) {
    return <div className="h-32 animate-pulse rounded-md bg-[var(--sunken)] m-4" />;
  }

  if (!order) {
    return (
      <div className="p-4 text-sm text-[var(--ink-tertiary)]">{t("cashier.orderDetails.notFound")}</div>
    );
  }

  const canVoid = order.status !== "Voided";

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate("/cashier/orders")}
          className="flex items-center gap-1.5 text-sm font-medium text-[var(--ink-secondary)] transition hover:text-[var(--ink-primary)]"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("common.back")}
        </button>

        <div className="flex items-center gap-2">
          {(order.invoiceId && hasAnyPermission(["cashier.invoices.view"], getUserPermissions())) && (
            <button
              type="button"
              onClick={() => setInvoiceOpen(true)}
              className="flex items-center gap-1.5 rounded-md border border-[var(--hairline)] px-3 py-1.5 text-sm font-medium text-[var(--ink-secondary)] transition hover:border-[var(--signal)] hover:text-[var(--ink-primary)]"
            >
              <Receipt className="h-4 w-4" />
              {t("cashier.orderDetails.viewInvoice")}
            </button>
          )}
          {(canVoid && hasAnyPermission(["cashier.orders.void"], getUserPermissions())) && (
            <button
              type="button"
              onClick={() => setVoidDialogOpen(true)}
              className="flex items-center gap-1.5 rounded-md border border-[var(--hairline)] px-3 py-1.5 text-sm font-medium text-[var(--error)] transition hover:border-[var(--error)]"
            >
              <Ban className="h-4 w-4" />
              {t("cashier.void.action")}
            </button>
          )}
        </div>
      </div>

      <CashierOrderDetailsPanels order={order} />

      <VoidOrderDialog
        open={voidDialogOpen}
        onClose={() => setVoidDialogOpen(false)}
        orderId={order.id}
        orderNumber={order.orderNumber}
      />

      <Drawer open={invoiceOpen} onClose={() => setInvoiceOpen(false)} title={t("cashier.invoice.title")}>
        {invoiceLoading || !invoice ? (
          <div className="h-32 animate-pulse rounded-md bg-[var(--sunken)] m-4" />
        ) : (
          <InvoiceView invoice={invoice} />
        )}
      </Drawer>
    </div>
  );
};
