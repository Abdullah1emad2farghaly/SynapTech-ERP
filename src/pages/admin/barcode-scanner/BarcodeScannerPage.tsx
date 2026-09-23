// Intended project path: src/pages/admin/barcode-scanner/BarcodeScannerPage.tsx
import { useTranslation } from "react-i18next";
import { ConnectMobileScannerCard } from "../../../components/admin/barcode-scanner/ConnectMobileScannerCard";

// Route: /tools/barcode-scanner (see routes-barcode-scanner.tsx) — a normal
// authenticated page inside the existing admin shell/layout, same as any
// other module page. Deliberately NOT nested under Cashier or any other
// existing module's route tree, per the brief's "do not modify unrelated
// modules" and "Cashier integration is a separate task" instructions.
export const BarcodeScannerPage = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4 p-4">
      <div>
        <h1 className="text-lg font-semibold text-[var(--ink-primary)]">
          {t("barcodeScanner.laptop.pageTitle")}
        </h1>
        <p className="text-sm text-[var(--ink-tertiary)]">{t("barcodeScanner.laptop.pageSubtitle")}</p>
      </div>

      <ConnectMobileScannerCard />
    </div>
  );
};
