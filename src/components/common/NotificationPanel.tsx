// src/components/common/NotificationPanel.tsx

import { motion } from 'framer-motion';
import { BellOff, CheckCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  useMarkAllNotificationsRead,
  useNotifications,
  useUnreadCount,
} from '../../hooks/useNotifications';
import { NotificationItem } from './NotificationItem';

interface NotificationPanelProps {
  onClose: () => void;
}

export function NotificationPanel({ onClose }: NotificationPanelProps) {
  const { t } = useTranslation();
  const { data: notifications, isLoading, isError } = useNotifications();
  const { data: unreadCount = 0 } = useUnreadCount();
  const markAllRead = useMarkAllNotificationsRead();

  return (
    <motion.div
      role="dialog"
      aria-label={t('notifications.panel.ariaLabel', 'Notifications')}
      initial={{ opacity: 0, y: -6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.98 }}
      transition={{ duration: 0.14, ease: 'easeOut' }}
      className="absolute end-0 z-50 mt-2 flex max-h-[28rem] w-[22rem] flex-col overflow-hidden
                 rounded-2xl border border-hairline bg-panel shadow-lg
                 sm:w-96"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
        <h2 className="text-sm font-medium text-ink-primary">
          {t('notifications.panel.title', 'Notifications')}
        </h2>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium
                       text-ink-secondary transition-colors hover:bg-sunken hover:text-signal
                       disabled:opacity-50"
          >
            <CheckCheck size={14} />
            {t('notifications.panel.markAllRead', 'Mark all as read')}
          </button>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="space-y-1 p-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-14 animate-pulse rounded-lg bg-sunken/70"
              />
            ))}
          </div>
        )}

        {isError && !isLoading && (
          <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
            <p className="text-sm text-ink-secondary">
              {t(
                'notifications.panel.error',
                "Couldn't load notifications. Try again in a moment."
              )}
            </p>
          </div>
        )}

        {!isLoading && !isError && notifications?.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
            <BellOff size={22} className="text-ink-tertiary" strokeWidth={1.5} />
            <p className="text-sm font-medium text-ink-primary">
              {t('notifications.panel.emptyTitle', "You're all caught up")}
            </p>
            <p className="text-xs text-ink-tertiary">
              {t(
                'notifications.panel.emptyBody',
                "New notifications will show up here."
              )}
            </p>
          </div>
        )}

        {!isLoading && !isError && !!notifications?.length && (
          <ul className="divide-y divide-hairline">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClose={onClose}
              />
            ))}
          </ul>
        )}
      </div>
    </motion.div>
  );
}
