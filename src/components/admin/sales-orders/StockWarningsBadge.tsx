// Project path: src/components/admin/sales-orders/StockWarningsBadge.tsx
//
// stockWarnings[] assumed to be plain strings — see spec §14. No severity
// field exists, so every warning renders in the same amber tone.

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle } from "lucide-react";
import type { StockWarning } from "../../../types/salesOrders.types";

interface StockWarningsBadgeProps {
  warnings: StockWarning[];
}

export function StockWarningsBadge({ warnings }: StockWarningsBadgeProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  if (warnings?.length === 0) {
    return <span className="text-sm text-[--ink-tertiary]">—</span>;
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="inline-flex items-center gap-1.5 rounded-md bg-[--warning]/10 px-2 py-1 text-xs font-medium text-[--warning]"
      >
        <AlertTriangle size={12} />
        {t("salesOrders.warnings.count", { count: warnings?.length })}
      </button>

      {open && (
        <div className="absolute end-0 z-10 mt-1 w-64 rounded-md border border-[--hairline] bg-[--panel] p-2 shadow-[var(--elevation-1)]">
          <ul className="flex flex-col gap-1.5">
            {warnings?.map((warning, index) => (
              <li key={index} className="flex items-start gap-1.5 text-xs text-[--ink-secondary]">
                <AlertTriangle size={12} className="mt-0.5 shrink-0 text-[--warning]" />
                {warning}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
