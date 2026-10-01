// src/components/common/NotificationItem.tsx

import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  useDeleteNotification,
  useMarkNotificationRead,
} from '../../hooks/useNotifications';
import type { NotificationResponse } from '../../types/notification.types';

interface NotificationItemProps {
  notification: NotificationResponse;
  onClose: () => void;
}

/** ASSUMPTION: no confirmed relative-time formatter exists project-wide, so
 *  this falls back to the raw ISO string when `createdAt` isn't parseable —
 *  swap for the real formatter/util if one already exists. */
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

export function NotificationItem({ notification, onClose }: NotificationItemProps) {
  const { t } = useTranslation();
  const markRead = useMarkNotificationRead();
  const deleteNotification = useDeleteNotification();

  const isUnread = notification.isRead === false;
  const timestamp = formatTimestamp(notification.createdAt);

  const handleOpen = () => {
    if (isUnread) markRead.mutate(notification.id);
    onClose();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNotification.mutate(notification.id);
  };

  return (
    <li
      role="button"
      tabIndex={0}
      onClick={handleOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleOpen();
      }}
      className={`group relative flex cursor-pointer gap-3 px-4 py-3 text-start transition-colors
                  hover:bg-sunken focus-visible:outline-none focus-visible:bg-sunken
                  ${isUnread ? 'bg-signal/[0.04]' : ''}`}
    >
      {/* Unread indicator */}
      <span
        aria-hidden
        className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
          isUnread ? 'bg-signal' : 'bg-transparent'
        }`}
      />

      <div className="min-w-0 flex-1">
        <p
          className={`truncate text-sm ${
            isUnread ? 'font-medium text-ink-primary' : 'text-ink-secondary'
          }`}
        >
          {notification.title ?? t('notifications.item.untitled', 'Notification')}
        </p>
        {notification.body && (
          <p className="mt-0.5 line-clamp-2 text-xs text-ink-tertiary">
            {notification.body}
          </p>
        )}
        {timestamp && (
          <p className="mt-1 text-[11px] text-ink-tertiary">{timestamp}</p>
        )}
      </div>

      <button
        type="button"
        onClick={handleDelete}
        aria-label={t('notifications.item.delete', 'Delete notification')}
        className="shrink-0 self-start rounded-md p-1 text-ink-tertiary opacity-0
                   transition-opacity hover:bg-panel hover:text-error
                   focus-visible:opacity-100 focus-visible:outline-none
                   group-hover:opacity-100"
      >
        <X size={14} />
      </button>
    </li>
  );
}
