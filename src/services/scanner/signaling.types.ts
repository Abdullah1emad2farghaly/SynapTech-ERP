// Intended project path: src/services/scanner/signaling.types.ts
export interface RtcSessionDescriptionPayload {
  type: RTCSdpType;
  sdp: string;
}

export interface IceCandidatePayload {
  candidate: string;
  sdpMid: string | null;
  sdpMLineIndex: number | null;
}

// Realtime Database shape at /scannerSessions/{sessionId}. Nothing here is
// permanent — see deleteSession() in signaling.service.ts, called once the
// WebRTC DataChannel is open (signaling data is no longer needed) or on
// pairing failure/timeout/unmount.
export interface SignalingSessionData {
  offer?: RtcSessionDescriptionPayload;
  answer?: RtcSessionDescriptionPayload;
  laptopCandidates?: Record<string, IceCandidatePayload>;
  mobileCandidates?: Record<string, IceCandidatePayload>;
  createdAt?: number;
}

export type ScannerRole = "laptop" | "mobile";
