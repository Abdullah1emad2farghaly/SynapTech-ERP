// src/components/admin/organization/branches/BranchInformationCard.tsx
//
// Secondary card below BranchHeader: Address and Phone. Kept separate
// from BranchHeader (rather than folded into it) per the requested
// component split — Header owns identity/status/actions, this card owns
// contact details, mirroring the Overview/Contact section split that
// already existed in the (now-removed) BranchDetailsDrawer.

import { useTranslation } from "react-i18next";
import { MapPin, Phone } from "lucide-react";

export interface BranchInformationCardProps {
  address: string;
  phone: string;
}

export function BranchInformationCard({ address, phone }: BranchInformationCardProps) {
  const { t } = useTranslation();

  return (
    <div className="rounded-[16px] border border-[var(--hairline)] bg-[var(--panel)] p-5">
      <h2 className="mb-4 text-xs font-medium uppercase tracking-wide text-[var(--ink-tertiary)]">
        {t("branches.details.sections.contact")}
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[var(--sunken)] text-[var(--ink-secondary)]">
            <MapPin size={16} />
          </span>
          <div>
            <p className="text-xs text-[var(--ink-tertiary)]">{t("branches.column.address")}</p>
            <p className="text-sm text-[var(--ink-primary)]">{address || "—"}</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[var(--sunken)] text-[var(--ink-secondary)]">
            <Phone size={16} />
          </span>
          <div>
            <p className="text-xs text-[var(--ink-tertiary)]">{t("branches.column.phone")}</p>
            <p dir="ltr" className="text-start text-sm text-[var(--ink-primary)]">
              {phone || "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
