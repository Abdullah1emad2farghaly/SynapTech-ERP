// Project path: src/schemas/employee.schema.ts
//
// Separate schemas per the brief's explicit instruction — CreateEmployeeRequest
// is never reused as UpdateEmployeeRequest. Field-level required/format rules
// (e.g. email format, which fields are truly required server-side) are NOT
// confirmed by the API contract, same "UX judgment call" flag used in the
// Suppliers module's schema file. baseSalary is the only field the API types
// as required (non-nullable) on both create and update, so it's the only
// hard-required field beyond hireDate on create.

import { z } from "zod";


export const CreateEmployeeSchema = z.object({
  employeeCode: z
    .string()
    .trim()
    .min(1, "Employee code is required")
    .max(50),

  fullName: z
    .string()
    .trim()
    .min(1, "Full name is required")
    .max(200),

  nationalId: z
    .string()
    .trim()
    .max(50)
    .optional()
    .or(z.literal("")),

  dateOfBirth: z
    .string()
    .optional()
    .or(z.literal("")),

  hireDate: z
    .string()
    .min(1, "Hire date is required"),

  jobTitle: z
    .string()
    .trim()
    .min(1, "Job title is required")
    .max(150),

  departmentId: z
    .string()
    .uuid()
    .optional()
    .or(z.literal("")),

  branchId: z
    .string()
    .uuid()
    .optional()
    .or(z.literal("")),

  managerId: z
    .string()
    .uuid()
    .optional()
    .or(z.literal("")),

  baseSalary: z
    .coerce
    .number()
    .min(0, "Base salary cannot be negative"),

  email: z
    .string()
    .trim()
    .email("Enter a valid email")
    .optional()
    .or(z.literal("")),

  phone: z
    .string()
    .trim()
    .max(30)
    .optional()
    .or(z.literal("")),

  address: z
    .string()
    .trim()
    .max(500)
    .optional()
    .or(z.literal("")),

  // userId is deliberately not exposed on the Create form —
  // linking an existing user account is a distinct action (Grant Access),
  // not part of creating the HR record. Sent as null on create.
});

export type CreateEmployeeFormValues = z.infer<typeof CreateEmployeeSchema>;

// employeeCode intentionally omitted — read-only on edit, never submitted.
export const UpdateEmployeeSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required").max(200),
  nationalId: z.string().trim().max(50).optional().or(z.literal("")),
  dateOfBirth: z.string().optional().or(z.literal("")),
  jobTitle: z.string().trim().max(150).optional().or(z.literal("")),
  departmentId: z.string().uuid().optional().or(z.literal("")),
  branchId: z.string().uuid().optional().or(z.literal("")),
  managerId: z.string().uuid().optional().or(z.literal("")),
  baseSalary: z.coerce.number().min(0, "Base salary cannot be negative"),
  email: z.string().trim().email("Enter a valid email").optional().or(z.literal("")),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  address: z.string().trim().max(500).optional().or(z.literal("")),
  status: z.string().optional().or(z.literal("")),
});
export type UpdateEmployeeFormValues = z.infer<typeof UpdateEmployeeSchema>;

export const GrantEmployeeAccessSchema = z.object({
  email: z.string().trim().email("Enter a valid email").optional().or(z.literal("")),
  roleNames: z.array(z.string()).min(1, "Select at least one role"),
});
export type GrantEmployeeAccessFormValues = z.infer<typeof GrantEmployeeAccessSchema>;
