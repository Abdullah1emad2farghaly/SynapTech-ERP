// Intended path: src/utils/leaveDuration.ts
//
// Duration is NOT returned by the API — it is always computed client-side from
// startDate/endDate and is never sent back to the API. See leave-requests-ux-spec.md
// Section 8.

/**
 * Parses an API date string (assumed date-only, e.g. "2026-08-10", or an ISO
 * datetime) into a UTC-midnight timestamp so day-count math is never thrown off
 * by the local timezone offset.
 *
 * ASSUMPTION: the exact date format returned by the API (date-only vs. full ISO
 * datetime) is unconfirmed — see leave-requests-ux-spec.md Section 17, open
 * question #4. This parses either safely by taking only the Y/M/D components.
 */
function toUtcMidnight(dateString: string): number {
  const d = new Date(dateString);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

/**
 * Inclusive day count between two dates. A single-day request (start === end)
 * returns 1, not 0.
 */
export function getLeaveDurationInDays(startDate: string, endDate: string): number {
  const start = toUtcMidnight(startDate);
  const end = toUtcMidnight(endDate);
  const msPerDay = 24 * 60 * 60 * 1000;
  const diffDays = Math.round((end - start) / msPerDay);
  return Math.max(diffDays + 1, 0);
}
