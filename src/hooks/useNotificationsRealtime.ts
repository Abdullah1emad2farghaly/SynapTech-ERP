// src/hooks/useNotificationsRealtime.ts

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { notificationsHub } from '../services/realtime/notificationsHub';
import { notificationsKeys } from './useNotifications';

import type {
  NotificationResponse,
} from '../types/notification.types';

/**
 * Mount once for the authenticated session.
 *
 * Recommended location:
 * AppShell / authenticated layout
 *
 * IMPORTANT:
 * This hook subscribes to the shared SignalR connection,
 * but it does NOT stop the connection when the component
 * unmounts.
 *
 * The SignalR connection should be stopped explicitly during
 * logout.
 */
export function useNotificationsRealtime() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  useEffect(() => {
    let mounted = true;

    /**
     * Start the shared SignalR connection.
     */
    const startConnection = async () => {
      try {
        await notificationsHub.start();

        if (!mounted) {
          return;
        }

        console.log(
          '[useNotificationsRealtime] SignalR connected'
        );
      } catch (error) {
        if (!mounted) {
          return;
        }

        console.error(
          '[useNotificationsRealtime] SignalR connection failed:',
          error
        );
      }
    };

    startConnection();

    /**
     * Receive new notification.
     */
    const offReceive = notificationsHub.onReceive(
      (incoming) => {
        if (!mounted) {
          return;
        }

        queryClient.setQueriesData<
          NotificationResponse[]
        >(
          {
            queryKey: notificationsKeys.all,
          },
          (old) => {
            if (!old) {
              return old;
            }

            /**
             * Prevent duplicate notifications.
             */
            const alreadyPresent = old?.some(
              (notification) =>
                notification.id === incoming.id
            );

            if (alreadyPresent) {
              return old;
            }

            return [
              incoming,
              ...old,
            ];
          }
        );

        /**
         * Show notification toast.
         */
        toast(
          incoming.title ??
            incoming.body ??
            t('notifications.toast.new')
        );
      }
    );

    /**
     * Receive unread count updates.
     */
    const offCount =
      notificationsHub.onUnreadCountChanged(
        (count) => {
          if (!mounted) {
            return;
          }

          queryClient.setQueryData(
            notificationsKeys.unreadCount(),
            count
          );
        }
      );

    /**
     * Cleanup only this component's listeners.
     *
     * IMPORTANT:
     * Do NOT call notificationsHub.stop() here.
     *
     * The SignalR connection is shared globally and should
     * remain alive for the authenticated session.
     */
    return () => {
      mounted = false;

      offReceive();
      offCount();
    };
  }, [queryClient, t]);
}
