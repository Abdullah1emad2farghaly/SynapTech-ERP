// Project path: src/components/common/PageHeader.tsx
//
// Minimal page header: title + optional description on the start side,
// an optional actions slot on the end side (buttons, filters, date
// pickers, etc.). Used by the financial report pages and Accounting
// Settings page — reuse this anywhere else a simple page header is needed.

import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-lg font-semibold text-[var(--ink-primary)]">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-[var(--ink-secondary)]">{description}</p>
        )}
      </div>

      {actions && <div className="flex shrink-0 items-center gap-3">{actions}</div>}
    </div>
  );
}
