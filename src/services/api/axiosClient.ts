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
// Request Interceptor
// =====================================================

apiClient.interceptors.request.use(
  (config) => {
    const currentUser = getCurrentUser();

    // Add access token
    if (currentUser?.accessToken) {
      config.headers.Authorization = `Bearer ${currentUser.accessToken}`;
    }

    // Add current language
    config.headers["Accept-Language"] =
      localStorage.getItem("i18nextLng") || "en";

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

    if (status === 403) {
      toast.error(
        i18n.t("errors.actionNotAllowed")
      );

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

      // -----------------------------------------------
      // No refresh token
      // -----------------------------------------------

      if (!currentUser?.refreshToken) {
        signOut();

        return Promise.reject(error);
      }

      try {
        // ---------------------------------------------
        // Request new access token
        // ---------------------------------------------

        const response = await apiClient.post(
          "/Auth/refresh-token",
          JSON.stringify(currentUser.refreshToken),
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        // ---------------------------------------------
        // Update access token
        // ---------------------------------------------

        if (!response.data?.accessToken) {
          signOut();

          return Promise.reject(
            new Error("Access token was not returned")
          );
        }

        currentUser.accessToken =
          response.data.accessToken;

        // ---------------------------------------------
        // Update refresh token if returned
        // ---------------------------------------------

        if (response.data.refreshToken) {
          currentUser.refreshToken =
            response.data.refreshToken;
        }

        // ---------------------------------------------
        // Save updated user
        // ---------------------------------------------

        localStorage.setItem(
          "currentUser",
          JSON.stringify(currentUser)
        );

        // ---------------------------------------------
        // Update original request Authorization
        // ---------------------------------------------

        originalRequest.headers.Authorization =
          `Bearer ${currentUser.accessToken}`;

        // ---------------------------------------------
        // Retry original request
        // ---------------------------------------------

        return apiClient(originalRequest);
      } catch (refreshError) {
        // ---------------------------------------------
        // Refresh token is invalid/expired
        // ---------------------------------------------

        signOut();

        return Promise.reject(refreshError);
      }
    }

    // =================================================
    // 401 From Refresh Token Request
    // =================================================

    if (
      isUnauthorized &&
      isRefreshRequest
    ) {
      signOut();

      return Promise.reject(error);
    }

    // =================================================
    // Other Errors
    // =================================================

    return Promise.reject(error);
  }
);