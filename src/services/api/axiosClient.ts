import axios from "axios";
import { useAuthStore } from "@/store/authStore";



export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "https://synaptecherp.runasp.net/api",
  withCredentials: true, // refresh token travels as an httpOnly cookie
});

apiClient.interceptors.request.use((config) => {
  const storedUser = window.localStorage.getItem('currentUser');
  let currentUser;

  if(storedUser)
    currentUser = JSON.parse(storedUser);

  const token = currentUser.accessToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const language = localStorage.getItem("i18nextLng") || "en";

  config.headers["Accept-Language"] = language;

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      const storedUser = localStorage.getItem("currentUser");

      if (!storedUser) {
        useAuthStore.getState().clearSession();
        return Promise.reject(error);
      }

      const currentUser = JSON.parse(storedUser);

      try {
        const response = await apiClient.post(
          `/refresh-token`,
          {
            refreshToken: currentUser.refreshToken,
          }
        );

        currentUser.accessToken = response.data.accessToken;

        if (response.data.refreshToken) {
          currentUser.refreshToken = response.data.refreshToken;
        }

        localStorage.setItem(
          "currentUser",
          JSON.stringify(currentUser)
        );

        originalRequest.headers.Authorization =
          `Bearer ${currentUser.accessToken}`;

        return apiClient(originalRequest);
      } catch {
        useAuthStore.getState().clearSession();
      }
    }

    return Promise.reject(error);
  }
);
