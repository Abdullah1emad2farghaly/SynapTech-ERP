// Intended path: src/schemas/company.schema.ts
//
// All API fields except isActive are nullable strings. RHF inputs can't hold
// null, so the form works in plain strings ('' = no value) and the page maps
// to/from CompanyResponse / UpdateCompanyRequest at the load/submit boundary.
// Nothing here is marked required — the API never mandates it, so we don't
// invent a business rule that isn't backed by the contract.

import { z } from 'zod';

export const companySchema = z.object({
  name: z.string().trim().max(200, 'validation.maxLength'),
  legalName: z.string().trim().max(200, 'validation.maxLength'),
  taxNumber: z.string().trim().max(100, 'validation.maxLength'),
  currency: z.string().trim().max(10, 'validation.maxLength'),
  country: z.string().trim().max(100, 'validation.maxLength'),
  isActive: z.boolean(),
});

export type CompanyFormValues = z.infer<typeof companySchema>;
