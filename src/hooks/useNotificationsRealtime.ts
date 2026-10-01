// src/hooks/useNotificationsRealtime.ts

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { notificationsHub } from '../services/realtime/notificationsHub';
import { notificationsKeys } from './useNotifications';
import type { NotificationResponse } from '../types/notification.types';

/**
 * Mount once for the authenticated session (e.g. in AppShell, alongside where
 * useUnreadCount/useNotifications are first read) — NOT once per NotificationBell
 * render, so remounting the bell never opens a second connection.
 *
 * Responsibilities:
 *  - starts/stops the single shared SignalR connection
 *  - on `ReceiveNotification`: prepends into the cached list, deduped by id,
 *    and shows a toast
 *  - on `UnreadCountChanged`: writes the badge count directly (no REST poll)
 */
export function useNotificationsRealtime() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    notificationsHub.start();

    const offReceive = notificationsHub.onReceive((incoming) => {
      queryClient.setQueriesData<NotificationResponse[]>(
        { queryKey: notificationsKeys.all },
        (old) => {
          if (!old) return old;
          // Duplicate protection: the same notification may already be in
          // the REST-fetched list. Use the confirmed `id` field only.
          const alreadyPresent = old.some((n) => n.id === incoming.id);
          if (alreadyPresent) return old;
          return [incoming, ...old];
        }
      );

      toast(incoming.title ?? incoming.body ?? t('notifications.toast.new'));
    });

    const offCount = notificationsHub.onUnreadCountChanged((count) => {
      queryClient.setQueryData(notificationsKeys.unreadCount(), count);
    });

    return () => {
      offReceive();
      offCount();
      startedRef.current = false;
      notificationsHub.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
