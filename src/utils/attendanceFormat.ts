// src/utils/attendanceFormat.ts

import { DerivedAttendanceState, AttendanceRecordResponse } from "../types/attendance.types";

// Centralized so no component scatters `new Date(...)` formatting logic.
// Locale-aware — pass the active i18n language ("en" | "ar").

export function formatAttendanceDate(dateStr: string | null, locale: string = "en"): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function formatAttendanceTime(timeStr: string | null, locale: string = "en"): string {
  if (!timeStr) return "—";
  const d = new Date(timeStr);
  if (isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(d);
}

// Frontend-derived only — never sent back to the API.
export function calculateWorkingDuration(
  checkInTime: string | null,
  checkOutTime: string | null
): string | null {
  if (!checkInTime || !checkOutTime) return null;
  const start = new Date(checkInTime).getTime();
  const end = new Date(checkOutTime).getTime();
  if (isNaN(start) || isNaN(end) || end <= start) return null;

  const totalMinutes = Math.floor((end - start) / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes.toString().padStart(2, "0")}m`;
}

export function getDerivedAttendanceState(
  record: Pick<AttendanceRecordResponse, "checkInTime" | "checkOutTime">
): DerivedAttendanceState {
  if (record.checkInTime && record.checkOutTime) return "completed";
  if (record.checkInTime && !record.checkOutTime) return "checked-in";
  return "not-checked-in";
}

export function isWithinDatePreset(
  dateStr: string,
  preset: "all" | "today" | "week" | "month"
): boolean {
  if (preset === "all") return true;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return false;
  const now = new Date();

  if (preset === "today") {
    return d.toDateString() === now.toDateString();
  }
  if (preset === "week") {
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    return d >= weekAgo && d <= now;
  }
  if (preset === "month") {
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }
  return true;
}
