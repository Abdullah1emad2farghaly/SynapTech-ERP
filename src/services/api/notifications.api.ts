// src/services/api/notifications.api.ts

// CONFIRMED: real file is `apiClient.ts`, exporting `apiClient`.
import { apiClient } from './axiosClient';
import type {
  GetNotificationsParams,
  NotificationResponse,
} from '../../types/notification.types';

// CONFIRMED (from apiClient.ts): baseURL is already
// "https://synaptecherp.runasp.net/api" — it already ends in /api, so paths
// here must NOT repeat it, or every call 404s against a nonexistent
// /api/api/... route (this was the actual bug behind the mark-read/delete
// errors — not an interceptor issue).
const BASE = '/notifications';

export const notificationsApi = {
  getAll: async (
    params?: GetNotificationsParams
  ): Promise<NotificationResponse[]> => {
    const { data } = await apiClient.get<NotificationResponse[]>(BASE, {
      params,
    });
    return data;
  },

  getUnreadCount: async (): Promise<number> => {
    const { data } = await apiClient.get<number>(`${BASE}/unread-count`);
    return data;
  },

  markRead: async (id: string): Promise<void> => {
    await apiClient.post(`${BASE}/${id}/mark-read`);
  },

  markAllRead: async (): Promise<void> => {
    await apiClient.post(`${BASE}/mark-all-read`);
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE}/${id}`);
  },
};