// Project path: src/schemas/journalEntries.schema.ts

import { z } from "zod";

const journalLineSchema = z
  .object({
    accountId: z.string().min(1, "journalEntries.validation.accountRequired"),
    debit: z.coerce.number().min(0, "journalEntries.validation.negativeValue"),
    credit: z.coerce.number().min(0, "journalEntries.validation.negativeValue"),
    description: z.string().max(200).optional(),
  })
  .refine((line) => !(line.debit > 0 && line.credit > 0), {
    message: "journalEntries.validation.debitAndCreditSameRow",
    path: ["credit"],
  })
  .refine((line) => line.debit > 0 || line.credit > 0, {
    message: "journalEntries.validation.lineNeedsAmount",
    path: ["debit"],
  });

export const createJournalEntrySchema = z
  .object({
    entryDate: z.string().min(1, "journalEntries.validation.dateRequired"),
    description: z.string().max(500).optional(),
    lines: z
      .array(journalLineSchema)
      .min(2, "journalEntries.validation.minTwoLines"),
  })
  .refine(
    (entry) => {
      const totalDebit = entry.lines.reduce((sum, l) => sum + l.debit, 0);
      const totalCredit = entry.lines.reduce((sum, l) => sum + l.credit, 0);
      return Math.abs(totalDebit - totalCredit) < 0.005;
    },
    {
      message: "journalEntries.validation.notBalanced",
      path: ["lines"],
    }
  );

export type CreateJournalEntryFormValues = z.infer<
  typeof createJournalEntrySchema
>;
