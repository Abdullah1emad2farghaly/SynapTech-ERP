// src/services/api/attendance.api.ts

import {apiClient} from "./axiosClient"; // ASSUMPTION: existing shared axios instance, unverified — see project handoff notes
import { AttendanceRecordResponse } from "../../types/attendance.types";

// GET /api/Attendance  or  GET /api/Attendance?employeeId={id}
// No other query params are documented — do not add search/date/status/pagination here.
export async function getAttendance(employeeId?: string): Promise<AttendanceRecordResponse[]> {
  const { data } = await apiClient.get<AttendanceRecordResponse[]>("/Attendance", {
    params: employeeId ? { employeeId } : undefined,
  });
  return data;
}

// POST /api/Attendance/check-in — no request body, backend resolves current user
export async function checkIn(): Promise<AttendanceRecordResponse> {
  const { data } = await apiClient.post<AttendanceRecordResponse>("/Attendance/check-in");
  return data;
}

// POST /api/Attendance/check-out — no request body
export async function checkOut(): Promise<AttendanceRecordResponse> {
  const { data } = await apiClient.post<AttendanceRecordResponse>("/Attendance/check-out");
  return data;
}

// GET /api/Attendance/my-history — no params
export async function getMyAttendanceHistory(): Promise<AttendanceRecordResponse[]> {
  const { data } = await apiClient.get<AttendanceRecordResponse[]>("/Attendance/my-history");
  return data;
}
