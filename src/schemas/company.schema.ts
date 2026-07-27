// src/schemas/company.schema.ts
import { z } from 'zod';

export const companyUpdateSchema = z.object({
  name: z.string().min(1, 'validation.required').max(200),
  legalName: z.string().min(1, 'validation.required').max(200),
  // ASSUMPTION: tax number format/length not confirmed by backend — free text, min 1
  taxNumber: z.string().min(1, 'validation.required').max(50),
  // ASSUMPTION: currency assumed to be a 3-letter ISO 4217 code (e.g. "USD"); not confirmed
  currency: z.string().min(1, 'validation.required').max(10),
  country: z.string().min(1, 'validation.required').max(100),
  isActive: z.boolean(),
});

export type CompanyUpdateFormValues = z.infer<typeof companyUpdateSchema>;
