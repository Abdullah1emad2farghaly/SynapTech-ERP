// src/components/admin/roles/RoleCard.tsx
//
// Mobile counterpart to RolesDataTable's rows. Custom markup (not
// EntityCard) for the same reason as UserCard — the leading ShieldCheck
// icon badge next to the name has no slot in EntityCard's plain-string
// title. No status badge: RoleResponse has no backing field for it,
// matching the table's own comment on why Status/Last Updated are cut.

import { useTranslation } from "react-i18next";
import { ShieldCheck } from "lucide-react";
import { PermissionPreviewChips } from "./PermissionPreviewChips";
import type { RoleResponse } from "../../../types/roles.types";

export interface RoleCardProps {
    role: RoleResponse;
    onClick: (role: RoleResponse) => void;
    renderActions: () => React.ReactNode;
}

export function RoleCard({ role, onClick, renderActions }: RoleCardProps) {
    const { t } = useTranslation();

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={() => onClick(role)}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onClick(role);
                }
            }}
            className="flex cursor-pointer flex-col gap-3 rounded-[16px] border border-[var(--hairline)] bg-[var(--panel)] p-4 transition-colors duration-150 hover:bg-[var(--sunken)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--synapse)]"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[--signal]/10 text-[--signal]">
                        <ShieldCheck size={16} />
                    </span>
                    <p className="truncate font-medium text-[var(--ink-primary)]">{role.name}</p>
                </div>
                <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                    {renderActions()}
                </div>
            </div>

            <p className="line-clamp-2 text-sm text-[--ink-secondary]">{role.description}</p>

            <div className="flex flex-col gap-1">
                <span className="text-xs text-[--ink-tertiary]">
                    {t("roles.table.permissionsCount", { count: role.permissions.length })}
                </span>
                <PermissionPreviewChips permissionCodes={role.permissions} />
            </div>
        </div>
    );
}