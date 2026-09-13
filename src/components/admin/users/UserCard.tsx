// src/components/admin/users/UserCard.tsx
//
// Mobile counterpart to UsersDataTable's rows. Doesn't reuse EntityCard
// directly — its title is a plain string and can't host an Avatar + two
// stacked lines (name/email), so this mirrors EntityCard's container/
// selection/field/actions markup by hand instead. Branch/Department/
// Roles/Status match the table's fields and fallbacks exactly (roles
// capped at MAX_INLINE_ROLES with an overflow chip, "__" fallback for
// empty branch/department).

import { useTranslation } from "react-i18next";
import { Avatar } from "../../common/Avatar";
import { StatusBadge } from "../../common/StatusBadge";
import { RoleBadge, RoleOverflowChip } from "./RoleBadge";
import type { UserRow } from "./UsersDataTable";

const MAX_INLINE_ROLES = 2;

export interface UserCardProps {
    row: UserRow;
    onClick: (id: string) => void;
    renderActions: () => React.ReactNode;
    selected?: boolean;
    onSelectChange?: (id: string, selected: boolean) => void;
}

export function UserCard({ row, onClick, renderActions, selected, onSelectChange }: UserCardProps) {
    const { t } = useTranslation();
    const shownRoles = row.roles.slice(0, MAX_INLINE_ROLES);
    const overflow = row.roles.length - shownRoles.length;

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={() => onClick(row.id)}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onClick(row.id);
                }
            }}
            className={`flex cursor-pointer flex-col gap-3 rounded-[16px] border p-4 transition-colors duration-150 hover:bg-[var(--sunken)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--synapse)] ${selected ? "border-[var(--synapse)] bg-[var(--sunken)]" : "border-[var(--hairline)] bg-[var(--panel)]"
                }`}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-2.5">
                    <input
                        type="checkbox"
                        checked={selected ?? false}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => onSelectChange?.(row.id, e.target.checked)}
                        className="mt-0.5 h-4 w-4 shrink-0 rounded border-[var(--hairline)] accent-[var(--synapse)]"
                    />
                    <Avatar name={row.fullName} size="sm" />
                    <div className="min-w-0">
                        <p className="truncate font-medium text-[var(--ink-primary)]">{row.fullName}</p>
                        <p className="truncate text-xs text-[var(--ink-tertiary)]">{row.email}</p>
                        <div className="mt-1">
                            <StatusBadge
                                status={row.isActive ? "active" : "inactive"}
                                label={row.isActive ? t("users.status.active") : t("users.status.inactive")}
                            />
                        </div>
                    </div>
                </div>
                <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                    {renderActions()}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-1.5 text-sm">
                <div className="flex justify-between gap-2">
                    <span className="text-[var(--ink-tertiary)]">{t("users.list.column.branch")}</span>
                    <span className="truncate text-[var(--ink-primary)]">{row.branchName || "__"}</span>
                </div>
                <div className="flex justify-between gap-2">
                    <span className="text-[var(--ink-tertiary)]">{t("users.list.column.department")}</span>
                    <span className="truncate text-[var(--ink-primary)]">{row.departmentName || "__"}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                    <span className="text-[var(--ink-tertiary)]">{t("users.list.column.roles")}</span>
                    <div className="flex flex-wrap items-center justify-end gap-1">
                        {shownRoles.length > 0 ? (
                            shownRoles.map((role) => <RoleBadge key={role} label={role} />)
                        ) : (
                            <span className="text-[var(--ink-primary)]">__</span>
                        )}
                        {overflow > 0 && <RoleOverflowChip count={overflow} />}
                    </div>
                </div>
            </div>
        </div>
    );
}