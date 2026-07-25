// Project path: src/components/admin/roles/PermissionPreviewChips.tsx

import { useTranslation } from "react-i18next";

interface PermissionPreviewChipsProps {
  permissionCodes: string[];
  maxVisible?: number;
}

export function PermissionPreviewChips({
  permissionCodes,
  maxVisible = 2,
}: PermissionPreviewChipsProps) {
  const { t } = useTranslation();
  const visible = permissionCodes.slice(0, maxVisible);
  const remaining = permissionCodes.length - visible.length;

  if (permissionCodes.length === 0) {
    return (
      <span className="text-sm text-[--ink-tertiary]">
        {t("roles.table.noPermissions")}
      </span>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {visible.map((code) => (
        <span
          key={code}
          className="rounded-md bg-[--sunken] px-2 py-0.5 font-mono text-xs text-[--ink-secondary]"
        >
          {code}
        </span>
      ))}
      {remaining > 0 && (
        <span className="rounded-md bg-[--signal]/10 px-2 py-0.5 text-xs font-medium text-[--signal]">
          +{remaining} {t("roles.table.more")}
        </span>
      )}
    </div>
  );
}
