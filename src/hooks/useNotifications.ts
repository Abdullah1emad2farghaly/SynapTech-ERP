// src/hooks/useNotifications.ts

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { notificationsApi } from '../services/api/notifications.api';
import type {
  GetNotificationsParams,
  NotificationResponse,
} from '../types/notification.types';

export const notificationsKeys = {
  all: ['notifications'] as const,
  list: (params?: GetNotificationsParams) =>
    [...notificationsKeys.all, 'list', params] as const,
  unreadCount: () => [...notificationsKeys.all, 'unread-count'] as const,
};

export function useNotifications(params?: GetNotificationsParams) {
  return useQuery({
    queryKey: notificationsKeys.list(params),
    queryFn: () => notificationsApi.getAll(params),
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: notificationsKeys.unreadCount(),
    queryFn: () => notificationsApi.getUnreadCount(),
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    // Optimistic update: the brief asks for an instant UI response, not a
    // spinner while waiting on the server.
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: notificationsKeys.all });

      const previousLists = queryClient.getQueriesData<NotificationResponse[]>(
        { queryKey: notificationsKeys.all }
      );
      const previousCount = queryClient.getQueryData<number>(
        notificationsKeys.unreadCount()
      );

      queryClient.setQueriesData<NotificationResponse[]>(
        { queryKey: notificationsKeys.all },
        (old) =>
          old?.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      queryClient.setQueryData<number>(notificationsKeys.unreadCount(), (old) =>
        old && old > 0 ? old - 1 : old
      );

      return { previousLists, previousCount };
    },
    onError: (_err, _id, context) => {
      context?.previousLists?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      if (context?.previousCount !== undefined) {
        queryClient.setQueryData(notificationsKeys.unreadCount(), context.previousCount);
      }
      toast.error('notifications.errors.markReadFailed');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationsKeys.all });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      queryClient.setQueriesData<NotificationResponse[]>(
        { queryKey: notificationsKeys.all },
        (old) => old?.map((n) => ({ ...n, isRead: true }))
      );
      queryClient.setQueryData(notificationsKeys.unreadCount(), 0);
    },
    onError: () => {
      toast.error('notifications.errors.markAllReadFailed');
      queryClient.invalidateQueries({ queryKey: notificationsKeys.all });
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationsApi.remove(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: notificationsKeys.all });

      const previousLists = queryClient.getQueriesData<NotificationResponse[]>(
        { queryKey: notificationsKeys.all }
      );
      let wasUnread = false;

      queryClient.setQueriesData<NotificationResponse[]>(
        { queryKey: notificationsKeys.all },
        (old) => {
          const removed = old?.find((n) => n.id === id);
          if (removed && removed.isRead === false) wasUnread = true;
          return old?.filter((n) => n.id !== id);
        }
      );
      if (wasUnread) {
        queryClient.setQueryData<number>(notificationsKeys.unreadCount(), (old) =>
          old && old > 0 ? old - 1 : old
        );
      }

      return { previousLists };
    },
    onError: (_err, _id, context) => {
      context?.previousLists?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      toast.error('notifications.errors.deleteFailed');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationsKeys.all });
    },
  });
}
