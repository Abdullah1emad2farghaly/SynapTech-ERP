// src/types/attendance.types.ts

export interface AttendanceRecordResponse {
  id: string;
  employeeId: string;
  employeeName: string | null;
  date: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  status: string | null;
  notes: string | null;
}

// Frontend-only derived state — NEVER sent to the API, NEVER overwrites `status`.
// Used purely for summary counts, the "In Progress" pill, and Today's Attendance card.
export type DerivedAttendanceState = "not-checked-in" | "checked-in" | "completed";

// Frontend-only filter state — none of this maps to real query params except employeeId.
export interface AttendanceFilterState {
  search: string;
  employeeId: string | null;
  datePreset: "all" | "today" | "week" | "month";
  status: string | null; // one of the distinct statuses actually present in loaded data, or null = all
}
