// Intended project path: src/components/mobile/scanner/QrPairingView.tsx
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { QrCode } from "lucide-react";
import { useMobileScanner } from "../../../hooks/useMobileScanner";

interface QrPairingViewProps {
  onScanned: (sessionId: string) => void;
}

// A basic UUID shape check — not validating that the session actually
// exists (useScannerConnection.joinSession does that against Firebase and
// surfaces "invalid or expired" itself); this just filters out a QR code
// that obviously isn't one of ours before attempting to join.
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Mobile step 1 of the "POC UI" responsibility. Uses useMobileScanner in
// "qr" mode — the same hook/library used for product barcodes later, just
// a different decode target.
export const QrPairingView = ({ onScanned }: QrPairingViewProps) => {
  const { t } = useTranslation();
  const { videoRef, cameraState, lastResult, error, start, stop } = useMobileScanner("qr");

  useEffect(() => {
    if (lastResult && UUID_PATTERN.test(lastResult)) {
      stop();
      onScanned(lastResult);
    }
  }, [lastResult, onScanned, stop]);

  if (cameraState === "idle") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
        <QrCode className="h-12 w-12 text-[var(--ink-tertiary)]" />
        <p className="text-sm text-[var(--ink-tertiary)]">{t("barcodeScanner.mobile.scanQrHint")}</p>
        <button
          type="button"
          onClick={() => void start()}
          className="rounded-md bg-[var(--signal)] px-6 py-3 text-base font-semibold text-white transition hover:bg-[var(--signal-hover)]"
        >
          {t("barcodeScanner.mobile.scanQrButton")}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 p-4">
      <div className="relative w-full max-w-sm overflow-hidden rounded-xl bg-black">
        <video ref={videoRef} className="aspect-square w-full object-cover" muted playsInline />
      </div>

      {cameraState === "requesting" && (
        <p className="text-sm text-[var(--ink-tertiary)]">{t("barcodeScanner.mobile.requestingCamera")}</p>
      )}
      {cameraState === "active" && (
        <p className="text-sm text-[var(--ink-tertiary)]">{t("barcodeScanner.mobile.pointAtQr")}</p>
      )}
      {(cameraState === "denied" || cameraState === "unavailable" || cameraState === "unsupported") && error && (
        <p className="text-sm text-[var(--error)]">{error}</p>
      )}
    </div>
  );
};
