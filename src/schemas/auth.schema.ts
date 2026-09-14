// Intended path: src/schemas/auth.schema.ts
//
// ASSUMPTION FLAG: field names below are NOT confirmed against the real
// Auth API contract (it predates the frontend handoff doc and was never
// detailed there). Verify every field name/shape against the real
// Swagger/OpenAPI spec before wiring these forms to live endpoints.

import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "auth.errors.emailRequired").email("auth.errors.emailInvalid"),
  password: z.string().min(1, "auth.errors.passwordRequired"),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  fullName: z.string().min(2, "auth.errors.fullNameRequired"),
  email: z.string().min(1, "auth.errors.emailRequired").email("auth.errors.emailInvalid"),
  password: z.string().min(8, "auth.errors.passwordMinLength"),
  companyName: z.string().min(2, "auth.errors.companyNameRequired"),
});
export type RegisterFormValues = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "auth.errors.emailRequired").email("auth.errors.emailInvalid"),
});
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

// ASSUMPTION: reset requires email + code + new password. Code length is
// NOT confirmed — VerificationCodeInput defaults to a plain single field
// rather than a fixed number of boxes until the real length is known.
export const resetPasswordSchema = z
  .object({
    email: z.string().min(1, "auth.errors.emailRequired").email("auth.errors.emailInvalid"),
    code: z.string().min(1, "auth.errors.codeRequired"),
    newPassword: z.string().min(8, "auth.errors.passwordMinLength"),
    confirmPassword: z.string().min(1, "auth.errors.confirmPasswordRequired"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "auth.errors.passwordsMustMatch",
    path: ["confirmPassword"],
  });
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

// ASSUMPTION: confirmation uses userId + code, per the brief's own
// description of the flow ("User ID + verification code"). Not verified
// against the real endpoint's request shape.
export const emailConfirmationSchema = z.object({
  userId: z.string().min(1, "auth.errors.userIdRequired"),
  code: z.string().min(1, "auth.errors.codeRequired"),
});
export type EmailConfirmationFormValues = z.infer<typeof emailConfirmationSchema>;

export const resendConfirmationSchema = z.object({
  email: z.string().min(1, "auth.errors.emailRequired").email("auth.errors.emailInvalid"),
});
export type ResendConfirmationFormValues = z.infer<typeof resendConfirmationSchema>;
