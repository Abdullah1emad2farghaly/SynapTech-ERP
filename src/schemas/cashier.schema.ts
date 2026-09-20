// Intended project path: src/schemas/cashier.schema.ts

import { z } from "zod";

// Open Shift — mirrors OpenShiftRequest exactly.
export const OpenShiftSchema = z.object({
  warehouseId: z.string().min(1),
  openingCashBalance: z.coerce.number().min(0),
  notes: z.string().nullable().optional(),
});

export type OpenShiftFormValues = z.infer<typeof OpenShiftSchema>;

// Cash Movement — reason is required.
export const CashMovementSchema = (reasonRequiredMessage: string) =>
  z.object({
    movementType: z.string().min(1),
    amount: z.coerce.number().positive(),
    reason: z.string().trim().min(1, reasonRequiredMessage),
  });

export type CashMovementFormValues = z.infer<
  ReturnType<typeof CashMovementSchema>
>;

// Close Shift — mirrors CloseShiftRequest exactly.
export const CloseShiftSchema = z.object({
  countedClosingCash: z.coerce.number().min(0),
  notes: z.string().nullable().optional(),
});

export type CloseShiftFormValues = z.infer<typeof CloseShiftSchema>;

// Void Order — reason is required.
export const VoidOrderSchema = (reasonRequiredMessage: string) =>
  z.object({
    reason: z.string().trim().min(1, reasonRequiredMessage),
  });

export type VoidOrderFormValues = z.infer<
  ReturnType<typeof VoidOrderSchema>
>;

// Payment line — used client-side while composing CashierPaymentRequest[].
export const PaymentLineSchema = z.object({
  method: z.string().min(1),
  amount: z.coerce.number().positive(),
  referenceNumber: z.string().nullable().optional(),
});

export type PaymentLineFormValues = z.infer<typeof PaymentLineSchema>;