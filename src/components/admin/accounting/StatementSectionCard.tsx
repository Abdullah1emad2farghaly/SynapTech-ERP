// Project path: src/components/admin/accounting/StatementSectionCard.tsx
//
// One card per statement category (Assets, Liabilities, Equity, Revenue,
// Expenses). Shared by Balance Sheet and Income Statement pages — the only
// thing that differs per use is the title, the lines, and the total.

import type { ReactNode } from 'react';
import { formatCurrency } from '../../../utils/formatters';

interface StatementSectionCardProps {
  title: string;
  totalLabel: string;
  total: number;
  children: ReactNode;
  accent?: 'neutral' | 'positive' | 'negative';
}

const accentClass: Record<NonNullable<StatementSectionCardProps['accent']>, string> = {
  neutral: 'text-[var(--ink-primary)]',
  positive: 'text-[var(--success)]',
  negative: 'text-[var(--error)]',
};

export function StatementSectionCard({
  title,
  totalLabel,
  total,
  children,
  accent = 'neutral',
}: StatementSectionCardProps) {
  return (
    <section className="rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] overflow-hidden">
      <header className="flex items-center justify-between px-4 py-3 border-b border-[var(--hairline)]">
        <h3 className="text-sm font-medium text-[var(--ink-primary)]">{title}</h3>
      </header>

      <div>{children}</div>

      <footer className="flex items-center justify-between px-4 py-3 border-t border-[var(--hairline)] bg-[var(--sunken)]">
        <span className="text-sm font-medium text-[var(--ink-secondary)]">{totalLabel}</span>
        <span className={`text-sm font-semibold tabular-nums ${accentClass[accent]}`}>
          {formatCurrency(total)}
        </span>
      </footer>
    </section>
  );
}
