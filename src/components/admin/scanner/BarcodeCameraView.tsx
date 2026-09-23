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
   * Plays a loud, short barcode-scanner beep.
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

      // Reuse the same AudioContext.
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContextClass();
      }

      const audioContext = audioContextRef.current;

      // Mobile browsers may suspend the AudioContext.
      if (audioContext.state === "suspended") {
        void audioContext.resume();
      }

      const now = audioContext.currentTime;

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      /*
       * Barcode scanner sound:
       * - Square wave gives it a hardware-scanner character.
       * - 2000Hz makes it easy to hear.
       */
      oscillator.type = "square";
      oscillator.frequency.setValueAtTime(2000, now);

      /*
       * Louder volume.
       *
       * 0.3 = clearly noticeable
       * 0.5 = very loud
       */
      gainNode.gain.setValueAtTime(0.3, now);

      // Short fade-out to avoid an unpleasant click.
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        now + 0.12
      );

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start(now);
      oscillator.stop(now + 0.12);
    } catch {
      // Audio failure must never break barcode scanning.
    }
  };

  /**
   * Start the camera automatically.
   */
  useEffect(() => {
    void start();
  }, [start]);

  /**
   * Handle barcode detection.
   */
  useEffect(() => {
    if (!lastResult) {
      return;
    }

    /*
     * 🔊 Play the beep every time a barcode result
     * reaches this component.
     */
    playScanBeep();

    const now = Date.now();
    const last = lastSentRef.current;

    /*
     * Prevent sending the same barcode repeatedly
     * to the laptop within 2 seconds.
     *
     * The beep still plays because it happens BEFORE
     * this suppression check.
     */
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

    /*
     * Existing WebRTC flow.
     * Nothing changes here.
     */
    onDetected(lastResult);
  }, [lastResult, onDetected]);

  /**
   * Cleanup AudioContext when component unmounts.
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