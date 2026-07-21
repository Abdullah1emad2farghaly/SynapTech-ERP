import { apiClient } from "@/services/api/axiosClient";
import type {
  AuthSession,
  ForgotPasswordPayload,
  LoginCredentials,
  RegisterPayload,
  ResetPasswordPayload,
  ResetPasswordTokenState,
} from "@/types/auth.types";

// All business logic (retries, error normalization) stays out of components —
// hooks/useAuth.ts consumes these via TanStack Query.
export const authApi = {
  login: (payload: LoginCredentials) =>
    apiClient.post<AuthSession>("/Auth/login", payload).then((res) => res.data),

  register: (payload: RegisterPayload) =>
    apiClient.post<{ userId: string, email: string, message: string }>("/Auth/register", payload).then((res) => res.data),

  resendVerificationEmail: (email: string) =>
    apiClient.post<{ success: true }>("Auth/resend-confirmation-email", { email }).then((res) => res.data),

  verifyEmailToken: (payload: {userId: string, code: string}) =>
    apiClient.post<{ success: true }>("/Auth/confirm-email", payload).then((res) => res.data),

  forgotPassword: (payload: ForgotPasswordPayload) => 
    apiClient.post<{ success: true }>("/Auth/forgot-password", payload).then((res) => res.data),    

  verifyResetToken: (token: string) =>
    apiClient
      .get<{ state: ResetPasswordTokenState }>(`/auth/reset-password/${token}`)
      .then((res) => res.data),

  resetPassword: (payload: ResetPasswordPayload) =>
    apiClient.post<{ success: true }>("/Auth/reset-password", payload).then((res) => res.data),

  logout: () => apiClient.post("/auth/logout"),
};
