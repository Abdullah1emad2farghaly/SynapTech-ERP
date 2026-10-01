// src/components/common/NotificationBell.tsx
//
// ASSUMPTION: no confirmed generic Popover/Dropdown/Sheet primitive exists in
// common/ (only Drawer, ConfirmationDialog, DataTable, MultiSelectSearchable,
// TreeSelect are confirmed). This component owns its own lightweight
// anchored-panel + outside-click + Escape handling rather than assuming an
// unconfirmed Popover exists. If the project DOES already have one (e.g. a
// Radix-based Popover), swap the markup below for it and drop the manual
// open-state/outside-click logic.

import { useEffect, useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useUnreadCount } from '../../hooks/useNotifications';
import { NotificationPanel } from './NotificationPanel';

export function NotificationBell() {
  const { t } = useTranslation();
  const { data: unreadCount = 0 } = useUnreadCount();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const badgeLabel = unreadCount > 99 ? '99+' : String(unreadCount);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={t('notifications.bell.ariaLabel', {
          count: unreadCount,
          defaultValue: 'Notifications, {{count}} unread',
        })}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-ink-secondary
                   transition-colors duration-150 hover:bg-sunken hover:text-ink-primary
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal"
      >
        <Bell size={18} strokeWidth={1.75} />

        <AnimatePresence>
          {unreadCount > 0 && (
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

      <AnimatePresence>
        {open && <NotificationPanel onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}
