// Project path: src/schemas/suppliers.schema.ts
//
// ASSUMPTION: the API contract lists field names only, with no required/optional
// or format markers. Required-ness (all fields except address) and email-format
// validation are UX judgment calls, not confirmed backend rules — verify before
// merging, since a genuinely optional field being enforced here would block
// valid submissions.

import { z } from "zod";

export const supplierFormSchema = z.object({
  name: z
    .string()
    .min(2, "suppliers.validation.nameMin")
    .max(120, "suppliers.validation.nameMax"),
  contactName: z
    .string()
    .min(1, "suppliers.validation.contactNameRequired")
    .max(80, "suppliers.validation.contactNameMax"),
  phone: z
    .string()
    .min(1, "suppliers.validation.phoneRequired")
    .max(30, "suppliers.validation.phoneMax"),
  email: z.string().email("suppliers.validation.emailInvalid"),
  address: z.string().max(240, "suppliers.validation.addressMax").optional().default(""),
  taxNumber: z
    .string()
    .min(1, "suppliers.validation.taxNumberRequired")
    .max(40, "suppliers.validation.taxNumberMax"),
  isActive: z.boolean(),
});

export type SupplierFormValues = z.infer<typeof supplierFormSchema>;
