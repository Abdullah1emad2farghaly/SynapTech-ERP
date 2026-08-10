// src/hooks/useAttendance.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAttendance, checkIn, checkOut, getMyAttendanceHistory } from "../services/api/attendance.api";

export const attendanceQueryKeys = {
  all: ["attendance"] as const,
  list: (employeeId?: string) => ["attendance", "list", employeeId ?? "all"] as const,
  myHistory: ["attendance", "my-history"] as const,
};

export function useAttendanceList(employeeId?: string) {
  return useQuery({
    queryKey: attendanceQueryKeys.list(employeeId),
    queryFn: () => getAttendance(employeeId),
  });
}

export function useMyAttendanceHistory() {
  return useQuery({
    queryKey: attendanceQueryKeys.myHistory,
    queryFn: getMyAttendanceHistory,
  });
}

// Today's record is derived client-side from my-history (date === today) —
// there is no dedicated "today" endpoint.
export function useTodayAttendance() {
  const { data, ...rest } = useMyAttendanceHistory();
  const today = data?.find((r) => new Date(r.date).toDateString() === new Date().toDateString()) ?? null;
  return { todayRecord: today, ...rest };
}

export function useCheckIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: checkIn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceQueryKeys.myHistory });
      queryClient.invalidateQueries({ queryKey: attendanceQueryKeys.all });
    },
  });
}

export function useCheckOut() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: checkOut,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceQueryKeys.myHistory });
      queryClient.invalidateQueries({ queryKey: attendanceQueryKeys.all });
    },
  });
}
