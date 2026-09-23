// Intended project path: src/pages/admin/cashier/POSPage.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import { ScanLine, ShoppingBag, X } from "lucide-react";
import { ProductGrid } from "../../../components/admin/cashier/ProductGrid";
import { CartPanel } from "../../../components/admin/cashier/CartPanel";
import { FinancialSummary } from "../../../components/admin/cashier/FinancialSummary";
import { CustomerSelector } from "../../../components/admin/cashier/CustomerSelector";
import { PaymentPanel } from "../../../components/admin/cashier/PaymentPanel";
import { ShiftStatusBar } from "../../../components/admin/cashier/ShiftStatusBar";
import { OpenShiftDrawer } from "../../../components/admin/cashier/OpenShiftDrawer";
import { CashMovementDrawer } from "../../../components/admin/cashier/CashMovementDrawer";
import { CloseShiftDrawer } from "../../../components/admin/cashier/CloseShiftDrawer";
import { SaleSuccessDialog } from "../../../components/admin/cashier/SaleSuccessDialog";
import { ConnectMobileScannerCard } from "../../../components/admin/barcode-scanner/ConnectMobileScannerCard";
import { Drawer } from "../../../components/common/Drawer";
import {
  useCreateCashierOrder,
  useMyCurrentShift,
} from "../../../hooks/useCashier";
import { useWarehouseStock } from "../../../hooks/useStock";
import { useScannerConnection } from "../../../hooks/useScannerConnection";
import type { CashierOrderResponse, CashierPaymentRequest } from "../../../services/api/cashier.api";
import type { StockLevel } from "../../../services/api/stock.api";
import type { CashierCartLine } from "../../../components/admin/cashier/cashierCart.types";
import { cartLineToRequest } from "../../../components/admin/cashier/cashierCart.types";

