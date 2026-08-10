// Intended path: src/services/api/leaveRequests.api.ts
//
// ASSUMPTION (project-wide, flagged the same way in every prior module's service file):
// `apiClient` from "./client" has never been seen/created in this project's context.
// Its existence, baseURL, and auth interceptor setup are assumed. Verify this file
// exists and exports a configured Axios instance before wiring this service in.
import { apiClient } from "./axiosClient";

// ---- Confirmed response/request shapes (LeaveRequests API surface) ----

export type LeaveRequestStatus = "Pending" | "Approved" | "Rejected" | "Cancelled";

export interface LeaveRequestResponse {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string | null;
  /**
   * Backend returns this as a plain string. No documented enum — render
   * whatever comes back, map known values, fall back gracefully for anything
   * else (including null/unrecognized). Never assume this is closed to the
   * four values listed in LeaveRequestStatus above.
   */
  status: string | null;
  approvedAt: string | null;
}

export interface CreateLeaveRequestPayload {
  employeeId: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason?: string;
}

// ---- Service functions ----
// Approve/Reject/Cancel intentionally take no request body — the API does not
// accept one (no rejection reason, no approval/cancellation comment).

export async function getLeaveRequests(): Promise<LeaveRequestResponse[]> {
  const { data } = await apiClient.get<LeaveRequestResponse[]>("/LeaveRequests");
  return data;
}

export async function getLeaveRequestById(id: string): Promise<LeaveRequestResponse> {
  const { data } = await apiClient.get<LeaveRequestResponse>(`/LeaveRequests/${id}`);
  return data;
}

export async function getMyLeaveRequests(): Promise<LeaveRequestResponse[]> {
  const { data } = await apiClient.get<LeaveRequestResponse[]>("/LeaveRequests/my-requests");
  return data;
}

export async function createLeaveRequest(
  payload: CreateLeaveRequestPayload
): Promise<LeaveRequestResponse> {
  const { data } = await apiClient.post<LeaveRequestResponse>("/LeaveRequests", payload);
  return data;
}

export async function approveLeaveRequest(id: string): Promise<LeaveRequestResponse> {
  const { data } = await apiClient.post<LeaveRequestResponse>(
    `/LeaveRequests/${id}/approve`
  );
  return data;
}

export async function rejectLeaveRequest(id: string): Promise<LeaveRequestResponse> {
  const { data } = await apiClient.post<LeaveRequestResponse>(`/LeaveRequests/${id}/reject`);
  return data;
}

export async function cancelLeaveRequest(id: string): Promise<LeaveRequestResponse> {
  const { data } = await apiClient.post<LeaveRequestResponse>(`/LeaveRequests/${id}/cancel`);
  return data;
}
