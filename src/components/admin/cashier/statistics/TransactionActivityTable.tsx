// Intended project path: src/components/admin/cashier/statistics/TransactionActivityTable.tsx
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { Search } from "lucide-react";
import { CASHIER_ORDER_STATUS_TONE } from "../../../../constants/cashierConfig";
import type { CashierOrderResponse } from "../../../../services/api/cashier.api";

interface TransactionActivityTableProps {
  orders: CashierOrderResponse[];
  isLoading: boolean;
}

type SortKey = "orderDate" | "totalAmount";

// Search/sort/status-filter all run client-side over the already-filtered
// (by date range) order list — same precedent as every other full-list
// table in this project (Departments, Suppliers, Cashier Orders itself).
// No server-side pagination exists on GET /api/cashier/orders to page
// against.
export const TransactionActivityTable = ({ orders, isLoading }: TransactionActivityTableProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("orderDate");
  const [sortDesc, setSortDesc] = useState(true);

  const statuses = useMemo(() => {
    const set = new Set<string>();
    orders.forEach((o) => o.status && set.add(o.status));
    return Array.from(set);
  }, [orders]);

  const rows = useMemo(() => {
    let result = orders;
    if (statusFilter) result = result.filter((o) => o.status === statusFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (o) =>
          o.orderNumber?.toLowerCase().includes(q) ||
          o.invoiceNumber?.toLowerCase().includes(q) ||
          o.walkInCustomerName?.toLowerCase().includes(q)
      );
    }
    return [...result].sort((a, b) => {
      const dir = sortDesc ? -1 : 1;
      if (sortKey === "totalAmount") return (a.totalAmount - b.totalAmount) * dir;
      return (new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime()) * dir;
    });
  }, [orders, search, statusFilter, sortKey, sortDesc]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDesc((d) => !d);
    else {
      setSortKey(key);
      setSortDesc(true);
    }
  };

  return (
    <div className="rounded-lg border border-[var(--hairline)] bg-[var(--panel)] p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-[var(--ink-primary)]">
          {t("cashierStats.transactions.title")}
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute start-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--ink-tertiary)]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("cashierStats.transactions.search")}
              className="w-48 rounded-md border border-[var(--hairline)] bg-[var(--canvas)] py-1.5 ps-8 pe-2 text-sm text-[var(--ink-primary)] outline-none focus:border-[var(--signal)]"
            />
          </div>
          {statuses.length > 0 && (
            <select
              value={statusFilter ?? "all"}
              onChange={(e) => setStatusFilter(e.target.value === "all" ? null : e.target.value)}
              className="rounded-md border border-[var(--hairline)] bg-[var(--canvas)] px-2 py-1.5 text-sm text-[var(--ink-primary)] outline-none focus:border-[var(--signal)]"
            >
              <option value="all">{t("cashierStats.transactions.allStatuses")}</option>
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded-md bg-[var(--sunken)]" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-1 py-12 text-center text-[var(--ink-tertiary)]">
          <p className="text-sm">{t("cashierStats.noDataForPeriod")}</p>
          <p className="text-xs">{t("cashierStats.transactions.tryAnotherRange")}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-[var(--hairline)] text-xs text-[var(--ink-tertiary)]">
              <tr>
                <th className="px-2 py-2 text-start font-medium">{t("cashier.orders.orderNumber")}</th>
                <th
                  className="cursor-pointer px-2 py-2 text-start font-medium"
                  onClick={() => toggleSort("orderDate")}
                >
                  {t("cashier.orders.date")} {sortKey === "orderDate" ? (sortDesc ? "↓" : "↑") : ""}
                </th>
                <th className="px-2 py-2 text-start font-medium">{t("cashier.orders.customer")}</th>
                <th className="px-2 py-2 text-start font-medium">{t("cashier.payment.title")}</th>
                <th className="px-2 py-2 text-start font-medium">{t("cashier.orders.status")}</th>
                <th
                  className="cursor-pointer px-2 py-2 text-end font-medium"
                  onClick={() => toggleSort("totalAmount")}
                >
                  {t("cashier.orders.total")} {sortKey === "totalAmount" ? (sortDesc ? "↓" : "↑") : ""}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--hairline)]">
              {rows.map((order) => {
                const tone = order.status ? CASHIER_ORDER_STATUS_TONE[order.status] ?? "neutral" : "neutral";
                return (
                  <tr
                    key={order.id}
                    onClick={() => navigate(`/cashier/orders/${order.id}`)}
                    className="cursor-pointer transition hover:bg-[var(--sunken)]"
                  >
                    <td className="px-2 py-2 font-mono text-[var(--ink-primary)]">{order.orderNumber ?? "—"}</td>
                    <td className="px-2 py-2 text-[var(--ink-secondary)]">
                      {new Date(order.orderDate).toLocaleString()}
                    </td>
                    <td className="px-2 py-2 text-[var(--ink-secondary)]">
                      {order.customerId ? t("cashier.customer.registered") : order.walkInCustomerName ?? "—"}
                    </td>
                    <td className="px-2 py-2 text-[var(--ink-secondary)]">
                      {(order.payments ?? []).map((p) => p.method).join(", ") || "—"}
                    </td>
                    <td className="px-2 py-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${
                          tone === "success"
                            ? "bg-[color-mix(in_srgb,var(--success)_15%,transparent)] text-[var(--success)]"
                            : tone === "error"
                              ? "bg-[color-mix(in_srgb,var(--error)_15%,transparent)] text-[var(--error)]"
                              : "bg-[var(--sunken)] text-[var(--ink-secondary)]"
                        }`}
                      >
                        {order.status ?? "—"}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-end font-semibold tabular-nums text-[var(--ink-primary)]">
                      {order.totalAmount.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
