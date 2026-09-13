// src/components/admin/suppliers/SupplierCard.tsx
//
// Thin Suppliers-specific wrapper around the shared EntityCard, mirroring
// CustomerCard's shape. renderActions is still a caller-supplied prop —
// once you paste the shared ActionsMenu/DropdownMenu I'll wire the real
// view/edit/delete + canManageAccess gating into SuppliersListPage directly.

import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { EntityCard, type EntityCardField } from "../../common/EntityCard";
import { StatusBadge } from "../../common/StatusBadge";

export interface SupplierCardData {
    id: string;
    name: string;
    contactName: string;
    email: string;
    phone: string;
    isActive: boolean;
}

export interface SupplierCardProps {
    supplier: SupplierCardData;
    onClick: (id: string) => void;
    renderActions: () => ReactNode;
}

export function SupplierCard({ supplier, onClick, renderActions }: SupplierCardProps) {
    const { t } = useTranslation();

    const fields: EntityCardField[] = [
        supplier.contactName && {
            key: "contactName",
            label: t("suppliers.table.name"),
            value: supplier.contactName,
        },
        supplier.email && {
            key: "email",
            label: t("suppliers.table.email"),
            value: supplier.email,
            dir: "ltr",
        },
        supplier.phone && {
            key: "phone",
            label: t("suppliers.table.phone"),
            value: supplier.phone,
            dir: "ltr",
        },
    ].filter(Boolean) as EntityCardField[];

    return (
        <EntityCard
            id={supplier.id}
            title={supplier.name}
            badge={
                <StatusBadge
                    status={supplier.isActive ? "active" : "inactive"}
                    label={supplier.isActive ? t("users.status.active") : t("users.status.inactive")}
                />
            }
            fields={fields}
            onClick={onClick}
            renderActions={renderActions}
        />
    );
}