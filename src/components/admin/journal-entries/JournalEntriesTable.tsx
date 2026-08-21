// Project path: src/components/admin/journal-entries/JournalEntriesTable.tsx
//
// Columns match the confirmed fields: Entry Number, Date, Description, Status,
// Line count, Total Debit/Credit/Difference (derived from lines[]). "Created
// By" is omitted — the brief itself marks it future-ready/no field exists.

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import {
  FileText,
  MoreVertical,
  Eye,
  Send,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { DataTable, type DataTableColumn } from "../../common/DataTable";
import { JournalEntryStatusBadge } from "./JournalEntryStatusBadge";
import type { JournalEntryResponse } from "../../../types/journalEntries.types";
import { hasAnyPermission } from "@/utils/permissions";
import { getUserPermissions } from "@/pages/common/LoginPage";

interface JournalEntriesTableProps {
  entries: JournalEntryResponse[];
  isLoading: boolean;
  onView: (entry: JournalEntryResponse) => void;
  onPost: (entry: JournalEntryResponse) => void;
  onReverse: (entry: JournalEntryResponse) => void;
  onDelete: (entry: JournalEntryResponse) => void;
}

function lineTotals(entry: JournalEntryResponse) {
  const debit = entry.lines.reduce((s, l) => s + l.debit, 0);
  const credit = entry.lines.reduce((s, l) => s + l.credit, 0);

  return {
    debit,
    credit,
    difference: debit - credit,
  };
}

interface RowActionsProps {
  entry: JournalEntryResponse;
  onView: JournalEntriesTableProps["onView"];
  onPost: JournalEntriesTableProps["onPost"];
  onReverse: JournalEntriesTableProps["onReverse"];
  onDelete: JournalEntriesTableProps["onDelete"];
}

function RowActions({
  entry,
  onView,
  onPost,
  onReverse,
  onDelete,
}: RowActionsProps) {
  const { t } = useTranslation();

  const [open, setOpen] = useState(false);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const [menuPosition, setMenuPosition] = useState({
    top: 0,
    left: 0,
  });

  const canPost = entry.status === "Draft";
  const canReverse = entry.status === "Posted";
  const canDelete = entry.status === "Draft";
  const canPostAccess = hasAnyPermission(["accounting.journal.post"], getUserPermissions());
  const canCreateAccess = hasAnyPermission(["accounting.journal.create"], getUserPermissions());
  const canReverseAccess = hasAnyPermission(["accounting.journal.reverse"], getUserPermissions());

  const closeMenu = () => {
    setOpen(false);

    requestAnimationFrame(() => {
      buttonRef.current?.focus();
    });
  };

  const updateMenuPosition = () => {
    if (!buttonRef.current || !menuRef.current) return;

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const menuRect = menuRef.current.getBoundingClientRect();

    const spacing = 4;
    const viewportPadding = 8;

    let top = buttonRect.bottom + spacing;
    let left = buttonRect.right - menuRect.width;

    // Open above the button if there isn't enough space below.
    if (
      top + menuRect.height >
      window.innerHeight - viewportPadding
    ) {
      top = buttonRect.top - menuRect.height - spacing;
    }

    // Keep the menu inside the viewport horizontally.
    if (
      left + menuRect.width >
      window.innerWidth - viewportPadding
    ) {
      left =
        window.innerWidth -
        menuRect.width -
        viewportPadding;
    }

    if (left < viewportPadding) {
      left = viewportPadding;
    }

    // Keep the menu inside the viewport vertically.
    if (top < viewportPadding) {
      top = viewportPadding;
    }

    setMenuPosition({
      top,
      left,
    });
  };

  // Close when clicking anywhere outside the button/menu.
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      const clickedButton =
        buttonRef.current?.contains(target);

      const clickedMenu =
        menuRef.current?.contains(target);

      if (!clickedButton && !clickedMenu) {
        setOpen(false);
      }
    };

    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    requestAnimationFrame(() => {
      updateMenuPosition();
    });

    const handleScroll = () => {
      updateMenuPosition();
    };

    const handleResize = () => {
      updateMenuPosition();
    };

    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
      document.removeEventListener("keydown", handleEscape);

      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [open]);

  const handleMenuKeyDown = (
    event: ReactKeyboardEvent<HTMLDivElement>
  ) => {
    const items = Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>(
        '[role="menuitem"]'
      ) ?? []
    );

    const current = document.activeElement as HTMLElement;
    const index = items.indexOf(current);

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        items[(index + 1) % items.length]?.focus();
        break;

      case "ArrowUp":
        event.preventDefault();
        items[
          (index - 1 + items.length) % items.length
        ]?.focus();
        break;

      case "Home":
        event.preventDefault();
        items[0]?.focus();
        break;

      case "End":
        event.preventDefault();
        items[items.length - 1]?.focus();
        break;

      case "Escape":
        event.preventDefault();
        closeMenu();
        break;
    }
  };

  return (
    <>
      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label={t("journalEntries.actions.moreActions")}
          onClick={() => setOpen((o) => !o)}
          className="inline-flex items-center justify-center rounded-md p-1.5 text-[--ink-secondary] hover:bg-[--sunken] focus:outline-none focus:ring-2 focus:ring-[--signal]/40"
        >
          <MoreVertical size={16} />
        </button>
      </div>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            tabIndex={-1}
            onKeyDown={handleMenuKeyDown}
            className="fixed z-[9999] w-44 overflow-hidden rounded-md border border-[--hairline] bg-[--panel] py-1 shadow-[var(--elevation-1)]"
            style={{
              top: menuPosition.top,
              left: menuPosition.left,
              visibility:
                menuPosition.top === 0
                  ? "hidden"
                  : "visible",
            }}
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                closeMenu();
                onView(entry);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[--ink-primary] hover:bg-[--sunken] focus:bg-[--sunken] focus:outline-none"
            >
              <Eye size={15} />
              {t("journalEntries.actions.viewDetails")}
            </button>

            {(canPost && canPostAccess) && (
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  closeMenu();
                  onPost(entry);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[--ink-primary] hover:bg-[--sunken] focus:bg-[--sunken] focus:outline-none"
              >
                <Send size={15} />
                {t("journalEntries.actions.post")}
              </button>
            )}

            {(canReverse && canReverseAccess) && (
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  closeMenu();
                  onReverse(entry);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[--ink-primary] hover:bg-[--sunken] focus:bg-[--sunken] focus:outline-none"
              >
                <RotateCcw size={15} />
                {t("journalEntries.actions.reverse")}
              </button>
            )}

            {(canDelete && canCreateAccess) && (
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  closeMenu();
                  onDelete(entry);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[--error] hover:bg-[--sunken] focus:bg-[--sunken] focus:outline-none"
              >
                <Trash2 size={15} />
                {t("journalEntries.actions.delete")}
              </button>
            )}
          </div>,
          document.body
        )}
    </>
  );
}

