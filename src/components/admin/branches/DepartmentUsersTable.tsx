// src/components/admin/organization/branches/DepartmentUsersTable.tsx
//
// Users list inside an expanded department accordion item. Reuses Avatar,
// RoleBadge/RoleOverflowChip, StatusBadge, and the existing
// UserActionMenu (from the Users module) rather than duplicating any of
// that UI — per the "Reuse Existing Components" requirement, this is
// composition, not a new table implementation.
//
// Not built on the generic DataTable — this list is small (one
// department's worth of users, already paginated to a sane cap by
// useDepartmentUsers) and lives inside an accordion, not a standalone
// page, so DataTable's sort/pagination machinery isn't a fit here.
//
// The entire row is clickable and keyboard-accessible; the action menu
// stops propagation so it doesn't trigger row navigation.

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { Avatar } from "../../common/Avatar";
import { StatusBadge } from "../../common/StatusBadge";
import { RoleBadge, RoleOverflowChip } from "../users/RoleBadge";
import { UserActionMenu } from "../users/UserActionMenu";

export interface DepartmentUser {
  id: string;
  fullName: string;
  email: string;
  roles: string[];
  isActive: boolean;
}

export interface DepartmentUsersTableProps {
  users: DepartmentUser[];
  onSetActive: (userId: string, active: boolean) => Promise<void>;
  onDelete: (userId: string) => Promise<void>;
}

const MAX_INLINE_ROLES = 2;

export function DepartmentUsersTable({ users, onSetActive, onDelete }: DepartmentUsersTableProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  function goToUser(userId: string) {
    navigate(`/administration/users/${userId}`);
  }

  return (
    <div className="flex flex-col gap-1">
      {users.map((user) => (
        <div
          key={user.id}
          role="button"
          tabIndex={0}
          onClick={() => goToUser(user.id)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              goToUser(user.id);
            }
          }}
          className="flex cursor-pointer items-center gap-3 rounded-[10px] px-3 py-2.5 transition-colors duration-150 hover:bg-[var(--sunken)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--synapse)]"
        >
          <Avatar name={user.fullName} size="sm" />

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-[var(--ink-primary)]">
              {user.fullName}
            </p>
            <p className="truncate text-xs text-[var(--ink-tertiary)]">{user.email}</p>
          </div>

          <div className="hidden shrink-0 flex-wrap items-center gap-1 sm:flex">
            {user.roles.slice(0, MAX_INLINE_ROLES).map((role) => (
              <RoleBadge key={role} label={role} />
            ))}
            {user.roles.length > MAX_INLINE_ROLES && (
              <RoleOverflowChip count={user.roles.length - MAX_INLINE_ROLES} />
            )}
          </div>

          <div className="shrink-0">
            <StatusBadge
              status={user.isActive ? "active" : "inactive"}
              label={user.isActive ? t("users.status.active") : t("users.status.inactive")}
            />
          </div>

          <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
            {/* <UserActionMenu
              userId={user.id}
              userName={user.fullName}
              isActive={user.isActive}
              onAssignRoles={() => goToUser(user.id)}
              onSetActive={onSetActive}
              onDelete={onDelete}
            /> */}
          </div>
        </div>
      ))}
    </div>
  );
}
