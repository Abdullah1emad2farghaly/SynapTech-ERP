// src/types/leaveRequest.types.ts

/**
 * Matches GET /api/LeaveRequests, GET /api/LeaveRequests/{id},
 * GET /api/LeaveRequests/my-requests responses exactly.
 * Do not add fields the API does not return.
 */
export interface LeaveRequestResponse {
  id: string;
  employeeId: string;
  employeeName: string | null;
  leaveType: string | null;
  startDate: string;
  endDate: string;
  reason: string | null;
  status: string | null;
  approvedAt: string | null;
}

/**
 * Matches POST /api/LeaveRequests payload exactly.
 */
export interface CreateLeaveRequestRequest {
  employeeId: string;
  leaveType: string | null;
  startDate: string;
  endDate: string;
  reason: string | null;
}

/**
 * Known workflow states. `status` is `string | null` on the wire with no
 * documented exhaustive enum — treat this as "known values we render
 * specially," never as a guarantee of the only values that can appear.
 */
export const KNOWN_LEAVE_STATUSES = [
  'Pending',
  'Approved',
  'Rejected',
  'Cancelled',
] as const;

export type KnownLeaveStatus = (typeof KNOWN_LEAVE_STATUSES)[number];

/** Which context a Leave Requests view is currently in. */
export type LeaveRequestContext = 'mine' | 'team';

/** Client-side-only filter shape — none of these are sent as query params. */
export interface LeaveRequestFilters {
  search: string;
  employeeId: string | null;
  leaveType: string | null;
  status: string | null;
  dateFrom: string | null;
  dateTo: string | null;
}

export const EMPTY_LEAVE_REQUEST_FILTERS: LeaveRequestFilters = {
  search: '',
  employeeId: null,
  leaveType: null,
  status: null,
  dateFrom: null,
  dateTo: null,
};
