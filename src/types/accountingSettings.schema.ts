// Project path: src/schemas/accountingSettings.schema.ts

import { z } from 'zod';

// Every field is a nullable account reference (a settings slot can be left
// unassigned) — the backend contract has no required flag on any of them,
// so nothing here is marked required beyond "must be a valid account id
// once set".
export const accountingSettingsSchema = z.object({
  inventoryAccountId: z.string().uuid().nullable(),
  accountsPayableAccountId: z.string().uuid().nullable(),
  accountsReceivableAccountId: z.string().uuid().nullable(),
  revenueAccountId: z.string().uuid().nullable(),
  costOfGoodsSoldAccountId: z.string().uuid().nullable(),
  cashAccountId: z.string().uuid().nullable(),
});

export type AccountingSettingsFormValues = z.infer<typeof accountingSettingsSchema>;
