// src/components/admin/stock/MovementConfirmation.tsx
//
// Shown after a successful Record Movement or Transfer submission.
// Deliberately more substantial than a toast — per the design spec, this
// screen is the ONLY place the person will ever see this specific
// movement's details again, since no movement-history/list endpoint
// exists anywhere in this module's confirmed API. A toast alone would
// let something this unrepeatable slip by unnoticed.

import { useTranslation } from "react-i18next";
import { CheckCircle2 } from "lucide-react";
import type { MovementResponse } from "../../../services/api/stock.api";

export interface MovementConfirmationProps {
  movement: MovementResponse;
  onRecordAnother: () => void;
  onDone: () => void;
}

export function MovementConfirmation({
  movement,
  onRecordAnother,
  onDone,
}: MovementConfirmationProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col my-6 items-center gap-5 rounded-[16px] border border-[var(--hairline)] bg-[var(--panel)] p-8 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--success)]/10 text-[var(--success)]">
        <CheckCircle2 size={28} />
      </span>

      <div>
        <h2 className="text-lg font-semibold text-[var(--ink-primary)]">
          {t("stock.movement.success.title")}
        </h2>
        <p className="mt-1 text-sm text-[var(--ink-tertiary)]">
          {t("stock.movement.success.saveNotice")}
        </p>
      </div>

      <div className="w-full max-w-lg rounded-[10px] border border-[var(--hairline)] bg-[var(--sunken)] p-4 text-start">
        <dl className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--ink-tertiary)]">{t("stock.column.product")}</dt>
            <dd className="text-end font-medium text-[var(--ink-primary)]">
              {movement.productName}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--ink-tertiary)]">{t("stock.column.warehouse")}</dt>
            <dd className="text-end font-medium text-[var(--ink-primary)]">
              {movement.warehouseName}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--ink-tertiary)]">{t("stock.movement.fields.movementType")}</dt>
            <dd className="text-end font-medium text-[var(--ink-primary)]">
              {movement.movementType}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--ink-tertiary)]">{t("stock.column.quantityOnHand")}</dt>
            <dd className="text-end font-medium text-[var(--ink-primary)]">
              {movement?.quantity?.toLocaleString()}
            </dd>
          </div>
          {movement.reference && (
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--ink-tertiary)]">{t("stock.movement.fields.reference")}</dt>
              <dd className="text-end font-medium text-[var(--ink-primary)]">
                {movement.reference}
              </dd>
            </div>
          )}
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--ink-tertiary)]">{t("stock.movement.success.date")}</dt>
            <dd className="text-end font-medium text-[var(--ink-primary)]">
              {new Date(movement.movementDate).toLocaleString()}
            </dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-[var(--hairline)] pt-2">
            <dt className="text-[var(--ink-tertiary)]">{t("stock.movement.success.movementId")}</dt>
            <dd className="text-end font-mono text-xs text-[var(--ink-tertiary)]">{movement.id}</dd>
          </div>
        </dl>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onRecordAnother}
          className="rounded-[10px] border border-[var(--hairline)] px-4 py-2 text-sm font-medium text-[var(--ink-primary)] hover:bg-[var(--sunken)]"
        >
          {t("stock.movement.success.recordAnother")}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-[10px] bg-[var(--signal)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--signal-hover)]"
        >
          {t("stock.movement.success.done")}
        </button>
      </div>
    </div>
  );
}
