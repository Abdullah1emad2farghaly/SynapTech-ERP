// Intended project path: src/services/scanner/webrtc.ts
//
// Thin, role-agnostic wrapper around RTCPeerConnection setup. No Firebase
// or UI concerns here — useScannerConnection composes this with
// signaling.service.ts.
//
// STUN-only (Google's public STUN servers) — no TURN server is configured.
// This is a real, flagged limitation: STUN alone can fail to establish a
// connection across some restrictive NATs/firewalls (common on public
// wifi or carrier-grade NAT). A free-tier TURN option (e.g. a generous
// free tier on a provider like Metered or Twilio) would fix that, but
// wasn't added here to avoid introducing another paid/quota-bound external
// service the brief didn't ask for. For this POC (laptop + phone on the
// same local network, the expected real-world usage), STUN is typically
// unnecessary anyway since a direct local connection is found first.
export const SCANNER_ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

export const createScannerPeerConnection = (): RTCPeerConnection =>
  new RTCPeerConnection({ iceServers: SCANNER_ICE_SERVERS });

export interface BarcodeMessage {
  type: "barcode";
  sku: string;
}

export const isBarcodeMessage = (value: unknown): value is BarcodeMessage =>
  typeof value === "object" &&
  value !== null &&
  (value as Record<string, unknown>).type === "barcode" &&
  typeof (value as Record<string, unknown>).sku === "string";
