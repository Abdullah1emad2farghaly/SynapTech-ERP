// Project path: src/pages/admin/suppliers/SupplierDetailsPage.tsx
// Route: /suppliers/:id
//
// "Purchase Orders" section is an honest placeholder — the API relationship
// (Purchase Orders reference supplierId/supplierName) is real, but no Purchase
// Orders endpoint has been confirmed yet, so no purchase data is invented here.

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Pencil, Trash2, ShoppingCart } from "lucide-react";
import { useSupplier } from "../../../hooks/useSuppliers";
import { SupplierStatusBadge } from "../../../components/admin/suppliers/SupplierStatusBadge";
import { SupplierDrawer } from "../../../components/admin/suppliers/SupplierDrawer";
import { SupplierDeleteDialog } from "../../../components/admin/suppliers/SupplierDeleteDialog";
import { hasAnyPermission } from "@/utils/permissions";

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 py-2">
      <span className="text-xs text-[--ink-tertiary]">{label}</span>
      <span className="text-sm text-[--ink-primary]">{value || "—"}</span>
    </div>
  );
}

export function SupplierDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: supplier, isLoading } = useSupplier(id);

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const canManageAccess = hasAnyPermission(["purchasing.suppliers.manage"]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <div className="h-8 w-64 animate-pulse rounded bg-[--sunken]" />
        <div className="h-64 animate-pulse rounded-lg bg-[--sunken]" />
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="p-6 text-center text-sm text-[--ink-secondary]">
        {t("suppliers.details.notFound")}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <button
        type="button"
        onClick={() => navigate("/inventory/suppliers")}
        className="flex w-fit items-center gap-1.5 text-sm text-[--ink-secondary] hover:text-[--ink-primary]"
      >
        <ArrowLeft size={16} className="rtl:rotate-180" />
        {t("suppliers.details.back")}
      </button>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-[--ink-primary]">{supplier.name}</h1>
            <SupplierStatusBadge isActive={supplier.isActive} />
          </div>
          <p className="mt-1 text-sm text-[--ink-secondary]">{supplier.contactName}</p>
        </div>

        {
          canManageAccess && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEditOpen(true)}
                className="inline-flex items-center gap-2 rounded-md border border-[--hairline] px-3 py-2 text-sm font-medium text-[--ink-primary] hover:bg-[--sunken]"
              >
                <Pencil size={15} />
                {t("suppliers.actions.edit")}
              </button>
              <button
                type="button"
                onClick={() => setDeleteOpen(true)}
                className="inline-flex items-center gap-2 rounded-md border border-[--hairline] px-3 py-2 text-sm font-medium text-[--error] hover:bg-[--error]/5"
              >
                <Trash2 size={15} />
                {t("suppliers.actions.delete")}
              </button>
            </div>
          )
        }

      </div>

      <div className="grid grid-cols-1 gap-x-8 gap-y-1 rounded-lg border border-[--hairline] bg-[--panel] p-5 sm:grid-cols-2">
        <DetailRow label={t("suppliers.fields.contactName")} value={supplier.contactName} />
        <DetailRow label={t("suppliers.fields.phone")} value={supplier.phone} />
        <DetailRow label={t("suppliers.fields.email")} value={supplier.email} />
        <DetailRow label={t("suppliers.fields.taxNumber")} value={supplier.taxNumber} />
        <div className="sm:col-span-2">
          <DetailRow label={t("suppliers.fields.address")} value={supplier.address} />
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-lg border border-dashed border-[--hairline] p-4">
        <ShoppingCart size={18} className="shrink-0 text-[--ink-tertiary]" />
        <div>
          <p className="text-sm font-medium text-[--ink-primary]">
            {t("suppliers.details.purchaseOrdersTitle")}
          </p>
          <p className="text-sm text-[--ink-tertiary]">
            {t("suppliers.details.purchaseOrdersDescription")}
          </p>
        </div>
      </div>

      <SupplierDrawer mode="edit" supplier={supplier} open={editOpen} onClose={() => setEditOpen(false)} />
      <SupplierDeleteDialog
        supplier={supplier}
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
        }}
      />
    </div>
  );
}
