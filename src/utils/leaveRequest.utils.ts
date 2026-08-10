// src/utils/leaveRequest.utils.ts

import type {
  LeaveRequestResponse,
  KnownLeaveStatus,
} from '../types/leaveRequest.types';
import { KNOWN_LEAVE_STATUSES } from '../types/leaveRequest.types';

export const FALLBACK = '—';

/** Safe display for any nullable string field. Never renders "null". */
export function displayOrFallback(value: string | null | undefined): string {
  if (value === null || value === undefined || value === '') return FALLBACK;
  return value;
}

/**
 * Frontend-only duration in calendar days, inclusive of both endpoints.
 * Does NOT account for weekends, holidays, or a working calendar —
 * no such rule is confirmed by the API. Returns null on invalid dates.
 */
export function calculateDurationDays(
  startDate: string,
  endDate: string
): number | null {
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null;
  }
  const msPerDay = 1000 * 60 * 60 * 24;
  const diff = Math.round((end.getTime() - start.getTime()) / msPerDay) + 1;
  return diff > 0 ? diff : null;
}

export function isKnownStatus(
  status: string | null
): status is KnownLeaveStatus {
  return (
    status !== null &&
    (KNOWN_LEAVE_STATUSES as readonly string[]).includes(status)
  );
}

/**
 * Frontend-only overlap check against an employee's other requests.
 * This is a UI warning, not a backend validation — the API does not
 * confirm overlap rules.
 */
export function findOverlappingRequest(
  employeeId: string,
  startDate: string,
  endDate: string,
  existingRequests: LeaveRequestResponse[],
  excludeId?: string
): LeaveRequestResponse | null {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) return null;

  return (
    existingRequests.find((request) => {
      if (request.employeeId !== employeeId) return false;
      if (excludeId && request.id === excludeId) return false;
      if (request.status === 'Rejected' || request.status === 'Cancelled') {
        return false;
      }
      const otherStart = new Date(request.startDate).getTime();
      const otherEnd = new Date(request.endDate).getTime();
      if (Number.isNaN(otherStart) || Number.isNaN(otherEnd)) return false;
      return start <= otherEnd && end >= otherStart;
    }) ?? null
  );
}

/** Derives KPI counts from a loaded dataset — never claims a stats endpoint. */
export function deriveLeaveRequestCounts(requests: LeaveRequestResponse[]) {
  return {
    total: requests.length,
    pending: requests.filter((r) => r.status === 'Pending').length,
    approved: requests.filter((r) => r.status === 'Approved').length,
    rejected: requests.filter((r) => r.status === 'Rejected').length,
    cancelled: requests.filter((r) => r.status === 'Cancelled').length,
  };
}

/** Initials for the employee identity cell, from employeeName only. */
export function getInitials(name: string | null): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
