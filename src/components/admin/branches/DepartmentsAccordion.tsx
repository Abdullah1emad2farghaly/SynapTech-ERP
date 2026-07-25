// src/components/admin/organization/branches/DepartmentsAccordion.tsx
//
// Owns the "only one expanded at a time" state and renders one
// DepartmentAccordionItem per department. Presentation + local UI state
// only — no fetching here, that's each item's own concern via
// useDepartmentUsers.

import { useState } from "react";
import { DepartmentAccordionItem } from "./DepartmentAccordionItem";
import { useDepartmentUsers } from "@/hooks/useDepartmentUsers";

export interface AccordionDepartment {
  id: string;
  name: string;
}

export interface DepartmentsAccordionProps {
  departments: AccordionDepartment[];
  onSetUserActive: (userId: string, active: boolean) => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
}

export function DepartmentsAccordion({
  departments,
  onSetUserActive,
  onDeleteUser,
}: DepartmentsAccordionProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { data, isLoading, isError, refetch } = useDepartmentUsers();
  const users = data ?? [];

  return (
    <div className="rounded-[16px] border border-[var(--hairline)] bg-[var(--panel)]">
      {departments.map((department) => (
        <DepartmentAccordionItem
          users={users}
          key={department.id}
          refetch={refetch}
          isLoading={isLoading}
          isError={isError}
          departmentId={department.id}
          departmentName={department.name}
          isExpanded={expandedId === department.id}
          onToggle={() =>
            setExpandedId((current) => (current === department.id ? null : department.id))
          }
          onSetUserActive={onSetUserActive}
          onDeleteUser={onDeleteUser}
        />
      ))}
    </div>
  );
}
