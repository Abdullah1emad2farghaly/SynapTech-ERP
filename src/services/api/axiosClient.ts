import axios from "axios";
import { useAuthStore } from "@/store/authStore";



export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "https://synaptecherp.runasp.net/api",
  withCredentials: true, // refresh token travels as an httpOnly cookie
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearSession();
    }
    return Promise.reject(error);
  }
);
