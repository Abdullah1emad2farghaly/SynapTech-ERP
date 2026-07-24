import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import { useAuthStore } from "@/store/authStore";

interface RetryRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export const apiClient = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ??
    "https://synaptecherp.runasp.net/api",
  withCredentials: true,
});

// Safely get the current user from localStorage
const getCurrentUser = () => {
  const storedUser = localStorage.getItem("currentUser");

  if (!storedUser) return null;

  try {
    return JSON.parse(storedUser);
  } catch {
    localStorage.removeItem("currentUser");
    return null;
  }
};

// ---------------------------
// Request Interceptor
// ---------------------------
apiClient.interceptors.request.use(
  (config) => {
    const currentUser = getCurrentUser();

    const token = currentUser?.accessToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const language =
      localStorage.getItem("i18nextLng") || "en";

    config.headers["Accept-Language"] = language;

    return config;
  },
  (error) => Promise.reject(error)
);

// ---------------------------
// Response Interceptor
// ---------------------------
apiClient.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest =
      error.config as RetryRequestConfig | undefined;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const isUnauthorized = error.response?.status === 401;
    const isRefreshRequest =
      originalRequest.url?.includes("/Auth/refresh-token");

    if (
      isUnauthorized &&
      !originalRequest._retry &&
      !isRefreshRequest
    ) {
      originalRequest._retry = true;

      const currentUser = getCurrentUser();

      if (!currentUser?.refreshToken) {
        useAuthStore.getState().clearSession();
        return Promise.reject(error);
      }

      try {
        const response = await apiClient.post("/Auth/refresh-token", {
          refreshToken: currentUser.refreshToken,
        });

        currentUser.accessToken = response.data.accessToken;

        if (response.data.refreshToken) {
          currentUser.refreshToken =
            response.data.refreshToken;
        }

        localStorage.setItem(
          "currentUser",
          JSON.stringify(currentUser)
        );

        originalRequest.headers.Authorization = `Bearer ${currentUser.accessToken}`;

        return apiClient(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().clearSession();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);