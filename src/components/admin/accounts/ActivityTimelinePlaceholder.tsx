// src/components/admin/accounts/ActivityTimelinePlaceholder.tsx
//
// Explicit placeholder, exactly matching what the brief itself says:
// "prepared for future APIs." No fake sample entries are rendered here —
// inventing placeholder activity data would misrepresent the product the
// same way a fake Manager field would have on Departments. This card
// exists so the section has a home in the layout when a real Activity
// API is added later, without needing to restructure the page.

import { useTranslation } from "react-i18next";
import { History } from "lucide-react";

export function ActivityTimelinePlaceholder() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center gap-2 rounded-[16px] border border-dashed border-[var(--hairline)] bg-[var(--sunken)] py-10 text-center">
      <History size={22} className="text-[var(--ink-tertiary)]" />
      <p className="text-sm font-medium text-[var(--ink-primary)]">
        {t("accounts.details.activityPlaceholderTitle")}
      </p>
      <p className="max-w-xs text-xs text-[var(--ink-tertiary)]">
        {t("accounts.details.activityPlaceholderBody")}
      </p>
    </div>
  );
}
