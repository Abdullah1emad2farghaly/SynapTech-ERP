// src/hooks/useNotifications.ts

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import axios from 'axios';

import { notificationsApi } from '../services/api/notifications.api';
import type {
  GetNotificationsParams,
  NotificationResponse,
} from '../types/notification.types';

// =====================================================
// Query Keys
// =====================================================

export const notificationsKeys = {
  // Root key for all notification-related queries
  all: ['notifications'] as const,

  // Prefix for notification list queries only
  lists: () => [...notificationsKeys.all, 'list'] as const,

  // Specific notification list query
  list: (params?: GetNotificationsParams) =>
    [...notificationsKeys.lists(), params] as const,

  // Unread count query
  unreadCount: () =>
    [...notificationsKeys.all, 'unread-count'] as const,
};

// =====================================================
// Get Notifications
// =====================================================

export function useNotifications(params?: GetNotificationsParams) {
  return useQuery({
    queryKey: notificationsKeys.list(params),
    queryFn: () => notificationsApi.getAll(params),
  });
}

// =====================================================
// Get Unread Count
// =====================================================

export function useUnreadCount() {
  return useQuery({
    queryKey: notificationsKeys.unreadCount(),
    queryFn: () => notificationsApi.getUnreadCount(),
  });
}

// =====================================================
// Mark Single Notification as Read
// =====================================================

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),

    // -------------------------------------------------
    // Optimistic Update
    // -------------------------------------------------

    onMutate: async (id: string) => {
      // Cancel only notification LIST queries.
      // Do not cancel unread-count here because it has
      // a different data type (number).
      await queryClient.cancelQueries({
        queryKey: notificationsKeys.lists(),
      });

      // Keep previous list data for rollback.
      const previousLists =
        queryClient.getQueriesData<NotificationResponse[]>({
          queryKey: notificationsKeys.lists(),
        });

      // Keep previous unread count for rollback.
      const previousCount = queryClient.getQueryData<number>(
        notificationsKeys.unreadCount()
      );

      // Optimistically mark the notification as read.
      queryClient.setQueriesData<NotificationResponse[]>(
        {
          queryKey: notificationsKeys.lists(),
        },
        (old) => {  
          if (!old) {
            return old;
          }

          return old.map((notification) =>
            notification.id === id
              ? {
                  ...notification,
                  isRead: true,
                }
              : notification
          );
        }
      );

      // Optimistically decrease unread count.
      if (previousCount !== undefined) {
        queryClient.setQueryData<number>(
          notificationsKeys.unreadCount(),
          Math.max(0, previousCount - 1)
        );
      }

      return {
        previousLists,
        previousCount,
      };
    },

    // -------------------------------------------------
    // Error / Rollback
    // -------------------------------------------------

    onError: (error, _id, context) => {
      console.error('Mark notification as read failed:', error);

      if (axios.isAxiosError(error)) {
        console.error('Status:', error.response?.status);
        console.error('Response:', error.response?.data);
        console.error('URL:', error.config?.url);
        console.error('Method:', error.config?.method);
      }

      // Restore previous notification lists.
      context?.previousLists?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });

      // Restore previous unread count.
      if (context?.previousCount !== undefined) {
        queryClient.setQueryData(
          notificationsKeys.unreadCount(),
          context.previousCount
        );
      }

      toast.error('notifications.errors.markReadFailed');
    },

    // -------------------------------------------------
    // Final Synchronization
    // -------------------------------------------------

    onSettled: () => {
      // Refresh both notification lists and unread count.
      queryClient.invalidateQueries({
        queryKey: notificationsKeys.all,
      });
    },
  });
}

