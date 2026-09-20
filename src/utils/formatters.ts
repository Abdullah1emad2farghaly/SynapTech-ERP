// Intended project path: src/utils/formatters.ts
//
// Generic, locale-aware formatting helpers shared across analytics/statistics
// pages. Not tied to Cashier specifically — reusable anywhere a number,
// currency amount, percentage, or date needs consistent display formatting.
//
// ASSUMPTION: currency code and locale below are placeholders. The confirmed
// Company Settings contract (GET/PUT /api/Companies/me) has a `currency`
// field — wire that in (e.g. via a CompanySettings context/hook) instead of
// the hardcoded "USD" once that's available, so displayed amounts match the
// company's actual configured currency rather than a guess.

const DEFAULT_LOCALE = "en-US"; // swap for i18n's active locale if available (e.g. i18n.language)
const DEFAULT_CURRENCY = "USD"; // ASSUMPTION — replace with Company Settings' real currency field

export function formatCurrency(value: number, currency: string = DEFAULT_CURRENCY): string {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat(DEFAULT_LOCALE, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat(DEFAULT_LOCALE).format(value);
}

/**
 * @param value A ratio (0–1), not a 0–100 number. Callers that already have
 * a 0–100 percentage (e.g. discountAsPercentOfGrossSales) should divide by
 * 100 before passing it in — see CashierOrdersStatusAndDiscounts.tsx.
 */
export function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat(DEFAULT_LOCALE, {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(DEFAULT_LOCALE, { dateStyle: "medium" }).format(date);
}
