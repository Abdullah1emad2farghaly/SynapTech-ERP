// Intended project path: src/hooks/useScannerConnection.ts
import { useCallback, useEffect, useRef, useState } from "react";
import {
  createSession,
  deleteSession,
  pushIceCandidate,
  readOffer,
  subscribeToAnswer,
  subscribeToIceCandidates,
  writeAnswer,
} from "../services/scanner/signaling.service";
import { createScannerPeerConnection, isBarcodeMessage, type BarcodeMessage } from "../services/scanner/webrtc";

export type ScannerConnectionState =
  | "idle"
  | "waiting"
  | "connecting"
  | "connected"
  | "disconnected"
  | "failed";

const PAIRING_TIMEOUT_MS = 120_000; // 2 minutes — matches the "temporary session" requirement

interface UseScannerConnectionResult {
  state: ScannerConnectionState;
  sessionId: string | null;
  lastMessage: BarcodeMessage | null;
  error: string | null;
  // Laptop side: generates a session + offer, returns the id to encode in the QR.
  startPairing: () => Promise<void>;
  // Mobile side: called with the sessionId decoded from the QR.
  joinSession: (sessionId: string) => Promise<void>;
  sendBarcode: (sku: string) => void;
  disconnect: () => void;
}

// The ScannerConnection responsibility, as specified in the brief: Firebase
// signaling, WebRTC connection, RTCDataChannel, pairing/connection state,
// reconnect/disconnect, sending/receiving scanner messages. Deliberately
// knows nothing about Cashier, Products, or barcode DECODING (that's
// useMobileScanner's job) — this hook only ever sees the already-decoded
// SKU string it's asked to send, or the BarcodeMessage it received.
// No role parameter is needed: the laptop calls startPairing(), the mobile
// calls joinSession(sessionId) — which method is called IS the role, so
// there's nothing left for a separate role flag to disambiguate.
export const useScannerConnection = (): UseScannerConnectionResult => {
  const [state, setState] = useState<ScannerConnectionState>("idle");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState<BarcodeMessage | null>(null);
  const [error, setError] = useState<string | null>(null);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const unsubscribersRef = useRef<Array<() => void>>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionIdRef = useRef<string | null>(null); // avoids stale-closure reads in cleanup

  const clearTimers = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const teardown = useCallback((deleteRemoteSession: boolean) => {
    clearTimers();
    unsubscribersRef.current.forEach((unsub) => unsub());
    unsubscribersRef.current = [];

    dataChannelRef.current?.close();
    dataChannelRef.current = null;

    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;

    if (deleteRemoteSession && sessionIdRef.current) {
      void deleteSession(sessionIdRef.current);
    }
    sessionIdRef.current = null;
  }, []);

  const setupDataChannelHandlers = (channel: RTCDataChannel, currentSessionId: string) => {
    channel.onopen = () => {
      setState("connected");
      clearTimers();
      // Signaling data has done its job — clean it up immediately rather
      // than leaving it in the database for the rest of the session.
      void deleteSession(currentSessionId);
    };
    channel.onclose = () => setState("disconnected");
    channel.onerror = () => {
      setError("Connection error.");
      setState("failed");
    };
    channel.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        if (isBarcodeMessage(parsed)) setLastMessage(parsed);
      } catch {
        // malformed message — ignored, not a fatal error for the session
      }
    };
  };

  // ── Laptop role ──────────────────────────────────────────────────────
  const startPairing = useCallback(async () => {
    try {
      setError(null);
      setState("connecting");

      const newSessionId = crypto.randomUUID();
      sessionIdRef.current = newSessionId;
      setSessionId(newSessionId);

      const pc = createScannerPeerConnection();
      peerConnectionRef.current = pc;

      const channel = pc.createDataChannel("scanner");
      dataChannelRef.current = channel;
      setupDataChannelHandlers(channel, newSessionId);

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          void pushIceCandidate(newSessionId, "laptop", event.candidate.toJSON() as never);
        }
      };
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "failed") setState("failed");
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await createSession(newSessionId, { type: offer.type, sdp: offer.sdp ?? "" });

      setState("waiting");

      const unsubAnswer = subscribeToAnswer(newSessionId, async (answer) => {
        if (pc.currentRemoteDescription) return; // already applied
        await pc.setRemoteDescription(answer);
        setState("connecting");
      });
      const unsubCandidates = subscribeToIceCandidates(newSessionId, "mobile", (candidate) => {
        if (candidate.candidate) void pc.addIceCandidate(candidate).catch(() => undefined);
      });
      unsubscribersRef.current.push(unsubAnswer, unsubCandidates);

      timeoutRef.current = setTimeout(() => {
        setState((current) => (current === "connected" ? current : "failed"));
        setError("Pairing timed out. Start a new session.");
        teardown(true);
      }, PAIRING_TIMEOUT_MS);
    } catch {
      setError("Couldn't start pairing.");
      setState("failed");
      teardown(true);
    }
  }, [teardown]);

  // ── Mobile role ──────────────────────────────────────────────────────
  const joinSession = useCallback(async (scannedSessionId: string) => {
    try {
      setError(null);
      setState("connecting");
      sessionIdRef.current = scannedSessionId;
      setSessionId(scannedSessionId);

      const offer = await readOffer(scannedSessionId);
      if (!offer) {
        setError("This pairing code is invalid or has expired.");
        setState("failed");
        return;
      }

      const pc = createScannerPeerConnection();
      peerConnectionRef.current = pc;

      pc.ondatachannel = (event) => {
        dataChannelRef.current = event.channel;
        setupDataChannelHandlers(event.channel, scannedSessionId);
      };
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          void pushIceCandidate(scannedSessionId, "mobile", event.candidate.toJSON() as never);
        }
      };
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "failed") setState("failed");
      };

      await pc.setRemoteDescription(offer);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      await writeAnswer(scannedSessionId, { type: answer.type, sdp: answer.sdp ?? "" });

      const unsubCandidates = subscribeToIceCandidates(scannedSessionId, "laptop", (candidate) => {
        if (candidate.candidate) void pc.addIceCandidate(candidate).catch(() => undefined);
      });
      unsubscribersRef.current.push(unsubCandidates);

      timeoutRef.current = setTimeout(() => {
        setState((current) => (current === "connected" ? current : "failed"));
        setError("Connection timed out.");
      }, PAIRING_TIMEOUT_MS);
    } catch {
      setError("Couldn't join this pairing session.");
      setState("failed");
    }
  }, []);

  const sendBarcode = useCallback((sku: string) => {
    const channel = dataChannelRef.current;
    if (!channel || channel.readyState !== "open") return;
    const message: BarcodeMessage = { type: "barcode", sku };
    channel.send(JSON.stringify(message));
  }, []);

  const disconnect = useCallback(() => {
    teardown(true);
    setState("idle");
    setSessionId(null);
    setLastMessage(null);
  }, [teardown]);

  // Track the latest state in a ref for the unmount-only cleanup below —
  // deliberately NOT a dependency of that effect. Making `state` a
  // dependency there was the original bug: React re-runs a useEffect's
  // cleanup on every dependency change, not just on unmount, so with
  // `state` listed it fired teardown(true) — closing the peer connection
  // AND deleting the just-created Firebase session — on every single
  // state transition (idle→connecting→waiting→...), which is exactly why
  // the QR would appear and immediately vanish.
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    return () => teardown(stateRef.current !== "connected");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teardown]);

  return { state, sessionId, lastMessage, error, startPairing, joinSession, sendBarcode, disconnect };
};