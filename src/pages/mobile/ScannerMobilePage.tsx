// Intended project path: src/pages/mobile/ScannerMobilePage.tsx
import { useTranslation } from "react-i18next";
import { RotateCcw } from "lucide-react";
import { ConnectionStatusBadge } from "../../components/admin/barcode-scanner/ConnectionStatusBadge";
import { QrPairingView } from "@/components/admin/scanner/QrPairingView";
import { BarcodeCameraView } from "@/components/admin/scanner/BarcodeCameraView";
import { useScannerConnection } from "../../hooks/useScannerConnection";

// Route: /scanner — deliberately OUTSIDE the authenticated admin route
// tree/layout (no sidebar, no navbar, no auth guard). This is the "scanner
// page" the brief says the mobile user "opens" — a fixed, bookmarkable URL
// with no ERP login required, since the QR it pairs with never carries any
// ERP access token or credential (see signaling.service.ts). If the real
// app's router nests all pages under one root layout by default, this
// route needs to be added as a sibling outside that layout, not inside it
// — flagged since I can't confirm the router's exact structure here.
export const ScannerMobilePage = () => {
  const { t } = useTranslation();
  const { state, error, joinSession, sendBarcode, disconnect } = useScannerConnection();

  return (
    <div className="flex min-h-screen flex-col items-center bg-[var(--canvas)] px-4 py-8">
      <div className="mb-4 flex flex-col items-center gap-2">
        <h1 className="text-base font-semibold text-[var(--ink-primary)]">
          {t("barcodeScanner.mobile.pageTitle")}
        </h1>
        <ConnectionStatusBadge state={state} />
      </div>

      {state === "idle" && <QrPairingView onScanned={(id) => void joinSession(id)} />}

      {(state === "connecting" || state === "waiting") && (
        <p className="mt-6 text-sm text-[var(--ink-tertiary)]">{t("barcodeScanner.mobile.connecting")}</p>
      )}

      {state === "connected" && <BarcodeCameraView onDetected={sendBarcode} />}

      {(state === "failed" || state === "disconnected") && (
        <div className="mt-6 flex flex-col items-center gap-3 text-center">
          {error && <p className="text-sm text-[var(--error)]">{error}</p>}
          <button
            type="button"
            onClick={disconnect}
            className="flex items-center gap-1.5 rounded-md bg-[var(--signal)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--signal-hover)]"
          >
            <RotateCcw className="h-4 w-4" />
            {t("barcodeScanner.mobile.startNewPairing")}
          </button>
        </div>
      )}
    </div>
  );
};
