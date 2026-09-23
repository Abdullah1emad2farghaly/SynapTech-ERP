// Intended project path: src/services/scanner/signaling.service.ts
//
// Every Firebase Realtime Database call for pairing lives here, following
// the same isolation principle as services/api/*.ts for the ERP backend —
// nothing outside this file touches Firebase directly. useScannerConnection
// (the "ScannerConnection" hook) is the only consumer.
import {
  ref,
  set,
  push,
  onValue,
  off,
  remove,
  serverTimestamp,
  type Unsubscribe,
} from "firebase/database";
import { getScannerDatabase, ensureScannerAuth } from "../../config/firebase";
import type {
  IceCandidatePayload,
  RtcSessionDescriptionPayload,
  ScannerRole,
} from "./signaling.types";

const sessionPath = (sessionId: string) => `scannerSessions/${sessionId}`;

// Laptop calls this to start a new pairing session. Returns the session id
// that gets encoded into the QR — a crypto-random UUID, not a URL (see
// ConnectMobileScannerCard.tsx for why: avoids needing to know/hardcode the
// app's real production domain, and the mobile side has its own in-app QR
// reader rather than relying on the OS camera app opening a link).
export const createSession = async (sessionId: string, offer: RtcSessionDescriptionPayload) => {
  await ensureScannerAuth();
  await set(ref(getScannerDatabase(), sessionPath(sessionId)), {
    offer,
    createdAt: serverTimestamp(),
  });
};

export const writeAnswer = async (sessionId: string, answer: RtcSessionDescriptionPayload) => {
  await ensureScannerAuth();
  await set(ref(getScannerDatabase(), `${sessionPath(sessionId)}/answer`), answer);
};

export const pushIceCandidate = async (
  sessionId: string,
  role: ScannerRole,
  candidate: IceCandidatePayload
) => {
  await ensureScannerAuth();
  const bucket = role === "laptop" ? "laptopCandidates" : "mobileCandidates";
  await push(ref(getScannerDatabase(), `${sessionPath(sessionId)}/${bucket}`), candidate);
};

// Mobile calls this once, after scanning the QR, to fetch the laptop's
// offer without needing a live subscription — a one-shot read.
export const readOffer = async (
  sessionId: string
): Promise<RtcSessionDescriptionPayload | null> => {
  await ensureScannerAuth();
  return new Promise((resolve, reject) => {
    const offerRef = ref(getScannerDatabase(), `${sessionPath(sessionId)}/offer`);
    onValue(
      offerRef,
      (snapshot) => {
        off(offerRef);
        resolve(snapshot.val());
      },
      (error) => {
        off(offerRef);
        reject(error);
      },
      { onlyOnce: true }
    );
  });
};

// Laptop subscribes to this while in "waiting" state — fires once the
// mobile writes its answer.
export const subscribeToAnswer = (
  sessionId: string,
  onAnswer: (answer: RtcSessionDescriptionPayload) => void
): Unsubscribe => {
  const answerRef = ref(getScannerDatabase(), `${sessionPath(sessionId)}/answer`);
  const listener = onValue(answerRef, (snapshot) => {
    const value = snapshot.val();
    if (value) onAnswer(value);
  });
  return () => off(answerRef, "value", listener);
};

// Each side subscribes to the OTHER side's candidate bucket.
export const subscribeToIceCandidates = (
  sessionId: string,
  fromRole: ScannerRole,
  onCandidate: (candidate: IceCandidatePayload) => void
): Unsubscribe => {
  const bucket = fromRole === "laptop" ? "laptopCandidates" : "mobileCandidates";
  const candidatesRef = ref(getScannerDatabase(), `${sessionPath(sessionId)}/${bucket}`);
  const listener = onValue(candidatesRef, (snapshot) => {
    snapshot.forEach((child) => {
      onCandidate(child.val());
    });
  });
  return () => off(candidatesRef, "value", listener);
};

// Called once the DataChannel is open (signaling data no longer needed),
// on explicit disconnect, on pairing failure/timeout, and on unmount if
// pairing never completed — keeps the "temporary" promise made in the
// brief rather than leaving sessions to accumulate.
export const deleteSession = async (sessionId: string): Promise<void> => {
  try {
    await remove(ref(getScannerDatabase(), sessionPath(sessionId)));
  } catch {
    // best-effort cleanup — a failed delete here shouldn't surface as a
    // user-facing error, the session is short-lived and harmless either way
  }
};
