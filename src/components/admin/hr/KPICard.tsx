import { ArrowDown, ArrowRight, ArrowUp } from "lucide-react";
import { Card } from "@/components/common/Card";
import type { KpiDatum } from "@/types/hr.types";

const DELTA_STYLES: Record<NonNullable<KpiDatum["deltaDirection"]>, { icon: typeof ArrowUp; className: string }> = {
  up: { icon: ArrowUp, className: "text-success" },
  down: { icon: ArrowDown, className: "text-error" },
  flat: { icon: ArrowRight, className: "text-ink-tertiary" },
};

export function KPICard({ label, value, deltaLabel, deltaDirection }: KpiDatum) {
  const delta = deltaDirection ? DELTA_STYLES[deltaDirection] : null;
  const DeltaIcon = delta?.icon;

  return (
    <Card className="p-5">
      <p className="text-[0.8125rem] text-ink-secondary">{label}</p>
      <p className="mt-2 font-display text-2xl font-semibold text-ink-primary">{value}</p>
      {deltaLabel && delta ? (
        <p className={`mt-1.5 flex items-center gap-1 text-[0.8125rem] ${delta.className}`}>
          {DeltaIcon ? <DeltaIcon className="h-3.5 w-3.5" aria-hidden="true" /> : null}
          {deltaLabel}
        </p>
      ) : null}
    </Card>
  );
}
