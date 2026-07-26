// Project path: src/components/admin/journal-entries/JournalEntriesStats.tsx
//
// All figures derived from the confirmed JournalEntryResponse[] list (status,
// entryDate, lines[].debit/credit). No trend/delta indicators — no historical
// snapshot data exists to compute a trend against, so it's cut rather than faked.

import { useTranslation } from "react-i18next";
import {
  FileText,
  FileEdit,
  CheckCircle2,
  RotateCcw,
  CalendarDays,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import type { JournalEntryResponse } from "../../../types/journalEntries.types";

interface JournalEntriesStatsProps {
  entries: JournalEntryResponse[];
  isLoading?: boolean;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-[--hairline] bg-[--panel] p-4 shadow-[var(--elevation-1)] transition-transform duration-150 ease-out hover:-translate-y-0.5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[--signal]/10 text-[--signal]">
        {icon}
      </div>
      <div>
        <p className="text-xl font-semibold text-[--ink-primary]">{value}</p>
        <p className="text-xs text-[--ink-secondary]">{label}</p>
      </div>
    </div>
  );
}

function isSameMonth(dateIso: string, ref: Date) {
  const d = new Date(dateIso);
  return d.getMonth() === ref.getMonth() && d.getFullYear() === ref.getFullYear();
}

function isSameDay(dateIso: string, ref: Date) {
  const d = new Date(dateIso);
  return d.toDateString() === ref.toDateString();
}

export function JournalEntriesStats({
  entries,
  isLoading,
}: JournalEntriesStatsProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-[68px] animate-pulse rounded-lg bg-[--sunken]" />
        ))}
      </div>
    );
  }

  const now = new Date();
  const draft = entries.filter((e) => e.status === "Draft").length;
  const posted = entries.filter((e) => e.status === "Posted").length;
  const reversed = entries.filter((e) => e.status === "Reversed").length;
  const today = entries.filter((e) => isSameDay(e.entryDate, now)).length;
  const thisMonth = entries.filter((e) => isSameMonth(e.entryDate, now)).length;
  const totalDebit = entries.reduce(
    (sum, e) => sum + e.lines.reduce((s, l) => s + l.debit, 0),
    0
  );
  const totalCredit = entries.reduce(
    (sum, e) => sum + e.lines.reduce((s, l) => s + l.credit, 0),
    0
  );

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatCard
        icon={<FileText size={18} />}
        label={t("journalEntries.stats.total")}
        value={String(entries.length)}
      />
      <StatCard
        icon={<FileEdit size={18} />}
        label={t("journalEntries.stats.draft")}
        value={String(draft)}
      />
      <StatCard
        icon={<CheckCircle2 size={18} />}
        label={t("journalEntries.stats.posted")}
        value={String(posted)}
      />
      <StatCard
        icon={<RotateCcw size={18} />}
        label={t("journalEntries.stats.reversed")}
        value={String(reversed)}
      />
      <StatCard
        icon={<CalendarDays size={18} />}
        label={t("journalEntries.stats.today")}
        value={String(today)}
      />
      <StatCard
        icon={<CalendarDays size={18} />}
        label={t("journalEntries.stats.thisMonth")}
        value={String(thisMonth)}
      />
      <StatCard
        icon={<TrendingUp size={18} />}
        label={t("journalEntries.stats.totalDebit")}
        value={totalDebit.toFixed(2)}
      />
      <StatCard
        icon={<TrendingDown size={18} />}
        label={t("journalEntries.stats.totalCredit")}
        value={totalCredit.toFixed(2)}
      />
    </div>
  );
}
