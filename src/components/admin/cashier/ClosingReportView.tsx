// Intended project path: src/components/admin/cashier/ClosingReportView.tsx
import { useTranslation } from "react-i18next";
import {
  AlertTriangle,
  Banknote,
  CheckCircle2,
  CreditCard,
  ScrollText,
  ShoppingBag,
  Wallet,
  XCircle,
} from "lucide-react";
import type { ShiftClosingReportResponse } from "../../../services/api/cashier.api";

interface ClosingReportViewProps {
  report: ShiftClosingReportResponse;
}

// Every figure here comes straight off ShiftClosingReportResponse — nothing
// computed or invented beyond the expected-vs-counted delta the backend
// already provides as discrepancyAmount. Redesigned for readability: a
// shift-identity header, two order-count stat cards, a 3-way sales
// breakdown, and a cash-drawer reconciliation section that ends in one
// unmissable discrepancy panel — rather than a flat grid of numbers.
export const ClosingReportView = ({ report }: ClosingReportViewProps) => {
  const { t } = useTranslation();
  const discrepancy = report.discrepancyAmount;
  const isBalanced = discrepancy === 0;
  const isOver = discrepancy != null && discrepancy > 0;

  const SectionTitle = ({ icon: Icon, children }: { icon: typeof ScrollText; children: React.ReactNode }) => (
    <div className="mb-3 flex items-center gap-2">
      <Icon className="h-4 w-4 text-[var(--ink-tertiary)]" />
      <h3 className="text-sm font-semibold text-[var(--ink-primary)]">{children}</h3>
    </div>
  );

  const StatCard = ({
    icon: Icon,
    label,
    value,
    tone = "neutral",
  }: {
    icon: typeof ScrollText;
    label: string;
    value: string | number;
    tone?: "neutral" | "success" | "error";
  }) => (
    <div className="rounded-lg border border-[var(--hairline)] bg-[var(--panel)] p-4">
      <div className="flex items-center gap-2">
        <Icon
          className={`h-4 w-4 ${
            tone === "success" ? "text-[var(--success)]" : tone === "error" ? "text-[var(--error)]" : "text-[var(--ink-tertiary)]"
          }`}
        />
        <p className="text-xs text-[var(--ink-tertiary)]">{label}</p>
      </div>
      <p className="mt-2 text-xl font-semibold tabular-nums text-[var(--ink-primary)]">{value}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Shift identity header */}
      <div className="rounded-xl border border-[var(--hairline)] bg-[var(--panel)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--ink-tertiary)]">
              {t("cashier.shift.shiftNumber")}
            </p>
            <p className="mt-0.5 font-mono text-2xl font-semibold text-[var(--ink-primary)]">
              {report.shiftNumber ?? "—"}
            </p>
          </div>
          <div className="text-end">
            <p className="text-xs text-[var(--ink-tertiary)]">{t("cashier.shiftReport.period")}</p>
            <p className="mt-0.5 text-sm text-[var(--ink-secondary)]">
              {new Date(report.openedAt).toLocaleString()}
            </p>
            {report.closedAt && (
              <p className="text-sm text-[var(--ink-secondary)]">
                {t("cashier.shiftHistory.closed")}: {new Date(report.closedAt).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Orders */}
      <div>
        <SectionTitle icon={ShoppingBag}>{t("cashier.shiftReport.ordersSection")}</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={CheckCircle2}
            label={t("cashier.closingReport.completedOrders")}
            value={report.completedOrderCount}
            tone="success"
          />
          <StatCard
            icon={XCircle}
            label={t("cashier.closingReport.voidedOrders")}
            value={report.voidedOrderCount}
            tone={report.voidedOrderCount > 0 ? "error" : "neutral"}
          />
        </div>
      </div>

      {/* Sales breakdown */}
      <div>
        <SectionTitle icon={CreditCard}>{t("cashier.closingReport.sales")}</SectionTitle>
        <div className="grid grid-cols-3 gap-3">
          <StatCard icon={Banknote} label={t("cashier.closingReport.cashSales")} value={report.totalCashSales.toFixed(2)} />
          <StatCard icon={CreditCard} label={t("cashier.closingReport.cardSales")} value={report.totalCardSales.toFixed(2)} />
          <StatCard icon={Wallet} label={t("cashier.closingReport.otherSales")} value={report.totalOtherSales.toFixed(2)} />
        </div>
      </div>

      {/* Cash drawer reconciliation */}
      <div>
        <SectionTitle icon={Wallet}>{t("cashier.closingReport.cashDrawer")}</SectionTitle>

        <div className="rounded-lg border border-[var(--hairline)] bg-[var(--panel)]">
          <dl className="divide-y divide-[var(--hairline)]">
            {[
              { label: t("cashier.closingReport.openingCash"), value: report.openingCashBalance },
              { label: t("cashier.closingReport.cashIn"), value: report.totalCashIn },
              { label: t("cashier.closingReport.cashOut"), value: -report.totalCashOut },
              { label: t("cashier.shift.expectedCash"), value: report.expectedClosingCash, emphasize: true },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between px-4 py-2.5 text-sm">
                <dt className={row.emphasize ? "font-medium text-[var(--ink-primary)]" : "text-[var(--ink-secondary)]"}>
                  {row.label}
                </dt>
                <dd
                  className={`tabular-nums ${
                    row.emphasize ? "font-semibold text-[var(--ink-primary)]" : "text-[var(--ink-primary)]"
                  }`}
                >
                  {row.value.toFixed(2)}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* The one number a cashier actually came here for */}
        <div
          className={`mt-3 rounded-xl border-2 p-5 ${
            isBalanced
              ? "border-[var(--success)] bg-[color-mix(in_srgb,var(--success)_8%,transparent)]"
              : isOver
                ? "border-[var(--success)] bg-[color-mix(in_srgb,var(--success)_8%,transparent)]"
                : "border-[var(--error)] bg-[color-mix(in_srgb,var(--error)_8%,transparent)]"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {discrepancy == null ? (
                <ScrollText className="h-5 w-5 text-[var(--ink-tertiary)]" />
              ) : isBalanced ? (
                <CheckCircle2 className="h-5 w-5 text-[var(--success)]" />
              ) : (
                <AlertTriangle className={`h-5 w-5 ${isOver ? "text-[var(--success)]" : "text-[var(--error)]"}`} />
              )}
              <div>
                <p className="text-sm font-semibold text-[var(--ink-primary)]">
                  {t("cashier.shift.countedCash")}
                </p>
                <p className="text-xs text-[var(--ink-tertiary)]">
                  {report.countedClosingCash != null ? report.countedClosingCash.toFixed(2) : "—"}
                </p>
              </div>
            </div>

            <div className="text-end">
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--ink-tertiary)]">
                {t("cashier.shift.discrepancy")}
              </p>
              <p
                className={`text-2xl font-bold tabular-nums ${
                  discrepancy == null
                    ? "text-[var(--ink-primary)]"
                    : isBalanced
                      ? "text-[var(--success)]"
                      : isOver
                        ? "text-[var(--success)]"
                        : "text-[var(--error)]"
                }`}
              >
                {discrepancy == null ? "—" : `${discrepancy > 0 ? "+" : ""}${discrepancy.toFixed(2)}`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
