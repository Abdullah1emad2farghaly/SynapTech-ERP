// src/components/admin/accounts/AccountBalanceCard.tsx
//
// The one balance-display component, shared between AccountPreviewPanel
// (List page) and AccountDetailsPage — not duplicated. Fetching is the
// caller's job (useAccountBalance); this component is purely
// presentational, taking the already-fetched numbers as props.
//
// Balance's sign gets a color distinction (--success/--error), but the
// number itself already carries the sign (e.g. "-$1,240.00"), so color
// is reinforcing what the text already says, not the only signal.

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export interface AccountBalanceCardProps {
  totalDebit: number;
  totalCredit: number;
  balance: number;
  isLoading?: boolean;
  currencyFormatter?: (value: number) => string;
}

const defaultFormatter = (value: number) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(value);

// Small counting-up animation for the headline balance figure — counts
// toward a real fetched number, never a placeholder one, and completes
// instantly if the value is already known (no animation on first paint
// before data exists).
function useCountUp(target: number, durationMs = 500) {
  const [value, setValue] = useState(target);

  useEffect(() => {
    const start = performance.now();
    const from = value;
    let frame: number;

    function tick(now: number) {
      const progress = Math.min((now - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(from + (target - from) * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return value;
}

function SkeletonCard() {
  return (
    <div className="rounded-[16px] border border-[var(--hairline)] bg-[var(--panel)] p-4">
      <div className="h-3 w-16 animate-pulse rounded-[4px] bg-[var(--sunken)]" />
      <div className="mt-2 h-6 w-24 animate-pulse rounded-[4px] bg-[var(--sunken)]" />
    </div>
  );
}

export function AccountBalanceCard({
  totalDebit,
  totalCredit,
  balance,
  isLoading,
  currencyFormatter = defaultFormatter,
}: AccountBalanceCardProps) {
  const { t } = useTranslation();
  const animatedBalance = useCountUp(balance);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  const balanceColor =
    balance > 0 ? "text-[var(--success)]" : balance < 0 ? "text-[var(--error)]" : "text-[var(--ink-primary)]";

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div className="rounded-[16px] border border-[var(--hairline)] bg-[var(--panel)] p-4">
        <p className="text-xs text-[var(--ink-tertiary)]">{t("accounts.details.totalDebit")}</p>
        <p className="mt-1 text-lg font-semibold text-[var(--ink-primary)]">
          {currencyFormatter(totalDebit)}
        </p>
      </div>
      <div className="rounded-[16px] border border-[var(--hairline)] bg-[var(--panel)] p-4">
        <p className="text-xs text-[var(--ink-tertiary)]">{t("accounts.details.totalCredit")}</p>
        <p className="mt-1 text-lg font-semibold text-[var(--ink-primary)]">
          {currencyFormatter(totalCredit)}
        </p>
      </div>
      <div className="rounded-[16px] border border-[var(--hairline)] bg-[var(--panel)] p-4">
        <p className="text-xs text-[var(--ink-tertiary)]">{t("accounts.details.currentBalance")}</p>
        <p className={`mt-1 text-lg font-semibold ${balanceColor}`}>
          {currencyFormatter(animatedBalance)}
        </p>
      </div>
    </div>
  );
}
