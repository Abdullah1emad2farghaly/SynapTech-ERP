// Intended project path: src/components/admin/barcode-scanner/ConnectMobileScannerCard.tsx
import { useTranslation } from "react-i18next";
import { QRCodeSVG } from "qrcode.react";
import { QrCode, Unplug } from "lucide-react";
import { ConnectionStatusBadge } from "./ConnectionStatusBadge";
import type { ScannerConnectionState } from "../../../hooks/useScannerConnection";
import type { BarcodeMessage } from "../../../services/scanner/webrtc";

interface ConnectMobileScannerCardProps {
  state: ScannerConnectionState;
  sessionId: string | null;
  lastMessage: BarcodeMessage | null;
  error: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
}

// Purely presentational now — no useScannerConnection() call in here. The
// connection's actual lifetime is owned by whichever page renders this
// (POSPage or BarcodeScannerPage), specifically so that closing a Drawer
// this card happens to sit inside does NOT unmount it and does NOT tear
// down the WebRTC connection. See POSPage.tsx for why this mattered.
//
// "Cancel" (shown while waiting/connecting) and "Disconnect Mobile
// Scanner" (shown once connected) both call the same onDisconnect — both
// are explicit user clicks, never triggered by drawer visibility.
export const ConnectMobileScannerCard = ({
  state,
  sessionId,
  lastMessage,
  error,
  onConnect,
  onDisconnect,
}: ConnectMobileScannerCardProps) => {
  const { t } = useTranslation();

  const showQr = sessionId && (state === "waiting" || state === "connecting");

  return (
    <div className="mx-auto max-w-md space-y-4 rounded-xl border border-[var(--hairline)] bg-[var(--panel)] p-6 text-center">
      <div className="flex items-center justify-center gap-2 text-[var(--ink-primary)]">
        <QrCode className="h-5 w-5" />
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
            onClick={onConnect}
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
            onClick={onDisconnect}
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
            onClick={onDisconnect}
            className="mx-auto flex items-center gap-1.5 text-sm font-medium text-[var(--error)] transition hover:opacity-80"
          >
            <Unplug className="h-4 w-4" />
            {t("barcodeScanner.laptop.disconnectButton")}
          </button>
        </div>
      )}
    </div>
  );
};
