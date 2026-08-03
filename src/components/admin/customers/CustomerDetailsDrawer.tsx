// src/components/admin/customers/CustomerDetailsDrawer.tsx
//
// Read-only summary opened on row/card click. Sections: Overview
// (name + status + quick actions), Contact Information, Address, Tax
// Information — the whole record, per the design doc. No tabs, no
// Orders/Invoices/Notes/Activity Timeline sections — all explicitly cut
// since nothing in the confirmed API backs them.

import { useTranslation } from "react-i18next";
import { Drawer } from "../../common/Drawer";
import { StatusBadge } from "../../common/StatusBadge";

export interface CustomerDetailsData {
  id: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  taxNumber: string;
  isActive: boolean;
}

export interface CustomerDetailsDrawerProps {
  open: boolean;
  onClose: () => void;
  customer: CustomerDetailsData | null;
  onEdit: (id: string) => void;
  onSetActive: (id: string, active: boolean) => Promise<void>;
  onDeactivateRequest: (id: string) => void;
  onDeleteRequest: (id: string) => void;
}

export function CustomerDetailsDrawer({
  open,
  onClose,
  customer,
  onEdit,
  onSetActive,
  onDeactivateRequest,
  onDeleteRequest,
}: CustomerDetailsDrawerProps) {
  const { t } = useTranslation();

  if (!customer) return null;

  return (
    <Drawer open={open} onClose={onClose} title={customer.name}>
      <div className="mb-4 flex items-center gap-2">
        <StatusBadge
          status={customer.isActive ? "active" : "inactive"}
          label={customer.isActive ? t("users.status.active") : t("users.status.inactive")}
        />
      </div>

      <section className="mb-6">
        <h3 className="mb-3 text-xs font-medium uppercase tracking-wide text-[var(--ink-tertiary)]">
          {t("customers.details.sections.contact")}
        </h3>
        <div className="flex flex-col gap-3 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-[var(--ink-tertiary)]">{t("customers.column.contactName")}</span>
            <span className="text-end text-[var(--ink-primary)]">{customer.contactName || "—"}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-[var(--ink-tertiary)]">{t("customers.column.phone")}</span>
            <span dir="ltr" className="text-end text-[var(--ink-primary)]">
              {customer.phone || "—"}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-[var(--ink-tertiary)]">{t("customers.column.email")}</span>
            <span dir="ltr" className="text-end text-[var(--ink-primary)]">
              {customer.email || "—"}
            </span>
          </div>
        </div>
      </section>

      <section className="mb-6">
        <h3 className="mb-3 text-xs font-medium uppercase tracking-wide text-[var(--ink-tertiary)]">
          {t("customers.details.sections.address")}
        </h3>
        <p className="whitespace-pre-line text-sm text-[var(--ink-primary)]">
          {customer.address || "—"}
        </p>
      </section>

      <section className="mb-6">
        <h3 className="mb-3 text-xs font-medium uppercase tracking-wide text-[var(--ink-tertiary)]">
          {t("customers.details.sections.tax")}
        </h3>
        <p className="font-mono text-sm text-[var(--ink-primary)]">{customer.taxNumber || "—"}</p>
      </section>

      <div className="flex flex-wrap gap-2 border-t border-[var(--hairline)] pt-4">
        {customer.isActive ? (
          <button
            type="button"
            onClick={() => onDeactivateRequest(customer.id)}
            className="rounded-[10px] border border-[var(--hairline)] px-3 py-2 text-sm font-medium text-[var(--ink-primary)] hover:bg-[var(--sunken)]"
          >
            {t("customers.actions.deactivate")}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onSetActive(customer.id, true)}
            className="rounded-[10px] border border-[var(--hairline)] px-3 py-2 text-sm font-medium text-[var(--ink-primary)] hover:bg-[var(--sunken)]"
          >
            {t("customers.actions.activate")}
          </button>
        )}
        <button
          type="button"
          onClick={() => onDeleteRequest(customer.id)}
          className="rounded-[10px] border border-[var(--hairline)] px-3 py-2 text-sm font-medium text-[var(--error)] hover:bg-[var(--sunken)]"
        >
          {t("customers.actions.delete")}
        </button>
        <button
          type="button"
          onClick={() => onEdit(customer.id)}
          className="ms-auto rounded-[10px] bg-[var(--signal)] px-3 py-2 text-sm font-medium text-white hover:bg-[var(--signal-hover)]"
        >
          {t("customers.actions.edit")}
        </button>
      </div>
    </Drawer>
  );
}
