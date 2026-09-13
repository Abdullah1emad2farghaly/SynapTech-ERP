// src/components/admin/customers/CustomerCard.tsx
//
// Thin Customers-specific wrapper around the shared EntityCard.

import { useTranslation } from "react-i18next";
import { EntityCard, type EntityCardField } from "../../common/EntityCard";
import { StatusBadge } from "@/components/common/StatusBadge";

export interface CustomerCardData {
  id: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  isActive: boolean;
}

export interface CustomerCardProps {
  customer: CustomerCardData;
  onClick: (id: string) => void;
  renderActions: () => React.ReactNode;
}

export function CustomerCard({ customer, onClick, renderActions }: CustomerCardProps) {
  const { t } = useTranslation();

  const fields: EntityCardField[] = [
    customer.contactName && {
      key: "contactName",
      label: t("customers.column.contactName"),
      value: customer.contactName,
    },
    customer.phone && {
      key: "phone",
      label: t("customers.column.phone"),
      value: customer.phone,
      dir: "ltr",
    },
    customer.email && {
      key: "email",
      label: t("customers.column.email"),
      value: customer.email,
      dir: "ltr",
    },
  ].filter(Boolean) as EntityCardField[];

  return (
    <EntityCard
      id={customer.id}
      title={customer.name}
      badge={<StatusBadge
        status={customer.isActive ? "active" : "inactive"}
        label={
          customer.isActive
            ? t("users.status.active")
            : t("users.status.inactive")
        }
      />}
      fields={fields}
      onClick={onClick}
      renderActions={renderActions}
    />
  );
}