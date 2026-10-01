// src/components/admin/shell/AppShell.tsx
//
// CHANGED FROM ORIGINAL:
//  - `notifications` is no longer an external prop. AppShell now fetches real
//    data itself (useNotifications/useUnreadCount) and starts the realtime
//    connection (useNotificationsRealtime), so every page gets live
//    notifications automatically instead of each caller having to supply them.
//  - Mark-all-read is wired through; per-item mark-read/delete are passed
//    down too, in case the existing NotificationBell/Navbar already expose
//    slots for them (see ASSUMPTION below — I don't have those two files).
//
// ASSUMPTION (no access to NotificationBell.tsx / Navbar.tsx): I don't know
// the real `NotificationItem` field names, or whether Navbar currently
// accepts anything beyond `notifications`. `mapToNotificationItem` below is
// the ONLY place that should need editing once you paste those two files —
// everything else (data fetching, realtime, mark-all-read) is wired
// correctly regardless of the exact field names.

import type { ReactNode } from 'react';
import { Sidebar } from '@/components/admin/shell/Sidebar';
import { Navbar } from '@/components/admin/shell/Navbar';
import type { NotificationItem } from '@/components/admin/shell/NotificationBell';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useDeleteNotification,
  useNotifications,
  useUnreadCount,
} from '@/hooks/useNotifications';
import { useNotificationsRealtime } from '@/hooks/useNotificationsRealtime';
import type { NotificationResponse } from '@/types/notification.types';

interface AppShellProps {
  children: ReactNode;
  onSearchFocus?: () => void;
}

/**
 * ASSUMPTION — adjust field names once the real `NotificationItem` type is
 * visible. Everything on the right is from the CONFIRMED backend contract
 * (`NotificationResponse`); everything on the left is a guess at what
 * `NotificationItem` calls it.
 */
function mapToNotificationItem(n: NotificationResponse): NotificationResponse {
  return {
    id: n.id,
    title: n.title ?? 'Notification',
    body: n.body,
    isRead: n.isRead ?? false,
    createdAt: n.createdAt,
    link: n.link,
  } as NotificationResponse;
}

export function AppShell({ children, onSearchFocus }: AppShellProps) {
  // Starts the single shared SignalR connection for the session. Mounted
  // here (once, high in the tree) rather than inside the bell, so it
  // survives navigation and never duplicates on remount.
  useNotificationsRealtime();

  const { data: rawNotifications = [] } = useNotifications();
  const { data: unreadCount = 0 } = useUnreadCount();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const deleteNotification = useDeleteNotification();

  const notifications = rawNotifications.map(mapToNotificationItem);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-canvas">
      {/* Sidebar (Desktop + Mobile Drawer) */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar
          notifications={notifications}
          unreadCount={unreadCount}
          onNotificationClick={(id: string) => markRead.mutate(id)}
          onMarkAllRead={() => markAllRead.mutate()}
          onDeleteNotification={(id: string) => deleteNotification.mutate(id)}
          onSearchFocus={onSearchFocus}
        />
        {/* Navbar.tsx has been updated (see Navbar.tsx in this batch) to
            accept and forward unreadCount/onNotificationClick/onMarkAllRead/
            onDeleteNotification to NotificationBell. Still pending:
            NotificationBell.tsx itself, to actually use them. */}

        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
