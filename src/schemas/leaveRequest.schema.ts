// Intended path: src/schemas/leaveRequest.schema.ts

import { z } from "zod";

// No frontend-invented max length on `reason` — the API defines none. The Create
// Drawer shows a soft, non-blocking character counter at REASON_SOFT_LIMIT purely
// as a UX nicety; it never blocks submission.
export const REASON_SOFT_LIMIT = 500;

export const CreateLeaveRequestSchema = z
  .object({
    employeeId: z.string().min(1, "leaveRequests.validation.employeeRequired"),
    leaveType: z.string().min(1, "leaveRequests.validation.leaveTypeRequired"),
    startDate: z.string().min(1, "leaveRequests.validation.startDateRequired"),
    endDate: z.string().min(1, "leaveRequests.validation.endDateRequired"),
    reason: z.string().optional(),
  })
  .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: "leaveRequests.validation.endDateBeforeStartDate",
    path: ["endDate"],
  });

export type CreateLeaveRequestFormValues = z.infer<typeof CreateLeaveRequestSchema>;
