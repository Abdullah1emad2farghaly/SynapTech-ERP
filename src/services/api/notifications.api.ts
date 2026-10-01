// src/services/api/notifications.api.ts

// ASSUMPTION: real project's axios instance is exported as `apiClient` from
// `services/api/axiosClient.ts` (per project history, this replaced the
// earlier-assumed `client.ts`). Adjust the import path/name if it differs.
import { apiClient } from './axiosClient';
import type {
  GetNotificationsParams,
  NotificationResponse,
} from '../../types/notification.types';

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