// =====================================================
// Mark All Notifications as Read
// =====================================================

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsApi.markAllRead(),

    // -------------------------------------------------
    // Optimistic Update
    // -------------------------------------------------

    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: notificationsKeys.lists(),
      });

      await queryClient.cancelQueries({
        queryKey: notificationsKeys.unreadCount(),
      });

      const previousLists =
        queryClient.getQueriesData<NotificationResponse[]>({
          queryKey: notificationsKeys.lists(),
        });

      const previousCount = queryClient.getQueryData<number>(
        notificationsKeys.unreadCount()
      );

      // Optimistically mark every notification as read.
      queryClient.setQueriesData<NotificationResponse[]>(
        {
          queryKey: notificationsKeys.lists(),
        },
        (old) => {
          if (!old) {
            return old;
          }

          return old.map((notification) => ({
            ...notification,
            isRead: true,
          }));
        }
      );

      // Optimistically set unread count to zero.
      queryClient.setQueryData<number>(
        notificationsKeys.unreadCount(),
        0
      );

      return {
        previousLists,
        previousCount,
      };
    },

    // -------------------------------------------------
    // Error / Rollback
    // -------------------------------------------------

    onError: (error, _variables, context) => {
      console.error('Mark all notifications as read failed:', error);

      if (axios.isAxiosError(error)) {
        console.error('Status:', error.response?.status);
        console.error('Response:', error.response?.data);
        console.error('URL:', error.config?.url);
        console.error('Method:', error.config?.method);
      }

      // Restore notification lists.
      context?.previousLists?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });

      // Restore unread count.
      if (context?.previousCount !== undefined) {
        queryClient.setQueryData(
          notificationsKeys.unreadCount(),
          context.previousCount
        );
      }

      toast.error('notifications.errors.markAllReadFailed');
    },

    // -------------------------------------------------
    // Final Synchronization
    // -------------------------------------------------

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: notificationsKeys.all,
      });
    },
  });
}

// =====================================================
// Delete Notification
// =====================================================

export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationsApi.remove(id),

    // -------------------------------------------------
    // Optimistic Update
    // -------------------------------------------------

    onMutate: async (id: string) => {
      // Cancel only list queries.
      await queryClient.cancelQueries({
        queryKey: notificationsKeys.lists(),
      });

      await queryClient.cancelQueries({
        queryKey: notificationsKeys.unreadCount(),
      });

      // Store previous notification lists.
      const previousLists =
        queryClient.getQueriesData<NotificationResponse[]>({
          queryKey: notificationsKeys.lists(),
        });

      // Store previous unread count.
      const previousCount = queryClient.getQueryData<number>(
        notificationsKeys.unreadCount()
      );

      let wasUnread = false;

      // Optimistically remove notification from every cached list.
      queryClient.setQueriesData<NotificationResponse[]>(
        {
          queryKey: notificationsKeys.lists(),
        },
        (old) => {
          if (!old) {
            return old;
          }

          const notification = old.find(
            (item) => item.id === id
          );

          if (notification?.isRead === false) {
            wasUnread = true;
          }

          return old.filter(
            (item) => item.id !== id
          );
        }
      );

      // If the deleted notification was unread,
      // optimistically decrease unread count.
      if (wasUnread && previousCount !== undefined) {
        queryClient.setQueryData<number>(
          notificationsKeys.unreadCount(),
          Math.max(0, previousCount - 1)
        );
      }

      return {
        previousLists,
        previousCount,
      };
    },

    // -------------------------------------------------
    // Error / Rollback
    // -------------------------------------------------

    onError: (error, _id, context) => {
      console.error('Delete notification failed:', error);

      if (axios.isAxiosError(error)) {
        console.error('Status:', error.response?.status);
        console.error('Response:', error.response?.data);
        console.error('URL:', error.config?.url);
        console.error('Method:', error.config?.method);
      }

      // Restore notification lists.
      context?.previousLists?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });

      // Restore unread count.
      if (context?.previousCount !== undefined) {
        queryClient.setQueryData(
          notificationsKeys.unreadCount(),
          context.previousCount
        );
      }

      toast.error('notifications.errors.deleteFailed');
    },

    // -------------------------------------------------
    // Final Synchronization
    // -------------------------------------------------

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: notificationsKeys.all,
      });
    },
  });
}

