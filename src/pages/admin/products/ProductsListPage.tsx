// src/pages/admin/products/ProductsListPage.tsx
//
// Owns local UI state (search/filter/sort/pagination, which drawer is open) and
// wires hooks/useProducts.ts to the presentation components, per the established
// page/component separation. This is the only place API-derived data and mutation
// calls meet the UI for this module.
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useProducts } from "../../../hooks/useProducts";
import { ProductsKpiRow } from "../../../components/admin/products/ProductsKpiRow";
import { ProductsToolbar } from "../../../components/admin/products/ProductsToolbar";
import { ProductsDataTable } from "../../../components/admin/products/ProductsDataTable";
import {
  ProductDrawer,
  type ProductDrawerMode,
} from "../../../components/admin/products/ProductDrawer";
import { DataTablePagination } from "../../../components/common/DataTable";
import type { Product } from "../../../services/api/products.api";

const PAGE_SIZE = 20;

export function ProductsListPage() {
  const { t } = useTranslation();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");
  const [page, setPage] = useState(1);
  const [sortColumnId, setSortColumnId] = useState<string | undefined>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | undefined>(
    "asc"
  );

  const [drawerMode, setDrawerMode] = useState<ProductDrawerMode>("create");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);

  const { data: products = [], isLoading, isFetching, isError, refetch } = useProducts();

  
  const categoryOptions = useMemo(
  () => Array.from(new Set(products?.map((product: Product) => product.categoryId))),
  [products]
);


  const kpis = useMemo(
    () => ({
      totalCount: products?.length ?? 0,
      activeCount: products?.filter((product: Product) => product.isActive).length,
      inactiveCount: products?.filter((product: Product) => !product.isActive).length,
      categoryCount: categoryOptions.length,
    }),
    [products?.length, products, categoryOptions]
  );

  function openCreateDrawer(): void {
    setActiveProduct(null);
    setDrawerMode("create");
    setDrawerOpen(true);
  }

  function openEditDrawer(product: Product): void {
    setActiveProduct(product);
    setDrawerMode("edit");
    setDrawerOpen(true);
  }

  function openDuplicateDrawer(product: Product): void {
    setActiveProduct(product);
    setDrawerMode("duplicate");
    setDrawerOpen(true);
  }

  function handleSortChange(columnId: string, direction: "asc" | "desc"): void {
    setSortColumnId(columnId);
    setSortDirection(direction);
    setPage(1);
  }

  return (
    <div className="mx-auto flex max-w-[1600px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-[var(--ink-primary)]">
          {t("products.pageTitle")}
        </h1>
        <p className="text-sm text-[var(--ink-secondary)]">
          {t("products.pageSubtitle")}
        </p>
      </div>

      {/* <ProductsKpiRow
        totalCount={kpis.totalCount}
        activeCount={kpis.activeCount}
        inactiveCount={kpis.inactiveCount}
        categoryCount={kpis.categoryCount}
        isLoading={isLoading}
      /> */}

        <div className="border-b border-[var(--hairline)] p-4 sm:p-5">
          <ProductsToolbar
            searchValue={search}
            onSearchChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            categoryValue={category}
            onCategoryChange={(value) => {
              setCategory(value);
              setPage(1);
            }}
            categoryOptions={categoryOptions}
            statusValue={status}
            onStatusChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
            onRefresh={() => refetch()}
            onAddProduct={openCreateDrawer}
            isRefreshing={isFetching}
          />
        </div>
      <div className="rounded-lg border border-[var(--hairline)] bg-[var(--panel)] shadow-[var(--elevation-1)]">

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.16, ease: "easeOut" }}
        >
          <ProductsDataTable
            products={products}
            isLoading={isLoading}
            hasError={isError}
            onRetry={() => refetch()}
            sortColumnId={sortColumnId}
            sortDirection={sortDirection}
            onSortChange={handleSortChange}
            onEdit={openEditDrawer}
            onDuplicate={openDuplicateDrawer}
            onDelete={() => {
              /* deletion is handled inside ProductActionMenu's ConfirmationDialog */
            }}
          />
        </motion.div>

        {/* {data && data.total > PAGE_SIZE && (
          <div className="border-t border-[var(--hairline)] p-4">
            <DataTablePagination
              page={page}
              pageSize={PAGE_SIZE}
              total={data.total}
              onPageChange={setPage}
            />
          </div>
        )} */}
      </div>

      <ProductDrawer
        open={drawerOpen}
        mode={drawerMode}
        product={activeProduct}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
