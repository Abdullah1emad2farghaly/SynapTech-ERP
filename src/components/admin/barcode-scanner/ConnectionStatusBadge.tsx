// Intended project path: src/components/admin/barcode-scanner/ConnectionStatusBadge.tsx
// Shared by both the laptop page and the mobile page (mobile imports it
// from this same path — nothing here is admin-shell-specific).
import { useTranslation } from "react-i18next";
import type { ScannerConnectionState } from "../../../hooks/useScannerConnection";

interface ConnectionStatusBadgeProps {
  state: ScannerConnectionState;
}

const DOT_COLOR: Record<ScannerConnectionState, string> = {
  idle: "bg-[var(--ink-tertiary)]",
  waiting: "bg-[var(--warning)]",
  connecting: "bg-[var(--warning)]",
  connected: "bg-[var(--success)]",
  disconnected: "bg-[var(--error)]",
  failed: "bg-[var(--error)]",
};

export const ConnectionStatusBadge = ({ state }: ConnectionStatusBadgeProps) => {
  const { t } = useTranslation();

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[var(--hairline)] bg-[var(--panel)] px-3 py-1.5 text-sm font-medium text-[var(--ink-primary)]">
      <span className={`h-2.5 w-2.5 rounded-full ${DOT_COLOR[state]} ${state === "waiting" || state === "connecting" ? "animate-pulse" : ""}`} />
      {t(`barcodeScanner.status.${state}`)}
    </div>
  );
};
