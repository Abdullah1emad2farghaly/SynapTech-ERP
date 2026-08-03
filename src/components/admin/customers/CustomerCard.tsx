// src/components/admin/customers/CustomerCard.tsx
//
// Mobile counterpart to CustomersTable's rows — Name + Status badge as
// the card header, Contact Person/Phone/Email as a compact two-column
// body, action kebab always visible (no hover-dependent affordances,
// since touch has no hover). Address and Tax Number stay off this card
// too, same reasoning as the table — Details drawer is where the full
// record lives.

import { useTranslation } from "react-i18next";
import { StatusBadge } from "../../common/StatusBadge";

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

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick(customer.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(customer.id);
        }
      }}
      className="flex cursor-pointer flex-col gap-3 rounded-[16px] border border-[var(--hairline)] bg-[var(--panel)] p-4 transition-colors duration-150 hover:bg-[var(--sunken)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--synapse)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium text-[var(--ink-primary)]">{customer.name}</p>
          <div className="mt-1">
            <StatusBadge
              status={customer.isActive ? "active" : "inactive"}
              label={customer.isActive ? t("users.status.active") : t("users.status.inactive")}
            />
          </div>
        </div>
        <div onClick={(e) => e.stopPropagation()} className="shrink-0">
          {renderActions()}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-1.5 text-sm">
        {customer.contactName && (
          <div className="flex justify-between gap-2">
            <span className="text-[var(--ink-tertiary)]">{t("customers.column.contactName")}</span>
            <span className="truncate text-[var(--ink-primary)]">{customer.contactName}</span>
          </div>
        )}
        {customer.phone && (
          <div className="flex justify-between gap-2">
            <span className="text-[var(--ink-tertiary)]">{t("customers.column.phone")}</span>
            <span dir="ltr" className="truncate text-[var(--ink-primary)]">
              {customer.phone}
            </span>
          </div>
        )}
        {customer.email && (
          <div className="flex justify-between gap-2">
            <span className="text-[var(--ink-tertiary)]">{t("customers.column.email")}</span>
            <span dir="ltr" className="truncate text-[var(--ink-primary)]">
              {customer.email}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