export const POSPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: shift, isLoading: shiftLoading } = useMyCurrentShift();
  // Product data now comes from real per-warehouse stock, scoped to the
  // warehouse the current shift was opened against — GET
  // /api/Stock/warehouses/{warehouseId}, not the flat product catalog.
  // Only enabled once a shift (and therefore a warehouseId) exists.
  const { data: stock = [], isLoading: stockLoading } = useWarehouseStock(shift?.warehouseId);
  const createOrder = useCreateCashierOrder();

  // Owned HERE, not inside ConnectMobileScannerCard — this is the fix.
  // POSPage's mount lifetime is the whole POS session; the Scan Product
  // Drawer below is just a visibility toggle over this same, single,
  // persistent connection. Opening/closing the drawer never calls
  // startPairing/disconnect itself — only the card's own buttons do, via
  // the handlers passed down.
  const scanner = useScannerConnection();

  const [cartLines, setCartLines] = useState<CashierCartLine[]>([]);
  const [customerMode, setCustomerMode] = useState<"registered" | "walkIn">("walkIn");
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [walkInName, setWalkInName] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [payments, setPayments] = useState<CashierPaymentRequest[]>([]);

  const [openShiftDrawerOpen, setOpenShiftDrawerOpen] = useState(false);
  const [cashMovementOpen, setCashMovementOpen] = useState(false);
  const [closeShiftOpen, setCloseShiftOpen] = useState(false);
  const [paymentDrawerOpen, setPaymentDrawerOpen] = useState(false);
  const [scannerDrawerOpen, setScannerDrawerOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<CashierOrderResponse | null>(null);

  // productId → quantityOnHand, for clamping cart quantities to real stock.
  const stockByProductId = useMemo(
    () => new Map(stock.map((s) => [s.productId, s.quantityOnHand])),
    [stock]
  );

  // productId → quantity already in the cart, for ProductGrid's "remaining"
  // display (on-hand minus what's already been added to this sale).
  const quantityInCart = useMemo(
    () => Object.fromEntries(cartLines.map((l) => [l.productId, l.quantity])),
    [cartLines]
  );

  const subTotal = useMemo(
    () => cartLines.reduce((sum, l) => sum + l.quantity * l.unitPrice - l.discountAmount, 0),
    [cartLines]
  );
  const totalAmount = Math.max(0, subTotal - discountAmount + taxAmount);

  const resetSale = () => {
    setCartLines([]);
    setCustomerMode("walkIn");
    setCustomerId(null);
    setWalkInName("");
    setDiscountAmount(0);
    setTaxAmount(0);
    setPayments([]);
    setPaymentDrawerOpen(false);
  };

  const handleAddProduct = (item: StockLevel) => {
    setCartLines((prev) => {
      const existing = prev.find((l) => l.productId === item.productId);
      const maxQuantity = item.quantityOnHand;

      if (existing) {
        if (existing.quantity >= maxQuantity) return prev; // already at stock limit
        return prev.map((l) =>
          l.productId === item.productId ? { ...l, quantity: l.quantity + 1 } : l
        );
      }

      if (maxQuantity <= 0) return prev; // defensive — grid already disables this case

      return [
        ...prev,
        {
          productId: item.productId,
          productName: item.productName,
          productSku: item.productSku,
          quantity: 1,
          unitPrice: item.salePrice,
          discountAmount: 0,
        },
      ];
    });
  };

  // Scan Product integration: a scanned SKU is matched against the SAME
  // warehouse-scoped `stock` list ProductGrid already uses — not a global
  // product search. A real product that just isn't stocked at this
  // warehouse correctly reports "not found here", same as it would if you
  // searched for it in the grid instead of scanning it.
  const handleScannedSku = (rawSku: string) => {
    const sku = rawSku.trim();
    const match = stock.find((item) => item.productSku.trim().toLowerCase() === sku.toLowerCase());

    if (!match) {
      toast.error(t("cashier.pos.skuNotFound", { sku }));
      return;
    }

    const inCart = quantityInCart[match.productId] ?? 0;
    if (inCart >= match.quantityOnHand) {
      toast.error(t("cashier.pos.notEnoughStock", { available: match.quantityOnHand }));
      return;
    }

    handleAddProduct(match);
    toast.success(t("cashier.pos.scannedAdded", { name: match.productName }));
  };

  // Fires once per newly-received barcode message, regardless of whether
  // the Scan Product drawer is currently open or closed — the mobile
  // keeps scanning and the laptop keeps receiving even with the drawer
  // shut, per the required behavior. Replaces the old onSkuScanned prop
  // callback now that the card is presentational and doesn't own the
  // connection itself.
  const lastForwardedRef = useRef<typeof scanner.lastMessage>(null);
  useEffect(() => {
    if (scanner.lastMessage && scanner.lastMessage !== lastForwardedRef.current) {
      lastForwardedRef.current = scanner.lastMessage;
      handleScannedSku(scanner.lastMessage.sku);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanner.lastMessage]);

  const handleQuantityChange = (productId: string, quantity: number) => {
    const maxQuantity = stockByProductId.get(productId);
    const clamped =
      maxQuantity != null ? Math.min(Math.max(1, quantity), maxQuantity) : Math.max(1, quantity);

    if (maxQuantity != null && quantity > maxQuantity) {
      toast.error(t("cashier.pos.notEnoughStock", { available: maxQuantity }));
    }

    setCartLines((prev) => prev.map((l) => (l.productId === productId ? { ...l, quantity: clamped } : l)));
  };

  const handleRemoveLine = (productId: string) => {
    setCartLines((prev) => prev.filter((l) => l.productId !== productId));
  };

  const amountPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const canCompleteSale = cartLines.length > 0 && amountPaid >= totalAmount;

  const handleCompleteSale = async () => {
    try {
      const order = await createOrder.mutateAsync({
        customerId: customerMode === "registered" ? customerId : null,
        walkInCustomerName: customerMode === "walkIn" ? walkInName || null : null,
        discountAmount,
        taxAmount,
        lines: cartLines.map(cartLineToRequest),
        payments,
      });
      setCompletedOrder(order);
      resetSale();
    } catch {
      toast.error(t("cashier.pos.saleFailed"));
    }
  };

  // ── Gate: no open shift ────────────────────────────────────────────────
  if (!shiftLoading && !shift) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
        <ShoppingBag className="h-10 w-10 text-[var(--ink-tertiary)]" />
        <div>
          <h2 className="text-lg font-semibold text-[var(--ink-primary)]">
            {t("cashier.pos.noShiftTitle")}
          </h2>
          <p className="mt-1 text-sm text-[var(--ink-tertiary)]">
            {t("cashier.pos.noShiftBody")}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpenShiftDrawerOpen(true)}
          className="rounded-md bg-[var(--signal)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--signal-hover)]"
        >
          {t("cashier.shift.openShift")}
        </button>
        <OpenShiftDrawer
          open={openShiftDrawerOpen}
          onClose={() => setOpenShiftDrawerOpen(false)}
          onOpened={() => setOpenShiftDrawerOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      {shift && (
        <ShiftStatusBar
          shift={shift}
          onAddCashMovement={() => setCashMovementOpen(true)}
          onCloseShift={() => setCloseShiftOpen(true)}
        />
      )}

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[1fr_380px]">
        {/* Product area */}
        <div className="flex min-h-0 flex-col rounded-lg border border-[var(--hairline)] bg-[var(--canvas)] p-4">
          <div className="mb-3 flex shrink-0 items-center justify-end gap-2">
            {scanner.state === "connected" && (
              <span className="flex items-center gap-1.5 text-xs font-medium text-[var(--success)]">
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {t("barcodeScanner.status.connected")}
              </span>
            )}
            <button
              type="button"
              onClick={() => setScannerDrawerOpen(true)}
              className="flex items-center gap-1.5 rounded-md border border-[var(--hairline)] px-3 py-1.5 text-sm font-medium text-[var(--ink-secondary)] transition hover:border-[var(--signal)] hover:text-[var(--ink-primary)]"
            >
              <ScanLine className="h-4 w-4" />
              {t("cashier.pos.scanProduct")}
            </button>
          </div>
          <ProductGrid
            stock={stock}
            isLoading={stockLoading}
            quantityInCart={quantityInCart}
            onSelect={handleAddProduct}
          />
        </div>

        {/* Cart area — desktop/tablet sidebar, mobile drawer trigger */}
        <div className="hidden min-h-0 flex-col rounded-lg border border-[var(--hairline)] bg-[var(--panel)] p-4 lg:flex">
          <h2 className="mb-2 shrink-0 text-sm font-semibold text-[var(--ink-primary)]">
            {t("cashier.pos.currentSale")}
          </h2>
          <CartPanel lines={cartLines} onQuantityChange={handleQuantityChange} onRemove={handleRemoveLine} />
          <div className="mt-3 shrink-0 space-y-3">
            <FinancialSummary
              subTotal={subTotal}
              discountAmount={discountAmount}
              taxAmount={taxAmount}
              totalAmount={totalAmount}
            />
            <button
              type="button"
              disabled={cartLines.length === 0}
              onClick={() => setPaymentDrawerOpen(true)}
              className="w-full rounded-md bg-[var(--signal)] py-3 text-sm font-semibold text-white transition hover:bg-[var(--signal-hover)] disabled:opacity-40"
            >
              {t("cashier.pos.goToPayment")}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile: floating cart summary bar opening the payment drawer directly */}
      {cartLines.length > 0 && (
        <button
          type="button"
          onClick={() => setPaymentDrawerOpen(true)}
          className="flex shrink-0 items-center justify-between rounded-lg bg-[var(--signal)] px-4 py-3 text-white lg:hidden"
        >
          <span className="text-sm font-medium">
            {cartLines.length} {t("cashier.pos.items")}
          </span>
          <span className="font-semibold tabular-nums">{totalAmount.toFixed(2)}</span>
        </button>
      )}

      {/* Scan Product drawer — visibility ONLY. The card is always mounted
          here (not conditionally on scannerDrawerOpen); `scanner` itself
          lives above, in POSPage, so opening/closing this Drawer can never
          create a second connection or tear down an existing one. Whatever
          the Drawer component does internally (unmount its children on
          close, or just hide them) no longer matters either way — the
          WebRTC/Firebase state isn't inside what it might unmount. */}
      <Drawer
        open={scannerDrawerOpen}
        onClose={() => setScannerDrawerOpen(false)}
        title={t("cashier.pos.scanProduct")}
      >
        <ConnectMobileScannerCard
          state={scanner.state}
          sessionId={scanner.sessionId}
          lastMessage={scanner.lastMessage}
          error={scanner.error}
          onConnect={() => void scanner.startPairing()}
          onDisconnect={scanner.disconnect}
        />
      </Drawer>

      {/* Payment / checkout drawer — shared desktop+mobile so the flow is identical */}
      <Drawer
        open={paymentDrawerOpen}
        onClose={() => setPaymentDrawerOpen(false)}
        title={t("cashier.pos.checkout")}
      >
        <div className="flex h-full flex-col">
          <div className="flex-1 space-y-6 overflow-y-auto p-1">
            <div className="lg:hidden">
              <h3 className="mb-2 text-sm font-semibold text-[var(--ink-primary)]">
                {t("cashier.pos.currentSale")}
              </h3>
              <CartPanel lines={cartLines} onQuantityChange={handleQuantityChange} onRemove={handleRemoveLine} />
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold text-[var(--ink-primary)]">
                {t("cashier.customer.title")}
              </h3>
              <CustomerSelector
                mode={customerMode}
                onModeChange={setCustomerMode}
                customerId={customerId}
                onCustomerIdChange={setCustomerId}
                walkInName={walkInName}
                onWalkInNameChange={setWalkInName}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--ink-primary)]">
                  {t("cashier.summary.discount")}
                </label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(Math.max(0, Number(e.target.value)))}
                  className="w-full rounded-md border border-[var(--hairline)] bg-[var(--panel)] px-3 py-2 text-sm tabular-nums text-[var(--ink-primary)] outline-none focus:border-[var(--signal)]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--ink-primary)]">
                  {t("cashier.summary.tax")}
                </label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={taxAmount}
                  onChange={(e) => setTaxAmount(Math.max(0, Number(e.target.value)))}
                  className="w-full rounded-md border border-[var(--hairline)] bg-[var(--panel)] px-3 py-2 text-sm tabular-nums text-[var(--ink-primary)] outline-none focus:border-[var(--signal)]"
                />
              </div>
            </div>

            <FinancialSummary
              subTotal={subTotal}
              discountAmount={discountAmount}
              taxAmount={taxAmount}
              totalAmount={totalAmount}
            />

            <div>
              <h3 className="mb-2 text-sm font-semibold text-[var(--ink-primary)]">
                {t("cashier.payment.title")}
              </h3>
              <PaymentPanel totalAmount={totalAmount} payments={payments} onChange={setPayments} />
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 border-t border-[var(--hairline)] p-4">
            <button
              type="button"
              onClick={() => setPaymentDrawerOpen(false)}
              className="rounded-md p-2.5 text-[var(--ink-tertiary)] transition hover:bg-[var(--sunken)]"
              aria-label={t("common.cancel")}
            >
              <X className="h-5 w-5" />
            </button>
            <button
              type="button"
              disabled={!canCompleteSale || createOrder.isPending}
              onClick={handleCompleteSale}
              className="flex-1 rounded-md bg-[var(--signal)] py-3 text-sm font-semibold text-white transition hover:bg-[var(--signal-hover)] disabled:opacity-40"
            >
              {t("cashier.pos.completeSale")}
            </button>
          </div>
        </div>
      </Drawer>

      {shift && (
        <>
          <CashMovementDrawer open={cashMovementOpen} onClose={() => setCashMovementOpen(false)} shiftId={shift.id} />
          <CloseShiftDrawer
            open={closeShiftOpen}
            onClose={() => setCloseShiftOpen(false)}
            shift={shift}
            onClosed={() => {
              setCloseShiftOpen(false);
              navigate("/cashier/shifts");
            }}
          />
        </>
      )}

      {/* Success experience — modal-style overlay via Drawer for consistency with the rest of the app */}
      <Drawer open={Boolean(completedOrder)} onClose={() => setCompletedOrder(null)} title="">
        {completedOrder && (
          <SaleSuccessDialog
            order={completedOrder}
            onNewSale={() => setCompletedOrder(null)}
            onViewInvoice={() => navigate(`/cashier/orders/${completedOrder.id}`)}
          />
        )}
      </Drawer>
    </div>
  );
};
