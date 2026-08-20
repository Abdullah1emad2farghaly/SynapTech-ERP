// Project path: src/schemas/suppliers.schema.ts

import { z } from "zod";

export const supplierFormSchema = z.object({
  // Required
  name: z
    .string()
    .min(2, "suppliers.validation.nameMin")
    .max(120, "suppliers.validation.nameMax"),

  // Optional / nullable
  contactName: z
    .string()
    .max(80, "suppliers.validation.contactNameMax")
    .nullable()
    .optional(),

  phone: z
    .string()
    .max(30, "suppliers.validation.phoneMax")
    .nullable()
    .optional(),

  email: z
    .string()
    .email("suppliers.validation.emailInvalid")
    .or(z.literal(""))
    .nullable()
    .optional(),

  address: z
    .string()
    .max(240, "suppliers.validation.addressMax")
    .nullable()
    .optional(),

  taxNumber: z
    .string()
    .max(40, "suppliers.validation.taxNumberMax")
    .nullable()
    .optional(),

  isActive: z.boolean(),
});

export type SupplierFormValues = z.infer<typeof supplierFormSchema>;