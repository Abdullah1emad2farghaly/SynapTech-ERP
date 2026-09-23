// Intended project path: src/pages/admin/barcode-scanner/BarcodeScannerPage.tsx
import { useTranslation } from "react-i18next";
import { ConnectMobileScannerCard } from "../../../components/admin/barcode-scanner/ConnectMobileScannerCard";
import { useScannerConnection } from "../../../hooks/useScannerConnection";

// Route: /tools/barcode-scanner — a normal authenticated page inside the
// existing admin shell/layout, same as any other module page.
//
// Calls useScannerConnection() itself now that ConnectMobileScannerCard is
// presentational-only (see POSPage.tsx for why that change happened — it
// was needed so closing Cashier's Scan Product drawer doesn't disconnect
// the connection). This page has no drawer at all, so its behavior is
// unchanged from before: the connection lives exactly as long as this
// page is mounted.
export const BarcodeScannerPage = () => {
  const { t } = useTranslation();
  const scanner = useScannerConnection();

  return (
    <div className="space-y-4 p-4">
      <div>
        <h1 className="text-lg font-semibold text-[var(--ink-primary)]">
          {t("barcodeScanner.laptop.pageTitle")}
        </h1>
        <p className="text-sm text-[var(--ink-tertiary)]">{t("barcodeScanner.laptop.pageSubtitle")}</p>
      </div>

      <ConnectMobileScannerCard
        state={scanner.state}
        sessionId={scanner.sessionId}
        lastMessage={scanner.lastMessage}
        error={scanner.error}
        onConnect={() => void scanner.startPairing()}
        onDisconnect={scanner.disconnect}
      />
    </div>
  );
};
