// src/services/api/apiClient.ts

import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import toast from "react-hot-toast";

import i18n from "@/config/i18n";
import { signOut } from "@/components/admin/shell/UserMenu";

interface RetryRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export const apiClient = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ??
    "https://synaptecherp.runasp.net/api",
  withCredentials: true,
});

// =====================================================
// Helper: Get Current User
// =====================================================

const getCurrentUser = () => {
  const storedUser = localStorage.getItem("currentUser");

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch {
    localStorage.removeItem("currentUser");
    return null;
  }
};

// =====================================================
// Helper: Get a clean language code for Accept-Language
// =====================================================
// i18next may store "en-US", "ar-EG", "cimode", etc.
// Reduce it to a plain 2-3 letter code the backend can
// always parse. Anything invalid falls back to "en".
// =====================================================

const getLanguageHeader = (): string => {
  const raw = localStorage.getItem("i18nextLng") || "en";
  const base = raw.split("-")[0].toLowerCase();

  return /^[a-z]{2,3}$/.test(base) && base !== "cim" ? base : "en";
};

// =====================================================
// Request Interceptor
// =====================================================

apiClient.interceptors.request.use(
  (config) => {
    const currentUser = getCurrentUser();

    // Add access token
    if (currentUser?.accessToken) {
      config.headers.Authorization = `Bearer ${currentUser.accessToken}`;
    }

    // Add current language (sanitized)
    config.headers["Accept-Language"] = getLanguageHeader();

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// =====================================================
// Response Interceptor
// =====================================================

apiClient.interceptors.response.use(
  // Successful response
  (response) => response,

  // Error response
  async (error: AxiosError) => {
    const originalRequest =
      error.config as RetryRequestConfig | undefined;

    // If Axios doesn't have the original request
    if (!originalRequest) {
      return Promise.reject(error);
    }

    const status = error.response?.status;

    const isRefreshRequest =
      originalRequest.url?.includes("/Auth/refresh-token");

    // =================================================
    // 403 - Forbidden
    // =================================================

    if (status === 403 && !isRefreshRequest) {
      toast.error(i18n.t("errors.actionNotAllowed"));

      return Promise.reject(error);
    }

    // =================================================
    // 401 - Unauthorized
    // =================================================

    const isUnauthorized = status === 401;

    // =================================================
    // Refresh Access Token
    // =================================================

    if (
      isUnauthorized &&
      !originalRequest._retry &&
      !isRefreshRequest
    ) {
      originalRequest._retry = true;

      const currentUser = getCurrentUser();

      // No refresh token stored at all: nothing left to
      // refresh with, so sign out.
      if (!currentUser?.refreshToken) {
        signOut();

        return Promise.reject(error);
      }

      try {
        // Request new access token
        const response = await apiClient.post(
          "/Auth/refresh-token",
          JSON.stringify(currentUser.refreshToken),
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.data?.accessToken) {
          // 2xx but no token: malformed response, not a
          // confirmed expiry. Don't sign out.
          return Promise.reject(
            new Error("Access token was not returned")
          );
        }

        // Update access token
        currentUser.accessToken = response.data.accessToken;

        // Update refresh token if returned
        if (response.data.refreshToken) {
          currentUser.refreshToken = response.data.refreshToken;
        }

        // Save updated user
        localStorage.setItem(
          "currentUser",
          JSON.stringify(currentUser)
        );

        // Update original request Authorization
        originalRequest.headers.Authorization =
          `Bearer ${currentUser.accessToken}`;

        // Retry original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Only sign out if the backend explicitly rejected
        // the refresh token (401/403). Network errors,
        // timeouts, 5xx, CORS etc. don't confirm expiry.
        const refreshStatus = axios.isAxiosError(refreshError)
          ? refreshError.response?.status
          : undefined;

        const refreshTokenRejected =
          refreshStatus === 401 || refreshStatus === 403;

        if (refreshTokenRejected) {
          signOut();
        }

        return Promise.reject(refreshError);
      }
    }

    // =================================================
    // 401 From Refresh Token Request
    // =================================================

    if (isUnauthorized && isRefreshRequest) {
      signOut();

      return Promise.reject(error);
    }

    // =================================================
    // 403 From Refresh Token Request
    // =================================================

    if (status === 403 && isRefreshRequest) {
      signOut();

      return Promise.reject(error);
    }

    // =================================================
    // 400 - Bad Request (log server details for debugging)
    // =================================================

    if (status === 400) {
      console.error("400 Bad Request:", {
        url: originalRequest.url,
        params: originalRequest.params,
        sentHeaders: {
          "Accept-Language": originalRequest.headers?.["Accept-Language"],
          hasAuth: Boolean(originalRequest.headers?.Authorization),
        },
        serverResponse: error.response?.data,
      });
    }

    // =================================================
    // Other Errors
    // =================================================

    return Promise.reject(error);
  }
);