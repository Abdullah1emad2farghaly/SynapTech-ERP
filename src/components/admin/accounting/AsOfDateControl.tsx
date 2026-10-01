// Project path: src/components/admin/accounting/AsOfDateControl.tsx

import { useTranslation } from 'react-i18next';

interface AsOfDateControlProps {
  value: string;
  onChange: (value: string) => void;
}

export function AsOfDateControl({ value, onChange }: AsOfDateControlProps) {
  const { t } = useTranslation();

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-[var(--ink-secondary)]">{t('reports.asOfDate')}</span>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-[6px] border border-[var(--hairline)] bg-[var(--panel)] px-3 py-1.5 text-sm text-[var(--ink-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--signal)]"
      />
    </label>
  );
}
