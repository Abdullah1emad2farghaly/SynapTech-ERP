// src/services/api/attendance.api.ts

import {apiClient} from "./axiosClient";
import { AttendanceRecordResponse } from "../../types/attendance.types";

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
