// Intended project path: src/hooks/useMobileScanner.ts
import { useCallback, useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType, NotFoundException } from "@zxing/library";

export type MobileScannerMode = "qr" | "barcode";
export type CameraState = "idle" | "requesting" | "active" | "denied" | "unavailable" | "unsupported";

interface UseMobileScannerResult {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  cameraState: CameraState;
  lastResult: string | null;
  error: string | null;
  start: () => Promise<void>;
  stop: () => void;
}

// The MobileScanner responsibility, as specified in the brief: camera,
// barcode detection, scanner lifecycle, detected barcode. Deliberately
// knows nothing about Firebase or the Product API — it hands back a plain
// decoded string and nothing else; the caller (QrPairingView or
// BarcodeCameraView) decides what that string means.
//
// Reused for two different decode targets via `mode`:
//   "qr"      — decoding the laptop's pairing QR (a bare session UUID)
//   "barcode" — decoding product barcodes: EAN-13, EAN-8, UPC-A, UPC-E, Code 128
// @zxing/browser handles both with the same reader, just different format
// hints — one library, no second dependency needed for QR vs barcode.
export const useMobileScanner = (mode: MobileScannerMode): UseMobileScannerResult => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);

  const [cameraState, setCameraState] = useState<CameraState>("idle");
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stop = useCallback(() => {
    controlsRef.current?.stop();
    controlsRef.current = null;
    setCameraState("idle");
  }, []);

  const start = useCallback(async () => {
    setError(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraState("unsupported");
      setError("This browser doesn't support camera access.");
      return;
    }

    const hints = new Map();
    hints.set(
      DecodeHintType.POSSIBLE_FORMATS,
      mode === "qr"
        ? [BarcodeFormat.QR_CODE]
        : [
            BarcodeFormat.EAN_13,
            BarcodeFormat.EAN_8,
            BarcodeFormat.UPC_A,
            BarcodeFormat.UPC_E,
            BarcodeFormat.CODE_128,
          ]
    );

    const reader = new BrowserMultiFormatReader(hints);
    readerRef.current = reader;

    try {
      setCameraState("requesting");
      const controls = await reader.decodeFromConstraints(
        { video: { facingMode: "environment" } },
        videoRef.current as HTMLVideoElement,
        (result, err) => {
          if (result) setLastResult(result.getText());
          if (err && !(err instanceof NotFoundException)) {
            // NotFoundException fires continuously while no code is in
            // frame — that's normal scanning idle, not an error to surface.
          }
        }
      );
      controlsRef.current = controls;
      setCameraState("active");
    } catch (err) {
      if (err instanceof DOMException && err.name === "NotAllowedError") {
        setCameraState("denied");
        setError("Camera permission was denied.");
      } else if (err instanceof DOMException && err.name === "NotFoundError") {
        setCameraState("unavailable");
        setError("No camera was found on this device.");
      } else {
        setCameraState("unavailable");
        setError("Couldn't start the camera.");
      }
    }
  }, [mode]);

  useEffect(() => stop, [stop]);

  return { videoRef, cameraState, lastResult, error, start, stop };
};