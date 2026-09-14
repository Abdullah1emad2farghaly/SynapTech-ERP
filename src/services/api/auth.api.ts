// Intended path: src/services/api/auth.api.ts
//
// ASSUMPTION FLAG: this entire file is an assumed contract. The real Auth
// module was built before this handoff document's scope and its API
// surface was never detailed in it. Endpoints, request/response field
// names, token behavior, and error shapes below are placeholders — verify
// every one of them against the real Swagger/OpenAPI spec before use.
//
// Uses the CONFIRMED real client import (not the old assumed
// services/api/client.ts default export):
import { apiClient } from "./axiosClient";
import type {
  LoginFormValues,
  RegisterFormValues,
  ForgotPasswordFormValues,
  ResetPasswordFormValues,
  EmailConfirmationFormValues,
  ResendConfirmationFormValues,
} from "../../schemas/auth.schema";

// ASSUMPTION: shape of a successful login/register response.
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  userId: string;
  email: string;
  fullName: string;
}

export async function login(payload: LoginFormValues): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/api/Auth/login", payload);
  return data;
}

// ASSUMPTION: register returns the created userId rather than a full
// session, since email confirmation is required before login elsewhere in
// the flow (section 21 of the brief implies register -> confirm -> login).
export async function register(
  payload: RegisterFormValues
): Promise<{ userId: string; email: string }> {
  const { data } = await apiClient.post("/api/Auth/register", payload);
  return data;
}

export async function confirmEmail(payload: EmailConfirmationFormValues): Promise<void> {
  await apiClient.post("/api/Auth/confirm-email", payload);
}

export async function resendConfirmation(payload: ResendConfirmationFormValues): Promise<void> {
  await apiClient.post("/api/Auth/resend-confirmation", payload);
}

export async function forgotPassword(payload: ForgotPasswordFormValues): Promise<void> {
  await apiClient.post("/api/Auth/forgot-password", payload);
}

export async function resetPassword(payload: ResetPasswordFormValues): Promise<void> {
  const { confirmPassword, ...rest } = payload;
  await apiClient.post("/api/Auth/reset-password", rest);
}

// ASSUMPTION: refresh-token request body shape. Section 23 of the brief
// states the refresh endpoint follows the existing Swagger contract —
// this placeholder must be reconciled with that contract, not invented.
export async function refreshToken(refreshToken: string): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/api/Auth/refresh-token", {
    refreshToken,
  });
  return data;
}

export async function logout(): Promise<void> {
  await apiClient.post("/api/Auth/logout");
}
