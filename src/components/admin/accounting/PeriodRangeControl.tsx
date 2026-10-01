// Project path: src/components/admin/accounting/PeriodRangeControl.tsx

import { useTranslation } from 'react-i18next';

interface PeriodRangeControlProps {
  periodStart: string;
  periodEnd: string;
  onChangeStart: (value: string) => void;
  onChangeEnd: (value: string) => void;
}

export function PeriodRangeControl({
  periodStart,
  periodEnd,
  onChangeStart,
  onChangeEnd,
}: PeriodRangeControlProps) {
  const { t } = useTranslation('accounting');

  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className="flex items-center gap-2 text-sm">
        <span className="text-[var(--ink-secondary)]">{t('reports.periodStart')}</span>
        <input
          type="date"
          value={periodStart}
          onChange={(e) => onChangeStart(e.target.value)}
          className="rounded-[6px] border border-[var(--hairline)] bg-[var(--panel)] px-3 py-1.5 text-sm text-[var(--ink-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--signal)]"
        />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <span className="text-[var(--ink-secondary)]">{t('reports.periodEnd')}</span>
        <input
          type="date"
          value={periodEnd}
          min={periodStart || undefined}
          onChange={(e) => onChangeEnd(e.target.value)}
          className="rounded-[6px] border border-[var(--hairline)] bg-[var(--panel)] px-3 py-1.5 text-sm text-[var(--ink-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--signal)]"
        />
      </label>
    </div>
  );
}
