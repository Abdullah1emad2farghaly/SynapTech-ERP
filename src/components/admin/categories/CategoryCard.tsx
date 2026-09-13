

import { useTranslation } from "react-i18next";
import { EntityCard, type EntityCardField } from "../../common/EntityCard";
import { StatusBadge } from "../../common/StatusBadge";
import type { CategoryFlatRow } from "./CategoriesTable";

export interface CategoryCardProps {
    row: CategoryFlatRow;
    onClick: (id: string) => void;
    renderActions: () => React.ReactNode;
}

export function CategoryCard({ row, onClick, renderActions }: CategoryCardProps) {
    const { t } = useTranslation();

    const fields: EntityCardField[] = [
        row.parentName && {
            key: "parent",
            label: t("categories.column.parent"),
            value: row.parentName,
        },
        {
            key: "childrenCount",
            label: t("categories.column.childrenCount"),
            value: row.childrenCount,
            dir: "ltr",
        },
        {
            key: "parent",
            label: t("categories.column.parent"),
            value: row.parentName ?? (
                <span className="italic text-[var(--ink-tertiary)]">
                    {t("categories.create.fields.parentCategoryNone")}
                </span>
            ),
            dir: "ltr",
        },
    ].filter(Boolean) as EntityCardField[];

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