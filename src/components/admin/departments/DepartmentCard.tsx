// src/components/admin/departments/DepartmentCard.tsx
//
// Mobile counterpart to DepartmentsFlatTable's rows — Name + Status badge
// as header, Branch/Parent Department as the body. Mirrors the table's
// italic "None" fallback for parentDepartmentName exactly.

import { useTranslation } from "react-i18next";
import { EntityCard, type EntityCardField } from "../../common/EntityCard";
import { StatusBadge } from "../../common/StatusBadge";
import type { DepartmentFlatRow } from "./DepartmentsFlatTable"; // ASSUMPTION: confirm real export path

export interface DepartmentCardProps {
    row: DepartmentFlatRow;
    onClick: (id: string) => void;
    renderActions: () => React.ReactNode;
}

export function DepartmentCard({ row, onClick, renderActions }: DepartmentCardProps) {
    const { t } = useTranslation();

    const fields: EntityCardField[] = [
        {
            key: "branch",
            label: t("departments.column.branch"),
            value: row.branchName,
        },
        {
            key: "parentDepartment",
            label: t("departments.column.parentDepartment"),
            value: row.parentDepartmentName ?? (
                <span className="italic text-[var(--ink-tertiary)]">
                    {t("departments.create.fields.parentDepartmentNone")}
                </span>
            ),
        },
    ];

    return (
        <EntityCard
            id={row.id}
            title={row.name}
            badge={
                <StatusBadge
                    status={row.isActive ? "active" : "inactive"}
                    label={row.isActive ? t("users.status.active") : t("users.status.inactive")}
                />
            }
            fields={fields}
            onClick={onClick}
            renderActions={renderActions}
        />
    );
}