// Intended project path: src/pages/admin/cashier/CashierStatisticsPage.tsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CashierStatsHeader } from "../../../components/admin/cashier/statistics/CashierStatsHeader";
import { CashierStatsFilters } from "../../../components/admin/cashier/statistics/CashierStatsFilters";
import { CashierKpiGrid } from "../../../components/admin/cashier/statistics/CashierKpiGrid";
import { SalesTrendChart } from "../../../components/admin/cashier/statistics/SalesTrendChart";
import { SalesByHourChart } from "../../../components/admin/cashier/statistics/SalesByHourChart";
import { PaymentMethodsChart } from "../../../components/admin/cashier/statistics/PaymentMethodsChart";
import { TopProductsChart } from "../../../components/admin/cashier/statistics/TopProductsChart";
import { CategorySalesChart } from "../../../components/admin/cashier/statistics/CategorySalesChart";
import { DiscountsOverviewCard } from "../../../components/admin/cashier/statistics/DiscountsOverviewCard";
import { VoidedOrdersPanel } from "../../../components/admin/cashier/statistics/VoidedOrdersPanel";
import { CustomerAnalyticsPanel } from "../../../components/admin/cashier/statistics/CustomerAnalyticsPanel";
import { TransactionActivityTable } from "../../../components/admin/cashier/statistics/TransactionActivityTable";
import { useCashierStatistics } from "../../../hooks/useCashierStatistics";

// No "Cashier Performance" / cross-cashier comparison section — the
// confirmed API only exposes the current user's own shifts
// (my-current/my-history), with no endpoint listing all shifts or all
// orders scoped by cashier. Building a comparison chart here would mean
// inventing data or an endpoint, both explicitly disallowed by the brief.
// See BACKEND_REQUIREMENTS.md for what would be needed to add it later.
export const CashierStatisticsPage = () => {
  const { t } = useTranslation();
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string | null>(null);
  const stats = useCashierStatistics({ paymentMethodFilter });

  return (
    <div className="space-y-5 p-4">
      <CashierStatsHeader onRefresh={() => stats.refetch()} isRefreshing={stats.isLoading} />

      <CashierStatsFilters
        datePreset={stats.datePreset}
        onDatePresetChange={stats.setDatePreset}
        customRange={stats.customRange}
        onCustomRangeChange={stats.setCustomRange}
        availablePaymentMethods={stats.availablePaymentMethods}
        paymentMethodFilter={paymentMethodFilter}
        onPaymentMethodFilterChange={setPaymentMethodFilter}
      />

      {stats.isError ? (
        <div className="rounded-lg border border-[var(--error)] bg-[color-mix(in_srgb,var(--error)_8%,transparent)] p-4 text-sm text-[var(--error)]">
          {t("cashierStats.loadError")}{" "}
          <button type="button" onClick={() => stats.refetch()} className="underline">
            {t("cashierStats.retry")}
          </button>
        </div>
      ) : (
        <>
          <CashierKpiGrid
            kpis={stats.kpis}
            salesComparison={stats.salesComparison}
            transactionsComparison={stats.transactionsComparison}
            isLoading={stats.isLoading}
          />

          <SalesTrendChart data={stats.salesTrend} isLoading={stats.isLoading} />

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <SalesByHourChart data={stats.salesByHour} isLoading={stats.isLoading} />
            <PaymentMethodsChart data={stats.paymentMethods} isLoading={stats.isLoading} />
          </div>

          <TopProductsChart data={stats.topProducts} isLoading={stats.isLoading} />

          <CategorySalesChart
            data={stats.categorySales}
            isLoading={stats.isLoading || stats.productsLoading || stats.categoriesLoading}
          />

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <VoidedOrdersPanel stats={stats.voidedStats} isLoading={stats.isLoading} />
            <DiscountsOverviewCard
              kpis={stats.kpis}
              trend={stats.discountsOverTime}
              isLoading={stats.isLoading}
            />
          </div>

          <CustomerAnalyticsPanel
            breakdown={stats.customerBreakdown}
            topCustomers={stats.topCustomers}
            isLoading={stats.isLoading}
          />

          <TransactionActivityTable orders={stats.filteredOrders} isLoading={stats.isLoading} />
        </>
      )}
    </div>
  );
};
