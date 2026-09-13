// src/components/admin/warehouses/WarehouseCard.tsx
//
// Thin Warehouses-specific wrapper around the shared EntityCard, mirroring
// CustomerCard/SupplierCard. Branch name is passed in already resolved —
// this component doesn't know about the branches lookup, same separation
// WarehousesDataTable keeps.

import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { EntityCard, type EntityCardField } from "../../common/EntityCard";
import { StatusBadge } from "../../common/StatusBadge";
import { WarehouseResponse } from "@/types/warehouses.types";

export interface WarehouseCardData {
    id: string;
    name: string;
    code: string;
    isActive: boolean;
}

export interface WarehouseCardProps {
    warehouse: WarehouseResponse;
    branchName: string | undefined | null;
    onClick: (warehouse: WarehouseResponse) => void;
    renderActions: () => ReactNode;
}

export function WarehouseCard({ warehouse, branchName, onClick, renderActions }: WarehouseCardProps) {
    const { t } = useTranslation();

    const fields: EntityCardField[] = [
        { key: "code", label: t("warehouses.table.code"), value: warehouse.code, dir: "ltr" },
        branchName && {
            key: "branch",
            label: t("warehouses.table.branch"),
            value: branchName,
        },
    ].filter(Boolean) as EntityCardField[];

    return (
        <EntityCard
            id={warehouse.id}
            title={warehouse.name}
            badge={
                <StatusBadge
                    status={warehouse.isActive ? "active" : "inactive"}
                    label={warehouse.isActive ? t("users.status.active") : t("users.status.inactive")}
                />
            }
            fields={fields}
            onClick={() => onClick(warehouse)}
            renderActions={renderActions}
        />
    );
}