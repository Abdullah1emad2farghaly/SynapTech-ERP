// src/components/common/EntityCard.tsx — updated status prop
//
// Generalized from isActive-only to accept any badge node, so modules with
// non-boolean statuses (Sales Orders, Purchase Orders, ...) can reuse this
// without EntityCard knowing about their specific enum.

import type { ReactNode } from "react";
import { StatusBadge } from "./StatusBadge";
import { useTranslation } from "react-i18next";

export interface EntityCardField {
    key: string;
    label: string;
    value: ReactNode;
    dir?: "ltr" | "rtl";
}

export interface EntityCardProps {
    id: string;
    title: string;
    /** Any rendered badge — e.g. <StatusBadge> for active/inactive, or a custom badge for multi-value statuses */
    badge?: ReactNode;
    fields: EntityCardField[];
    totalAmount?: number;
    onClick?: (id: string) => void;
    renderActions?: () => ReactNode;
}

export function EntityCard({ id, title, badge, totalAmount, fields, onClick, renderActions }: EntityCardProps) {
    const { t } = useTranslation();
    const interactive = Boolean(onClick);
    return (
        <div
            role="button"
            tabIndex={0}
            onClick={interactive ? () => onClick!(id) : undefined}
            onKeyDown={interactive
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onClick!(id);
                    }
                }
                : undefined}
            className="flex cursor-pointer flex-col gap-3 rounded-[16px] border border-[var(--hairline)] bg-[var(--panel)] p-4 transition-colors duration-150 hover:bg-[var(--sunken)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--synapse)]"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="truncate font-medium text-[var(--ink-primary)]">{title}</p>
                    {badge && <div className="mt-1">{badge}</div>}
                </div>
                {renderActions && (
                    <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                        {renderActions()}
                    </div>
                )}
            </div>

            {fields.length > 0 && (
                <div className="grid grid-cols-1 gap-1.5 text-sm">
                    {fields.map((field) => (
                        <div key={field.key} className="flex justify-between gap-2">
                            <span className="text-[var(--ink-tertiary)]">{field.label}</span>
                            <span dir={field.dir} className="truncate text-[var(--ink-primary)]">
                                {field.value}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {
                totalAmount !== undefined && (
                    <div className="flex items-start justify-between gap-3">
                        <div className="text-[var(--ink-tertiary)]">{t("salesOrders.table.total")}</div>
                        <div className="text-sm font-medium text-[--success]">{totalAmount?.toFixed(2)}</div>
                    </div>
                )
            }
        </div>
    );
}