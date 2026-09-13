// src/components/admin/branches/BranchCard.tsx
//
// Mobile counterpart to BranchesTable's rows — Name + Status badge as
// header, Code shown as a field row (table shows it as a subtitle under
// the name, but EntityCard has no subtitle slot yet), Address/Phone/Main
// badge complete the body.

import { useTranslation } from "react-i18next";
import { EntityCard, type EntityCardField } from "../../common/EntityCard";
import { StatusBadge } from "../../common/StatusBadge";
import { MainBranchBadge } from "../../common/MainBranchBadge";
import type { BranchRow } from "./BranchesTable";

export interface BranchCardProps {
  row: BranchRow;
  onClick: (id: string) => void;
  renderActions: () => React.ReactNode;
}

export function BranchCard({ row, onClick, renderActions }: BranchCardProps) {
  const { t } = useTranslation();

  const fields: EntityCardField[] = [
    { key: "code", label: t("branches.column.branch"), value: <span className="font-mono text-xs">{row.code}</span>, dir: "ltr" },
    {
      key: "address",
      label: t("branches.column.address"),
      value: row.address || "—",
    },
    {
      key: "phone",
      label: t("branches.column.phone"),
      value: row.phone || "—",
      dir: "ltr",
    },
  ];

  return (
    <EntityCard
      id={row.id}
      title={row.name}
      badge={
        <div className="flex items-center gap-1.5">
          <StatusBadge
            status={row.isActive ? "active" : "inactive"}
            label={row.isActive ? t("users.status.active") : t("users.status.inactive")}
          />
          {row.isMain && <MainBranchBadge label={t("branches.badge.main")} />}
        </div>
      }
      fields={fields}
      onClick={onClick}
      renderActions={renderActions}
    />
  );
}