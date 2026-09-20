// Intended project path: src/pages/admin/cashier/CashierOrdersPage.tsx
import { useTranslation } from "react-i18next";
import { CashierOrdersTable } from "../../../components/admin/cashier/CashierOrdersTable";
import { useCashierOrders } from "../../../hooks/useCashier";

export const CashierOrdersPage = () => {
  const { t } = useTranslation();
  const { data: orders = [], isLoading } = useCashierOrders();

  return (
    <div className="space-y-4 p-4">
      <div>
        <h1 className="text-lg font-semibold text-[var(--ink-primary)]">{t("cashier.orders.title")}</h1>
        <p className="text-sm text-[var(--ink-tertiary)]">{t("cashier.orders.subtitle")}</p>
      </div>
      <CashierOrdersTable orders={orders} isLoading={isLoading} />
    </div>
  );
};
