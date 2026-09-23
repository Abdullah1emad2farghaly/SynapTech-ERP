import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Camera } from "lucide-react";
import { useMobileScanner } from "../../../hooks/useMobileScanner";

interface BarcodeCameraViewProps {
  onDetected: (sku: string) => void;
}

const REPEAT_SUPPRESS_MS = 2000;

export const BarcodeCameraView = ({
  onDetected,
}: BarcodeCameraViewProps) => {
  const { t } = useTranslation();

  const {
    videoRef,
    cameraState,
    lastResult,
    error,
    start,
  } = useMobileScanner("barcode");

  const lastSentRef = useRef<{
    value: string;
    at: number;
  } | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);

  /**
   * Play a short barcode-scanner beep.
   */
  const playScanBeep = () => {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (
          window as typeof window & {
            webkitAudioContext?: typeof AudioContext;
          }
        ).webkitAudioContext;

      if (!AudioContextClass) {
        return;
      }

      // Reuse the same AudioContext instead of creating
      // a new one for every barcode.
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContextClass();
      }

      const audioContext = audioContextRef.current;

      // Mobile browsers can suspend AudioContext.
      if (audioContext.state === "suspended") {
        void audioContext.resume();
      }

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      // Hardware-scanner-like sound.
      oscillator.type = "square";
      oscillator.frequency.setValueAtTime(
        1800,
        audioContext.currentTime
      );

      // Keep the beep short and not too loud.
      gainNode.gain.setValueAtTime(
        0.08,
        audioContext.currentTime
      );

      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + 0.08
      );

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.08);
    } catch {
      // Audio must never break barcode scanning.
    }
  };

  /**
   * Start camera automatically when the component mounts.
   */
  useEffect(() => {
    void start();
  }, [start]);

  /**
   * Handle successful barcode detection.
   */
  useEffect(() => {
    if (!lastResult) {
      return;
    }

    // 🔊 Play beep whenever a barcode detection reaches this component.
    playScanBeep();

    const now = Date.now();
    const last = lastSentRef.current;

    // Prevent sending the same barcode repeatedly
    // to the laptop within the suppression window.
    if (
      last &&
      last.value === lastResult &&
      now - last.at < REPEAT_SUPPRESS_MS
    ) {
      return;
    }

    lastSentRef.current = {
      value: lastResult,
      at: now,
    };

    // Send the SKU through the existing WebRTC flow.
    onDetected(lastResult);
  }, [lastResult, onDetected]);

  /**
   * Cleanup audio context when the scanner is unmounted.
   */
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        void audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-3 p-4">
      <div className="flex items-center gap-2 text-[var(--ink-primary)]">
        <Camera className="h-5 w-5" />

        <h2 className="text-base font-semibold">
          {t("barcodeScanner.mobile.cameraScannerTitle")}
        </h2>
      </div>

      <div className="relative w-full max-w-sm overflow-hidden rounded-xl bg-black">
        <video
          ref={videoRef}
          className="aspect-[3/4] w-full object-cover"
          muted
          playsInline
        />
      </div>

      {cameraState === "requesting" && (
        <p className="text-sm text-[var(--ink-tertiary)]">
          {t("barcodeScanner.mobile.requestingCamera")}
        </p>
      )}

      {cameraState === "active" && (
        <p className="text-sm text-[var(--ink-tertiary)]">
          {t("barcodeScanner.mobile.pointAtBarcode")}
        </p>
      )}

      {lastResult && (
        <p className="font-mono text-sm text-[var(--success)]">
          {t("barcodeScanner.mobile.sent")}: {lastResult}
        </p>
      )}

      {(cameraState === "denied" ||
        cameraState === "unavailable" ||
        cameraState === "unsupported") &&
        error && (
          <p className="text-sm text-[var(--error)]">
            {error}
          </p>
        )}
    </div>
  );
};