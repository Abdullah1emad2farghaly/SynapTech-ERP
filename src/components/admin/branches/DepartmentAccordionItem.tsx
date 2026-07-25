// src/components/admin/organization/branches/DepartmentAccordionItem.tsx
//
// One department's accordion row. Users only fetch when this item is
// expanded (useDepartmentUsers' `enabled` param), and collapsing doesn't
// discard the query — TanStack Query caches it, so re-expanding the same
// department is instant without a second request. Smooth height/opacity
// animation via Framer Motion, respecting prefers-reduced-motion via the
// same pattern established in Drawer.tsx.

import { useTranslation } from "react-i18next";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown, Users as UsersIcon } from "lucide-react";
// import { useDepartmentUsers } from "../../../hooks/useDepartmentUsers";
import { DepartmentUsersTable } from "./DepartmentUsersTable";
import { DepartmentUsersSkeleton } from "./DepartmentUsersSkeleton";
import { User } from "@/types/users.types";
import { QueryObserverResult, RefetchOptions } from "@tanstack/react-query";

export interface DepartmentAccordionItemProps {
  departmentId: string;
  departmentName: string;
  isExpanded: boolean;
  users: User[];
  isError: boolean;
  isLoading: boolean;
  refetch: (options?: RefetchOptions | undefined) => Promise<QueryObserverResult<NoInfer<User[]>, Error>>
  onToggle: () => void;
  onSetUserActive: (userId: string, active: boolean) => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
}

export function DepartmentAccordionItem({
  departmentId,
  departmentName,
  isExpanded,
  users,
  isError,
  isLoading,
  refetch,
  onToggle,
  onSetUserActive,
  onDeleteUser,
}: DepartmentAccordionItemProps) {
  const { t } = useTranslation();
  const prefersReducedMotion = useReducedMotion();

  
  users = users.filter((user)=> user.departmentId === departmentId)

  return (
    <div className="border-b border-[var(--hairline)] last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-start transition-colors duration-150 hover:bg-[var(--sunken)]"
      >
        <span className="flex items-center gap-2 font-medium text-[var(--ink-primary)]">
          <UsersIcon size={15} className="text-[var(--ink-tertiary)]" />
          {departmentName}
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-[var(--ink-secondary)] transition-transform duration-150 ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              {isError ? (
                <div className="flex flex-col items-center gap-2 py-6 text-center">
                  <p className="text-sm font-medium text-[var(--error)]">
                    {t("common.errors.loadFailed")}
                  </p>
                  <button
                    type="button"
                    onClick={() => refetch()}
                    className="text-sm text-[var(--signal)] hover:text-[var(--signal-hover)]"
                  >
                    {t("common.actions.retry")}
                  </button>
                </div>
              ) : isLoading ? (
                <DepartmentUsersSkeleton />
              ) : users.length === 0 ? (
                <p className="py-4 text-center text-sm text-[var(--ink-tertiary)]">
                  {t("branches.details.noUsersInDepartment")}
                </p>
              ) : (
                <DepartmentUsersTable
                  users={users}
                  onSetActive={onSetUserActive}
                  onDelete={onDeleteUser}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
