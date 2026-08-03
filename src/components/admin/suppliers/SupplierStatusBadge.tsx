// Project path: src/components/admin/suppliers/SupplierStatusBadge.tsx

import { useTranslation } from "react-i18next";

interface SupplierStatusBadgeProps {
  isActive: boolean;
}

export function SupplierStatusBadge({ isActive }: SupplierStatusBadgeProps) {
  const { t } = useTranslation();
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md bg-[--sunken] px-2 py-0.5 text-xs font-medium ${
        isActive ? "text-[--success]" : "text-[--ink-tertiary]"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isActive ? "bg-[--success]" : "bg-[--ink-tertiary]"
        }`}
      />
      {isActive ? t("common.status.active") : t("common.status.inactive")}
    </span>
  );
}
