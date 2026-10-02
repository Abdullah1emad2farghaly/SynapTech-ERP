// Project path: src/components/cashier/invoices/InvoiceTable.tsx
//
// Composes the real DataTable (src/components/common/DataTable.tsx) with
// Cashier-invoice-specific columns.
//
// DataTable itself is presentation-only and documented as server-side
// sort/pagination ("never load everything client-side") — but
// my-invoices and by-user/{userId} return the FULL CashierInvoiceResponse[]
// with no sort/page/pageSize query params in the confirmed contract, so
// there's no server to delegate to here. Rather than inventing query
// params that don't exist, this component owns a small amount of local
// sort + pagination state over the array it's given and feeds DataTable
// just the current page — the same trade-off already made for filtering
// in InvoiceHistory.tsx. If the backend later adds real pagination/sort
// params to these endpoints, this local state should be deleted in favor
// of passing page/sort up through useMyInvoices / useInvoicesByUser.

import { ReactNode, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DataTable,
  DataTablePagination,
  type DataTableColumn,
  type SortDirection,
} from '../../../common/DataTable';
import { InvoiceStatusBadge } from './InvoiceStatusBadge';
import { formatCurrency, formatDate } from '../../../../utils/formatters';
import type { CashierInvoiceResponse } from '../../../../types/cashier-invoice.types';

interface InvoiceTableProps {
  invoices: CashierInvoiceResponse[];
  onView: (invoice: CashierInvoiceResponse) => void;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50];

type SortableField = 'invoiceDate' | 'totalAmount' | 'amountPaid';

const SORT_ACCESSORS: Record<SortableField, (row: CashierInvoiceResponse) => number | string> = {
  invoiceDate: (row) => row.invoiceDate,
  totalAmount: (row) => row.totalAmount,
  amountPaid: (row) => row.amountPaid,
};

export function InvoiceTable({ invoices, onView }: InvoiceTableProps) {
  const { t } = useTranslation('');

  const [sortColumnId, setSortColumnId] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);

  // The incoming array only changes identity when the upstream filters
  // (or the underlying query) actually change — see the useMemo in
  // InvoiceHistory.tsx — so this is a safe trigger to reset to page 1.
  useEffect(() => {
    setPage(1);
  }, [invoices]);

  const sortedInvoices = useMemo(() => {
    if (!sortColumnId || !sortDirection || !(sortColumnId in SORT_ACCESSORS)) {
      return invoices;
    }
    const accessor = SORT_ACCESSORS[sortColumnId as SortableField];
    const sorted = [...invoices].sort((a, b) => {
      const av = accessor(a);
      const bv = accessor(b);
      if (av < bv) return -1;
      if (av > bv) return 1;
      return 0;
    });
    return sortDirection === 'desc' ? sorted.reverse() : sorted;
  }, [invoices, sortColumnId, sortDirection]);

  const pagedInvoices = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedInvoices.slice(start, start + pageSize);
  }, [sortedInvoices, page, pageSize]);

  const columns: DataTableColumn<CashierInvoiceResponse>[] = [
    {
      id: 'invoiceNumber',
      header: t('invoices.columns.invoiceNumber'),
      cell: (row) => (
        <span className="font-medium text-[var(--ink-primary)]">
          {row.invoiceNumber ?? t('invoices.unnumbered')}
        </span>
      ),
    },
    {
      id: 'invoiceDate',
      header: t('invoices.columns.date'),
      sortable: true,
      cell: (row) => formatDate(row.invoiceDate),
    },
    {
      id: 'customer',
      header: t('invoices.columns.customer'),
      cell: (row) =>
        row.walkInCustomerName ??
        (row.customerId ? t('invoices.registeredCustomer') : t('invoices.walkInCustomer')),
    },
    {
      id: 'status',
      header: t('invoices.columns.status'),
      cell: (row) => <InvoiceStatusBadge status={row.status} />,
    },
    {
      id: 'totalAmount',
      header: t('invoices.columns.total'),
      sortable: true,
      cell: (row) => (
        <span className="font-medium tabular-nums">{formatCurrency(row.totalAmount)}</span>
      ),
    },
    {
      id: 'amountPaid',
      header: t('invoices.columns.amountPaid'),
      sortable: true,
      cell: (row) => <span className="tabular-nums">{formatCurrency(row.amountPaid)}</span>,
    },
    {
      id: 'actions',
      header: t('invoices.columns.actions'),
      cell: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onView(row);
            }}
            className="rounded-[6px] px-2.5 py-1 text-xs font-medium text-[var(--signal)] hover:bg-[var(--sunken)]"
          >
            {t('invoices.actions.view')}
          </button>
{/* 
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPrint(row);
            }}
            className="rounded-[6px] px-2.5 py-1 text-xs font-medium text-[var(--ink-secondary)] hover:bg-[var(--sunken)]"
          >
            {t('invoices.actions.print')}
          </button> */}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col">
      <DataTable
        columns={columns}
        rows={pagedInvoices}
        getRowId={(row: CashierInvoiceResponse) => row.id}
        onRowClick={onView}
        sortColumnId={sortColumnId}
        sortDirection={sortDirection}
        onSortChange={(columnId: string, direction: SortDirection) => {
          setSortColumnId(direction ? columnId : null);
          setSortDirection(direction);
        }}
      />
      <DataTablePagination
        page={page}
        pageSize={pageSize}
        totalCount={sortedInvoices.length}
        onPageChange={setPage}
        onPageSizeChange={(size: number) => {
          setPageSize(size);
          setPage(1);
        }}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
      />
    </div>
  );
}
