// src/components/admin/shell/NotificationBell.tsx
//
// NOTE: this is a FRESH BUILD, not an edit of your real component — it was
// never provided in this session. It matches the prop interface already
// wired through Navbar.tsx/AppShell.tsx (notifications, unreadCount,
// onNotificationClick, onMarkAllRead, onDeleteNotification), so dropping it
// in should work end-to-end, but check it against whatever your real
// NotificationBell.tsx currently does before replacing it — you may have
// existing behavior/styling here worth keeping.
//
// Behavior (per your last request): clicking the bell navigates straight to
// /notifications and marks everything read (calls onMarkAllRead), rather
// than opening an inline dropdown/preview panel.

import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

/** ASSUMPTION — same shape used by AppShell's mapToNotificationItem. Replace
 *  with the real type once the backend's NotificationResponse is confirmed. */
export interface NotificationItem {
  id: string;
  title: string;
  message?: string;
  isRead: boolean;
  createdAt?: string;
}

interface NotificationBellProps {
  notifications: NotificationItem[];
  /** Falls back to counting unread items in `notifications` if not given. */
  unreadCount?: number;
  onNotificationClick?: (id: string) => void;
  onMarkAllRead?: () => void;
  onDeleteNotification?: (id: string) => void;
}

export function NotificationBell({
  notifications,
  unreadCount,
  onMarkAllRead,
}: NotificationBellProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const effectiveUnreadCount =
    unreadCount ?? notifications.filter((n) => !n.isRead).length;
  const badgeLabel = effectiveUnreadCount > 99 ? '99+' : String(effectiveUnreadCount);

  const handleClick = () => {
    navigate('/notifications');
    if (effectiveUnreadCount > 0) {
      onMarkAllRead?.();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={t('notifications.bell.ariaLabel', {
        count: effectiveUnreadCount,
        defaultValue: 'Notifications, {{count}} unread',
      })}
      className="relative flex h-9 w-9 items-center justify-center rounded-lg text-ink-secondary
                 transition-colors duration-150 hover:bg-sunken hover:text-ink-primary
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal"
    >
      <Bell size={18} strokeWidth={1.75} />

      <AnimatePresence>
        {effectiveUnreadCount > 0 && (
          <motion.span
            key="badge"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ duration: 0.16 }}
            className="absolute -top-0.5 -end-0.5 flex h-4 min-w-4 items-center justify-center
                       rounded-full bg-error px-1 text-[10px] font-medium leading-none text-white"
          >
            {badgeLabel}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
