// src/pages/notifications/NotificationsPage.tsx
//
// ASSUMPTION: GET /api/notifications has no confirmed pagination params, so
// this renders the full returned array client-side (filter/search happen
// in-memory, not via query params) rather than inventing a page/limit
// contract that doesn't exist. If the backend does support pagination,
// swap the client-side filtering below for query params in useNotifications.

import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { BellOff, CheckCheck, Inbox, Search, X } from 'lucide-react';
import {
  useDeleteNotification,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from '@/hooks/useNotifications';
import type { NotificationResponse } from '@/types/notification.types';

type FilterTab = 'all' | 'unread';

export function NotificationsPage() {
  const { t } = useTranslation();
  const { data: notifications = [], isLoading, isError, refetch } =
    useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const deleteNotification = useDeleteNotification();

  const [tab, setTab] = useState<FilterTab>('all');
  const [query, setQuery] = useState('');

  const unreadCount = notifications.filter((n) => n.isRead === false).length;

  const visible = useMemo(() => {
    let list = notifications;
    if (tab === 'unread') list = list.filter((n) => n.isRead === false);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (n) =>
          n.title?.toLowerCase().includes(q) ||
          n.body?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [notifications, tab, query]);

  return (
    <div className="mx-auto flex w-full  flex-col gap-6 py-6 sm:px-4 px-2">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink-primary">
            {t('notifications.page.title', 'Notifications')}
          </h1>
          <p className="mt-1 text-sm text-ink-tertiary">
            {unreadCount > 0
              ? t('notifications.page.subtitleUnread', '{{count}} unread', {
                  count: unreadCount,
                })
              : t('notifications.page.subtitleCaughtUp', "You're all caught up")}
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
            className="inline-flex items-center gap-2 self-start rounded-lg border border-hairline
                       bg-panel px-3.5 py-2 text-sm font-medium text-ink-secondary
                       transition-colors hover:border-signal hover:text-signal
                       disabled:opacity-50 sm:self-auto"
          >
            <CheckCheck size={15} />
            {t('notifications.page.markAllRead', 'Mark all as read')}
          </button>
        )}
      </div>

      {/* Controls: tabs + search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex w-fit rounded-lg border border-hairline bg-panel p-1">
          {(['all', 'unread'] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors ${
                tab === key
                  ? 'bg-signal text-white'
                  : 'text-ink-secondary hover:text-ink-primary'
              }`}
            >
              {key === 'all'
                ? t('notifications.page.tabAll', 'All')
                : t('notifications.page.tabUnread', 'Unread')}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search
            size={15}
            className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-ink-tertiary"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('notifications.page.searchPlaceholder', 'Search notifications')}
            className="w-full rounded-lg border border-hairline bg-panel py-2 ps-9 pe-8 text-sm
                       text-ink-primary placeholder:text-ink-tertiary
                       focus:border-signal focus:outline-none focus:ring-1 focus:ring-signal"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label={t('common.clear', 'Clear')}
              className="absolute end-2.5 top-1/2 -translate-y-1/2 text-ink-tertiary hover:text-ink-primary"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="overflow-hidden rounded-2xl border border-hairline bg-panel">
        {isLoading && (
          <div className="space-y-1 p-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-sunken/70" />
            ))}
          </div>
        )}

        {isError && !isLoading && (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <p className="text-sm text-ink-secondary">
              {t(
                'notifications.page.error',
                "Couldn't load notifications. Try again in a moment."
              )}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="rounded-lg border border-hairline px-3.5 py-1.5 text-sm font-medium
                         text-ink-secondary hover:border-signal hover:text-signal"
            >
              {t('common.retry', 'Retry')}
            </button>
          </div>
        )}

        {!isLoading && !isError && notifications.length === 0 && (
          <div className="flex flex-col items-center gap-3 px-6 py-20 text-center">
            <BellOff size={26} className="text-ink-tertiary" strokeWidth={1.5} />
            <p className="text-base font-medium text-ink-primary">
              {t('notifications.page.emptyTitle', 'No notifications yet')}
            </p>
            <p className="max-w-xs text-sm text-ink-tertiary">
              {t(
                'notifications.page.emptyBody',
                "When something needs your attention, it'll show up here."
              )}
            </p>
          </div>
        )}

        {!isLoading && !isError && notifications.length > 0 && visible.length === 0 && (
          <div className="flex flex-col items-center gap-3 px-6 py-20 text-center">
            <Inbox size={26} className="text-ink-tertiary" strokeWidth={1.5} />
            <p className="text-sm text-ink-secondary">
              {t('notifications.page.noMatches', 'No notifications match your filters')}
            </p>
          </div>
        )}

        {!isLoading && !isError && visible.length > 0 && (
          <ul className="divide-y divide-hairline">
            <AnimatePresence initial={false}>
              {visible.map((n) => (
                <NotificationRow
                  key={n.id}
                  notification={n}
                  onMarkRead={() => markRead.mutate(n.id)}
                  onDelete={() => deleteNotification.mutate(n.id)}
                />
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </div>
  );
}

function formatTimestamp(value?: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function NotificationRow({
  notification,
  onMarkRead,
  onDelete,
}: {
  notification: NotificationResponse;
  onMarkRead: () => void;
  onDelete: () => void;
}) {
  const { t } = useTranslation();
  const isUnread = notification.isRead === false;

  return (
    <motion.li
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.18 }}
      onClick={() => isUnread && onMarkRead()}
      className={`group relative flex cursor-pointer gap-3 px-4 py-4 transition-colors hover:bg-sunken sm:px-5 ${
        isUnread ? 'bg-signal/[0.04]' : ''
      }`}
    >
      <span
        aria-hidden
        className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${
          isUnread ? 'bg-signal' : 'bg-transparent'
        }`}
      />

      <div className="min-w-0 flex-1">
        <p
          className={`text-sm ${
            isUnread ? 'font-medium text-ink-primary' : 'text-ink-secondary'
          }`}
        >
          {notification.title ?? t('notifications.item.untitled', 'Notification')}
        </p>
        {notification.body && (
          <p className="mt-0.5 text-sm text-ink-tertiary">{notification.body}</p>
        )}
        {notification.createdAt && (
          <p className="mt-1.5 text-xs text-ink-tertiary">
            {formatTimestamp(notification.createdAt)}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        aria-label={t('notifications.item.delete', 'Delete notification')}
        className="shrink-0 self-start rounded-md p-1.5 text-ink-tertiary opacity-0
                   transition-opacity hover:bg-canvas hover:text-error
                   focus-visible:opacity-100 focus-visible:outline-none
                   group-hover:opacity-100"
      >
        <X size={15} />
      </button>
    </motion.li>
  );
}
