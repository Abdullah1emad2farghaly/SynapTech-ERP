// Project path: src/schemas/roles.schema.ts

import { z } from "zod";

// NOTE: character limits are UX guesses (character-counter UI needs *some* max) —
// not confirmed against a real backend validation contract. Adjust once confirmed.
export const createRoleSchema = z.object({
  name: z
    .string()
    .min(2, "roles.validation.nameMin")
    .max(60, "roles.validation.nameMax"),
  description: z
    .string()
    .min(1, "roles.validation.descriptionRequired")
    .max(240, "roles.validation.descriptionMax"),
  permissionCodes: z
    .array(z.string())
    .min(1, "roles.validation.permissionsMin"),
});

export const editRoleSchema = z.object({
  name: z
    .string()
    .min(2, "roles.validation.nameMin")
    .max(60, "roles.validation.nameMax"),
  description: z
    .string()
    .min(1, "roles.validation.descriptionRequired")
    .max(240, "roles.validation.descriptionMax"),
});

export type CreateRoleFormValues = z.infer<typeof createRoleSchema>;
export type EditRoleFormValues = z.infer<typeof editRoleSchema>;