export function JournalEntriesTable({
  entries,
  isLoading,
  onView,
  onPost,
  onReverse,
  onDelete,
}: JournalEntriesTableProps) {
  const { t } = useTranslation();

  const columns: DataTableColumn<JournalEntryResponse>[] = [
    {
      id: "entryNumber",
      header: t("journalEntries.table.entryNumber"),
      cell: (entry) => (
        <button
          type="button"
          onClick={() => onView(entry)}
          className="font-mono text-sm font-medium text-[--ink-primary] hover:text-[--signal]"
        >
          {entry.entryNumber}
        </button>
      ),
    },
    {
      id: "entryDate",
      header: t("journalEntries.table.date"),
      cell: (entry) => (
        <span className="text-sm text-[--ink-secondary]">
          {new Date(entry.entryDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: "description",
      header: t("journalEntries.table.description"),
      cell: (entry) => (
        <span className="line-clamp-1 text-sm text-[--ink-secondary]">
          {entry.description || "—"}
        </span>
      ),
    },
    {
      id: "status",
      header: t("journalEntries.table.status"),
      cell: (entry) => (
        <JournalEntryStatusBadge status={entry.status} />
      ),
    },
    {
      id: "lines",
      header: t("journalEntries.table.lines"),
      cell: (entry) => (
        <span className="text-sm text-[--ink-secondary]">
          {entry.lines.length}
        </span>
      ),
    },
    {
      id: "totals",
      header: t("journalEntries.table.debitCreditDiff"),
      cell: (entry) => {
        const { debit, credit, difference } = lineTotals(entry);
        const balanced = Math.abs(difference) < 0.005;

        return (
          <div className="flex flex-col text-xs">
            <span className="text-[--success]">
              {t("journalEntries.table.debitShort")}{" "}
              {debit.toFixed(2)}
            </span>

            <span className="text-[--error]">
              {t("journalEntries.table.creditShort")}{" "}
              {credit.toFixed(2)}
            </span>

            <span
              className={
                balanced
                  ? "text-[--warning]"
                  : "text-[--error]"
              }
            >
              {t("journalEntries.table.diffShort")}{" "}
              {difference.toFixed(2)}
            </span>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: (entry) => (
        <RowActions
          entry={entry}
          onView={onView}
          onPost={onPost}
          onReverse={onReverse}
          onDelete={onDelete}
        />
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={entries}
      getRowId={(entry) => entry.id}
      isLoading={isLoading}
      skeletonRowCount={6}
      className="min-w-300"
      emptyState={
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <FileText
            size={32}
            className="text-[--ink-tertiary]"
          />

          <p className="font-medium text-[--ink-primary]">
            {t("journalEntries.empty.title")}
          </p>

          <p className="max-w-sm text-sm text-[--ink-secondary]">
            {t("journalEntries.empty.description")}
          </p>
        </div>
      }
    />
  );
}