// Project path: src/components/admin/purchase-orders/WarningsPanel.tsx
//
// Dismiss is per-session only (component state) — no field exists to persist
// dismissal against.

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle, X } from "lucide-react";
import type { PurchaseOrderWarning } from "../../../types/purchaseOrders.types";

interface WarningsPanelProps {
  warnings: PurchaseOrderWarning[];
}

export function WarningsPanel({ warnings }: WarningsPanelProps) {
  const { t } = useTranslation();
  const [dismissed, setDismissed] = useState(false);

  if (warnings.length === 0 || dismissed) return null;

  return (
    <div className="rounded-lg border border-[--warning]/30 bg-[--warning]/5 p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-[--warning]">
          <AlertTriangle size={16} />
          {t("purchaseOrders.warnings.panelTitle", { count: warnings.length })}
        </h3>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label={t("common.actions.dismiss")}
          className="rounded-md p-1 text-[--ink-tertiary] hover:bg-[--sunken]"
        >
          <X size={14} />
        </button>
      </div>
      <ul className="flex flex-col gap-1.5">
        {warnings.map((warning, index) => (
          <li key={index} className="flex items-start gap-2 text-sm text-[--ink-secondary]">
            <AlertTriangle size={14} className="mt-0.5 shrink-0 text-[--warning]" />
            {warning}
          </li>
        ))}
      </ul>
    </div>
  );
}
