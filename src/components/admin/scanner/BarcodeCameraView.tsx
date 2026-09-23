// Intended project path: src/components/mobile/scanner/BarcodeCameraView.tsx
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Camera } from "lucide-react";
import { useMobileScanner } from "../../../hooks/useMobileScanner";

interface BarcodeCameraViewProps {
  onDetected: (sku: string) => void;
}

const REPEAT_SUPPRESS_MS = 2000; // avoid spamming the same code every camera frame

// Mobile step 2. Starts the camera automatically (connection is already
// established at this point — the brief's flow goes straight from
// "Connected" into "Camera Scanner" with no extra tap), decodes
// EAN-13/EAN-8/UPC-A/UPC-E/Code 128 via useMobileScanner in "barcode" mode,
// and forwards each new value to the caller (BarcodeScannerMobilePage),
// which hands it to useScannerConnection.sendBarcode — this component
// itself never touches Firebase or WebRTC.
export const BarcodeCameraView = ({ onDetected }: BarcodeCameraViewProps) => {
  const { t } = useTranslation();
  const { videoRef, cameraState, lastResult, error, start } = useMobileScanner("barcode");
  const lastSentRef = useRef<{ value: string; at: number } | null>(null);

  useEffect(() => {
    void start();
  }, [start]);

  useEffect(() => {
    if (!lastResult) return;
    const now = Date.now();
    const last = lastSentRef.current;
    if (last && last.value === lastResult && now - last.at < REPEAT_SUPPRESS_MS) return;
    lastSentRef.current = { value: lastResult, at: now };
    onDetected(lastResult);
  }, [lastResult, onDetected]);

  return (
    <div className="flex flex-col items-center gap-3 p-4">
      <div className="flex items-center gap-2 text-[var(--ink-primary)]">
        <Camera className="h-5 w-5" />
        <h2 className="text-base font-semibold">{t("barcodeScanner.mobile.cameraScannerTitle")}</h2>
      </div>

      <div className="relative w-full max-w-sm overflow-hidden rounded-xl bg-black">
        <video ref={videoRef} className="aspect-[3/4] w-full object-cover" muted playsInline />
      </div>

      {cameraState === "requesting" && (
        <p className="text-sm text-[var(--ink-tertiary)]">{t("barcodeScanner.mobile.requestingCamera")}</p>
      )}
      {cameraState === "active" && (
        <p className="text-sm text-[var(--ink-tertiary)]">{t("barcodeScanner.mobile.pointAtBarcode")}</p>
      )}
      {lastResult && (
        <p className="font-mono text-sm text-[var(--success)]">
          {t("barcodeScanner.mobile.sent")}: {lastResult}
        </p>
      )}
      {(cameraState === "denied" || cameraState === "unavailable" || cameraState === "unsupported") && error && (
        <p className="text-sm text-[var(--error)]">{error}</p>
      )}
    </div>
  );
};
