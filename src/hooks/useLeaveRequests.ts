// Intended path: src/hooks/useLeaveRequests.ts

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  approveLeaveRequest,
  cancelLeaveRequest,
  createLeaveRequest,
  type CreateLeaveRequestPayload,
  getLeaveRequestById,
  getLeaveRequests,
  getMyLeaveRequests,
  type LeaveRequestResponse,
  rejectLeaveRequest,
} from "../services/api/leaveRequests.api";

export const leaveRequestsQueryKeys = {
  all: ["leaveRequests"] as const,
  list: () => [...leaveRequestsQueryKeys.all, "list"] as const,
  detail: (id: string) => [...leaveRequestsQueryKeys.all, "detail", id] as const,
  myRequests: () => [...leaveRequestsQueryKeys.all, "my-requests"] as const,
};

export function useLeaveRequests() {
  return useQuery({
    queryKey: leaveRequestsQueryKeys.list(),
    queryFn: getLeaveRequests,
  });
}

export function useLeaveRequest(id: string | undefined) {
  return useQuery({
    queryKey: leaveRequestsQueryKeys.detail(id ?? ""),
    queryFn: () => getLeaveRequestById(id as string),
    enabled: Boolean(id),
  });
}

export function useMyLeaveRequests() {
  return useQuery({
    queryKey: leaveRequestsQueryKeys.myRequests(),
    queryFn: getMyLeaveRequests,
  });
}

export function useCreateLeaveRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateLeaveRequestPayload) => createLeaveRequest(payload),
    onSuccess: () => {
      // Create should reflect immediately in both the admin list and self-service list.
      queryClient.invalidateQueries({ queryKey: leaveRequestsQueryKeys.list() });
      queryClient.invalidateQueries({ queryKey: leaveRequestsQueryKeys.myRequests() });
    },
  });
}

function useLeaveRequestTransitionMutation(
  mutationFn: (id: string) => Promise<LeaveRequestResponse>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: leaveRequestsQueryKeys.list() });
      queryClient.invalidateQueries({ queryKey: leaveRequestsQueryKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: leaveRequestsQueryKeys.myRequests() });
    },
  });
}

export function useApproveLeaveRequest() {
  return useLeaveRequestTransitionMutation(approveLeaveRequest);
}

export function useRejectLeaveRequest() {
  return useLeaveRequestTransitionMutation(rejectLeaveRequest);
}

export function useCancelLeaveRequest() {
  return useLeaveRequestTransitionMutation(cancelLeaveRequest);
}
