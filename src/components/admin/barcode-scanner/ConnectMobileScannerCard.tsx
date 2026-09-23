// Intended project path: src/components/admin/barcode-scanner/ConnectMobileScannerCard.tsx
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { QRCodeSVG } from "qrcode.react";
import { QrCode, RotateCcw, Smartphone } from "lucide-react";
import { ConnectionStatusBadge } from "./ConnectionStatusBadge";
import { useScannerConnection } from "../../../hooks/useScannerConnection";

interface ConnectMobileScannerCardProps {
  // Optional: called once for every barcode message received, in addition
  // to this component still showing "Last Received SKU" itself. Added for
  // Cashier's Scan Product integration — the standalone /tools/barcode-scanner
  // page doesn't pass this and keeps working exactly as before.
  onSkuScanned?: (sku: string) => void;
}

// The "POC UI" responsibility for the laptop side, per the brief's own
// separation of concerns — this component owns none of the WebRTC/Firebase
// logic itself, only useScannerConnection's state and the two calls it
// needs (startPairing/disconnect).
//
// The QR encodes ONLY the raw session UUID (see signaling.service.ts's
// createSession comment for why: no URL/domain assumption, no tokens, no
// sensitive data — just a random, single-use, short-lived id).
export const ConnectMobileScannerCard = ({ onSkuScanned }: ConnectMobileScannerCardProps) => {
  const { t } = useTranslation();
  const { state, sessionId, lastMessage, error, startPairing, disconnect } = useScannerConnection();

  // Fires the callback once per received message (lastMessage is a new
  // object reference each time useScannerConnection's DataChannel handler
  // sets it, even for a repeated SKU — dedup-across-time already happens
  // on the mobile side in BarcodeCameraView).
  const lastForwardedRef = useRef<typeof lastMessage>(null);
  useEffect(() => {
    if (lastMessage && lastMessage !== lastForwardedRef.current) {
      lastForwardedRef.current = lastMessage;
      onSkuScanned?.(lastMessage.sku);
    }
  }, [lastMessage, onSkuScanned]);

  const showQr = sessionId && (state === "waiting" || state === "connecting");

  return (
    <div className="mx-auto max-w-md space-y-4 rounded-xl border border-[var(--hairline)] bg-[var(--panel)] p-6 text-center">
      <div className="flex items-center justify-center gap-2 text-[var(--ink-primary)]">
        <Smartphone className="h-5 w-5" />
        <h2 className="text-base font-semibold">{t("barcodeScanner.laptop.title")}</h2>
      </div>

      <div className="flex justify-center">
        <ConnectionStatusBadge state={state} />
      </div>

      {state === "idle" || state === "failed" || state === "disconnected" ? (
        <>
          {error && <p className="text-sm text-[var(--error)]">{error}</p>}
          <button
            type="button"
            onClick={() => void startPairing()}
            className="mx-auto flex items-center gap-2 rounded-md bg-[var(--signal)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--signal-hover)]"
          >
            <QrCode className="h-4 w-4" />
            {t("barcodeScanner.laptop.connectButton")}
          </button>
        </>
      ) : showQr ? (
        <div className="space-y-3">
          <div className="flex justify-center rounded-lg bg-white p-4">
            <QRCodeSVG value={sessionId} size={220} />
          </div>
          <p className="text-sm text-[var(--ink-tertiary)]">{t("barcodeScanner.laptop.waitingForMobile")}</p>
          <button
            type="button"
            onClick={disconnect}
            className="text-xs font-medium text-[var(--ink-tertiary)] underline transition hover:text-[var(--ink-primary)]"
          >
            {t("common.cancel")}
          </button>
        </div>
      ) : null}

      {state === "connected" && (
        <div className="space-y-4">
          <div className="rounded-lg bg-[var(--sunken)] p-5">
            <p className="text-xs uppercase tracking-wide text-[var(--ink-tertiary)]">
              {t("barcodeScanner.laptop.lastReceivedSku")}
            </p>
            <p className="mt-1 font-mono text-2xl font-semibold text-[var(--ink-primary)]">
              {lastMessage?.sku ?? t("barcodeScanner.laptop.noneYet")}
            </p>
          </div>
          <button
            type="button"
            onClick={disconnect}
            className="mx-auto flex items-center gap-1.5 text-sm font-medium text-[var(--ink-secondary)] transition hover:text-[var(--ink-primary)]"
          >
            <RotateCcw className="h-4 w-4" />
            {t("barcodeScanner.laptop.newSession")}
          </button>
        </div>
      )}
    </div>
  );
};
