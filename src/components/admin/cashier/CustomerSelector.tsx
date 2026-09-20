// Intended project path: src/components/admin/cashier/CustomerSelector.tsx

import { useTranslation } from "react-i18next";
import { SearchableSelect } from "../../common/SearchableSelect";
import { useCustomers } from "../../../hooks/useCustomers";

interface CustomerSelectorProps {
  mode: "registered" | "walkIn";
  onModeChange: (mode: "registered" | "walkIn") => void;
  customerId: string | null;
  onCustomerIdChange: (id: string | null) => void;
  walkInName: string;
  onWalkInNameChange: (name: string) => void;
}

// Backend only exposes customerId / walkInCustomerName.
// The registered vs walk-in toggle is frontend-only UX to keep
// those two mutually exclusive and never send both populated.
export const CustomerSelector = ({
  mode,
  onModeChange,
  customerId,
  onCustomerIdChange,
  walkInName,
  onWalkInNameChange,
}: CustomerSelectorProps) => {
  const { t } = useTranslation();
  const { data: customers = [], isLoading } = useCustomers();

  const customerOptions = customers.map((customer) => ({
    value: customer.id || "",
    label: customer.name || "",
  }));

  const handleModeChange = (nextMode: "registered" | "walkIn") => {
    onModeChange(nextMode);

    // Keep registered customer and walk-in customer mutually exclusive.
    if (nextMode === "registered") {
      onWalkInNameChange("");
    } else {
      onCustomerIdChange(null);
    }
  };

  return (
    <div className="space-y-3">
      {/* Customer Type */}
      <div className="flex gap-1 rounded-md bg-[var(--sunken)] p-1">
        <button
          type="button"
          onClick={() => handleModeChange("registered")}
          className={`flex-1 rounded px-3 py-1.5 text-sm font-medium transition ${
            mode === "registered"
              ? "bg-[var(--panel)] text-[var(--ink-primary)] shadow-elevation-1"
              : "text-[var(--ink-tertiary)]"
          }`}
        >
          {t("cashier.customer.registered")}
        </button>

        <button
          type="button"
          onClick={() => handleModeChange("walkIn")}
          className={`flex-1 rounded px-3 py-1.5 text-sm font-medium transition ${
            mode === "walkIn"
              ? "bg-[var(--panel)] text-[var(--ink-primary)] shadow-elevation-1"
              : "text-[var(--ink-tertiary)]"
          }`}
        >
          {t("cashier.customer.walkIn")}
        </button>
      </div>

      {/* Registered Customer */}
      {mode === "registered" ? (
        // <SearchableSelect
        //   value={customerId}
        //   onChange={onCustomerIdChange}
        //   options={customerOptions}
        //   searchPlaceholder={t("cashier.customer.searchCustomer")}
        //   placeholder={t("cashier.customer.selectCustomer")}
        //   emptyResultsLabel={t("cashier.customer.noCustomersFound")}
        //   disabled={isLoading}
        // />
        <></>
      ) : (
        /* Walk-in Customer */
        <input
          value={walkInName}
          onChange={(event) => onWalkInNameChange(event.target.value)}
          placeholder={t("cashier.customer.walkInNamePlaceholder")}
          className="w-full rounded-md border border-[var(--hairline)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--ink-primary)] outline-none focus:border-[var(--signal)]"
        />
      )}
    </div>
  );
};