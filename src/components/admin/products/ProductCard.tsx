// src/components/admin/products/ProductCard.tsx
//
// Mobile counterpart to ProductsDataTable's rows — Name (with SKU as a
// secondary line) as the header, category/unit/cost/sale price as the
// body. Mirrors the table's fields and formatting choices exactly,
// including the unresolved categoryId, since that's what the table shows.

import { useTranslation } from "react-i18next";
import { EntityCard, type EntityCardField } from "../../common/EntityCard";
import { StatusBadge } from "../../common/StatusBadge";
import type { Product } from "../../../services/api/products.api";

export interface ProductCardProps {
    product: Product;
    onClick: (id: string) => void;
    renderActions: () => React.ReactNode;
}

export function ProductCard({ product, onClick, renderActions }: ProductCardProps) {
    const { t } = useTranslation();

    const fields: EntityCardField[] = [
        {
            key: "sku",
            label: t("products.table.sku"),
            value: <span className="font-mono text-xs">{product.sku}</span>,
            dir: "ltr",
        },
        {
            key: "category",
            label: t("products.table.category"),
            value: product.categoryId || "__",
        },
        {
            key: "unit",
            label: t("products.table.unit"),
            value: product.unitOfMeasure,
        },
        {
            key: "costPrice",
            label: t("products.table.costPrice"),
            value: (product.costPrice).toFixed(2),
            dir: "ltr",
        },
        {
            key: "salePrice",
            label: t("products.table.salePrice"),
            value: (
                <span className="font-medium text-[var(--accent-emerald)]">
                    {(product.salePrice).toFixed(2)}
                </span>
            ),
            dir: "ltr",
        },
    ];

    return (
        <EntityCard
            id={product.id}
            title={product.name}
            badge={
                <StatusBadge
                    status={product.isActive ? "active" : "inactive"}
                    label={t(product.isActive ? "common.status.active" : "common.status.inactive")}
                    size="sm"
                />
            }
            fields={fields}
            onClick={onClick}
            renderActions={renderActions}
        />
    );
}