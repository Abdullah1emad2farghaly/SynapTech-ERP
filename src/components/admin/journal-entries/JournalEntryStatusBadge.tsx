// Project path: src/components/admin/journal-entries/JournalEntryStatusBadge.tsx
//
// Dot + text label, never color-only — same convention as StatusBadge/RoleBadge.

import { useTranslation } from "react-i18next";
import { FileEdit, CheckCircle2, RotateCcw } from "lucide-react";
import type { JournalEntryStatus } from "../../../types/journalEntries.types";

const STATUS_CONFIG: Record<
  string,
  { icon: typeof FileEdit; dotClass: string; textClass: string }
> = {
  Draft: {
    icon: FileEdit,
    dotClass: "bg-[--ink-tertiary]",
    textClass: "text-[--ink-secondary]",
  },
  Posted: {
    icon: CheckCircle2,
    dotClass: "bg-[--success]",
    textClass: "text-[--success]",
  },
  Reversed: {
    icon: RotateCcw,
    dotClass: "bg-[--warning]",
    textClass: "text-[--warning]",
  },
};

interface JournalEntryStatusBadgeProps {
  status: JournalEntryStatus | string;
}

export function JournalEntryStatusBadge({
  status,
}: JournalEntryStatusBadgeProps) {
  const { t } = useTranslation();
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.Draft;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md bg-[--sunken] px-2 py-1 text-xs font-medium ${config.textClass}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dotClass}`} />
      <Icon size={12} />
      {t(`journalEntries.status.${status}`, status)}
    </span>
  );
}
