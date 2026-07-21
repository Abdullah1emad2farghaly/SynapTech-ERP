import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { tokens } from "@/theme/tokens";
import { useThemeStore } from "@/store/themeStore";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const NODE_COUNT = 34;
const LINK_DISTANCE = 140;
const PULSE_INTERVAL_MS = 3200;

/**
 * The brand panel's signature element (see design spec §1). A field of
 * drifting nodes draws connections when close enough, and periodically
 * sends a single light pulse along one active connection — a visual
 * reference to "synapse." Reduced-motion users get a static node field
 * with no drift and no pulses.
 */
export function SynapseFieldPanel({ tagline }: { tagline?: string }) {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useReducedMotion();
  const mode = useThemeStore((s) => s.mode);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = canvas.clientWidth;
    let height = canvas.clientHeight;
    let dpr = window.devicePixelRatio || 1;
    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    const palette = mode === "dark" ? tokens.dark : tokens.light;
    const nodes: Node[] = Array.from({ length: NODE_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
    }));

    let pulseFrom = -1;
    let pulseTo = -1;
    let pulseProgress = 0;
    let lastPulseAt = 0;
    let rafId: number;

    function step(timestamp: number) {
      ctx!.clearRect(0, 0, width, height);

      if (!reducedMotion) {
        for (const n of nodes) {
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < 0 || n.x > width) n.vx *= -1;
          if (n.y < 0 || n.y > height) n.vy *= -1;
        }
      }

      // Draw connections
      ctx!.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK_DISTANCE) {
            const alpha = 1 - dist / LINK_DISTANCE;
            ctx!.strokeStyle = hexToRgba(palette.hairline, alpha * 0.5);
            ctx!.beginPath();
            ctx!.moveTo(nodes[i].x, nodes[i].y);
            ctx!.lineTo(nodes[j].x, nodes[j].y);
            ctx!.stroke();
          }
        }
      }

      // Occasional single pulse traveling along one active connection
      if (!reducedMotion) {
        if (pulseFrom === -1 && timestamp - lastPulseAt > PULSE_INTERVAL_MS) {
          const candidates: [number, number][] = [];
          for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
              const dx = nodes[i].x - nodes[j].x;
              const dy = nodes[i].y - nodes[j].y;
              if (Math.sqrt(dx * dx + dy * dy) < LINK_DISTANCE) candidates.push([i, j]);
            }
          }
          if (candidates.length) {
            const [a, b] = candidates[Math.floor(Math.random() * candidates.length)];
            pulseFrom = a;
            pulseTo = b;
            pulseProgress = 0;
          }
          lastPulseAt = timestamp;
        }
        if (pulseFrom !== -1) {
          pulseProgress += 0.02;
          const from = nodes[pulseFrom];
          const to = nodes[pulseTo];
          const px = from.x + (to.x - from.x) * pulseProgress;
          const py = from.y + (to.y - from.y) * pulseProgress;
          ctx!.fillStyle = palette.synapse;
          ctx!.beginPath();
          ctx!.arc(px, py, 2.5, 0, Math.PI * 2);
          ctx!.fill();
          if (pulseProgress >= 1) {
            pulseFrom = -1;
            pulseTo = -1;
          }
        }
      }

      // Draw nodes
      for (const n of nodes) {
        ctx!.fillStyle = palette.signal;
        ctx!.beginPath();
        ctx!.arc(n.x, n.y, 2, 0, Math.PI * 2);
        ctx!.fill();
      }

      rafId = requestAnimationFrame(step);
    }
    rafId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, [reducedMotion, mode]);

  return (
    <aside className="relative hidden overflow-hidden bg-panel lg:flex lg:w-[40%] lg:flex-col lg:justify-end lg:p-12">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
      <p className="relative z-10 font-display text-xl leading-snug text-ink-primary">
        {tagline ?? t("auth.tagline")}
      </p>
    </aside>
  );
}

function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
