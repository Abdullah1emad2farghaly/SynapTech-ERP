

import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { tokens } from "@/theme/tokens";
import { useThemeStore } from "@/store/themeStore";

interface Panel {
  x: number;
  y: number;
  w: number;
  h: number;
  isHub?: boolean;
}

// Two shared columns (x=40, x=210) hold every satellite panel. The hub
// is the sole exception — it spans both columns (x=40, w=280) and sits
// near vertical center, which is what makes it read as the network's
// core rather than just another node with a different fill.
//
// Everything is kept within y ≈ 26–478 of the 640-tall viewBox — clear
// of the gradient zone below (see GRADIENT_HEIGHT) so no panel ever
// fades into invisibility behind the brand text.
const PANELS: Panel[] = [
  { x: 40, y: 26, w: 130, h: 52 },
  { x: 210, y: 26, w: 110, h: 40 },
  { x: 40, y: 92, w: 130, h: 92 },
  { x: 210, y: 80, w: 110, h: 108 },
  { x: 40, y: 208, w: 280, h: 136, isHub: true },
  { x: 40, y: 368, w: 130, h: 54 },
  { x: 210, y: 360, w: 110, h: 70 },
  { x: 40, y: 438, w: 150, h: 36 },
  { x: 210, y: 442, w: 90, h: 30 },
];

const TRACES: [number, number][] = [
  [0, 2],
  [1, 3],
  [2, 4],
  [3, 4],
  [4, 5],
  [4, 6],
  [5, 7],
  [6, 8],
];

const CORNER_RADIUS = 10;
const VIEW_W = 360;
const VIEW_H = 640;

function edgeMidpoint(panel: Panel, side: "left" | "right" | "top" | "bottom") {
  switch (side) {
    case "left":
      return { x: panel.x, y: panel.y + panel.h / 2 };
    case "right":
      return { x: panel.x + panel.w, y: panel.y + panel.h / 2 };
    case "top":
      return { x: panel.x + panel.w / 2, y: panel.y };
    case "bottom":
      return { x: panel.x + panel.w / 2, y: panel.y + panel.h };
  }
}

// Orthogonal path with one rounded bend, replacing the hard corner with
// a short quadratic curve so it reads as drawn rather than a raw PCB
// trace.
function roundedBendPath(
  from: { x: number; y: number },
  bend: { x: number; y: number },
  to: { x: number; y: number }
): string {
  // Horizontal-then-vertical bend vs vertical-then-horizontal, matching
  // which axis actually changes between from -> bend -> to.
  if (from.y === bend.y) {
    const preBend = { x: bend.x - Math.sign(bend.x - from.x) * CORNER_RADIUS, y: bend.y };
    const postBend = { x: bend.x, y: bend.y + Math.sign(to.y - bend.y) * CORNER_RADIUS };
    return `M ${from.x} ${from.y} L ${preBend.x} ${preBend.y} Q ${bend.x} ${bend.y} ${postBend.x} ${postBend.y} L ${to.x} ${to.y}`;
  }
  const preBend = { x: bend.x, y: bend.y - Math.sign(bend.y - from.y) * CORNER_RADIUS };
  const postBend = { x: bend.x + Math.sign(to.x - bend.x) * CORNER_RADIUS, y: bend.y };
  return `M ${from.x} ${from.y} L ${preBend.x} ${preBend.y} Q ${bend.x} ${bend.y} ${postBend.x} ${postBend.y} L ${to.x} ${to.y}`;
}

function traceGeometry(a: Panel, b: Panel) {
  const dx = b.x + b.w / 2 - (a.x + a.w / 2);
  const dy = b.y + b.h / 2 - (a.y + a.h / 2);
  if (Math.abs(dx) > Math.abs(dy)) {
    const from = edgeMidpoint(a, dx > 0 ? "right" : "left");
    const to = edgeMidpoint(b, dx > 0 ? "left" : "right");
    const bend = { x: (from.x + to.x) / 2, y: from.y };
    return { from, to, path: roundedBendPath(from, { x: bend.x, y: to.y }, to) };
  }
  const from = edgeMidpoint(a, dy > 0 ? "bottom" : "top");
  const to = edgeMidpoint(b, dy > 0 ? "top" : "bottom");
  const bend = { x: from.x, y: (from.y + to.y) / 2 };
  return { from, to, path: roundedBendPath(from, { x: to.x, y: bend.y }, to) };
}

export function SynapseFieldPanel({ tagline }: { tagline?: string }) {
  const { t } = useTranslation();
  const reducedMotion = useReducedMotion();
  const mode = useThemeStore((s) => s.mode);
  const isDark = mode === "dark";
  const palette = isDark ? tokens.dark : tokens.light;

  // Accent color for the hub, its glow, internal rule, and the terminal
  // pulse — pulled toward blue rather than whatever hue palette.signal
  // currently resolves to. This is a local override scoped to this
  // diagram only (palette.hairline, used for every structural trace and
  // panel border, is untouched, so the rest of the diagram still tracks
  // the shared design tokens). If the blue should be the product's
  // accent everywhere rather than just here, it belongs in
  // theme/tokens.ts as the signal/signal-hover/synapse values instead
  // of as a local override — flag that to Abdullah rather than assume.
  const accent = isDark ? "#5B8DEF" : "#2563EB";

  // Identical opacity values don't read the same on a white panel as on
  // a near-black one, since the light-mode hairline/signal tokens are
  // themselves lighter, lower-contrast colors by design. So each mode
  // gets its own tuned weights instead of one shared set:
  // - Light mode pushes structural opacity (traces, dots) UP to
  //   compensate for the already-subtle light-mode hairline color, but
  //   pulls the hub glow WAY down — a translucent color wash reads as
  //   an actual glow against near-black, but as a flat tinted smudge
  //   against white.
  // - Dark mode keeps the glow prominent (that's where it earns its
  //   keep) and can afford slightly lower structural opacity since the
  //   dark-mode hairline already has more inherent contrast.
  const weight = isDark
    ? { dotGrid: 0.07, traceHub: 0.85, traceLine: 0.55, terminalDot: 0.75, hubFill: 0.12, hubRule: 0.65, glow: 0.22 }
    : { dotGrid: 0.045, traceHub: 0.9, traceLine: 0.68, terminalDot: 0.82, hubFill: 0.08, hubRule: 0.55, glow: 0.1 };

  const hubPanel = PANELS.find((p) => p.isHub) ?? PANELS[4];
  const hubCenter = { x: hubPanel.x + hubPanel.w / 2, y: hubPanel.y + hubPanel.h / 2 };
  const accentPoint = edgeMidpoint(hubPanel, "top");

  return (
    <aside className="relative hidden overflow-hidden bg-panel w-full lg:flex lg:w-[40%] lg:flex-col lg:justify-end lg:p-12">
      <svg className="absolute inset-0 h-full w-full" style={{ opacity: weight.dotGrid }} aria-hidden="true">
        <pattern id="synapse-dot-grid" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill={palette.hairline} />
        </pattern>
        <rect width="100%" height="100%" fill="url(#synapse-dot-grid)" />
      </svg>

      {/*
        preserveAspectRatio="xMidYMid slice" makes this cover the full
        aside regardless of its real aspect ratio (rather than the
        default "meet" behavior, which would letterbox and leave dead
        space) — this is what makes the diagram genuinely fill the
        panel instead of sitting in a fixed-height band at the top.
      */}
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="synapse-hub-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={accent} stopOpacity={weight.glow} />
            <stop offset="100%" stopColor={accent} stopOpacity={0} />
          </radialGradient>
        </defs>

        <motion.circle
          cx={hubCenter.x}
          cy={hubCenter.y}
          r={Math.max(hubPanel.w, hubPanel.h) * 0.85}
          fill="url(#synapse-hub-glow)"
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        />

        {TRACES.map(([a, b], i) => {
          const { from, to, path } = traceGeometry(PANELS[a], PANELS[b]);
          const involvesHub = PANELS[a].isHub || PANELS[b].isHub;
          return (
            <g key={`${a}-${b}`}>
              <motion.path
                d={path}
                fill="none"
                stroke={palette.hairline}
                strokeWidth={involvesHub ? 1.4 : 0.9}
                strokeLinecap="round"
                initial={reducedMotion ? false : { pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: involvesHub ? weight.traceHub : weight.traceLine }}
                transition={{ duration: 0.55, delay: 0.15 + i * 0.06, ease: "easeOut" }}
              />
              <motion.circle
                cx={from.x}
                cy={from.y}
                r={1.8}
                fill={palette.hairline}
                initial={reducedMotion ? false : { opacity: 0 }}
                animate={{ opacity: weight.terminalDot }}
                transition={{ duration: 0.3, delay: 0.5 + i * 0.06 }}
              />
              <motion.circle
                cx={to.x}
                cy={to.y}
                r={1.8}
                fill={palette.hairline}
                initial={reducedMotion ? false : { opacity: 0 }}
                animate={{ opacity: weight.terminalDot }}
                transition={{ duration: 0.3, delay: 0.5 + i * 0.06 }}
              />
            </g>
          );
        })}

        {PANELS.map((panel, i) => (
          <g key={i}>
            <motion.rect
              x={panel.x}
              y={panel.y}
              width={panel.w}
              height={panel.h}
              rx={panel.isHub ? 10 : 6}
              fill={panel.isHub ? hexToRgba(accent, weight.hubFill) : "none"}
              stroke={panel.isHub ? accent : palette.hairline}
              strokeWidth={panel.isHub ? 1.5 : 0.9}
              initial={reducedMotion ? false : { opacity: 0, y: panel.y + 6 }}
              animate={{ opacity: 1, y: panel.y }}
              transition={{ duration: 0.4, delay: 0.05 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
            />
            {panel.isHub ? (
              <motion.g
                initial={reducedMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <line
                  x1={panel.x + 24}
                  y1={panel.y + 32}
                  x2={panel.x + panel.w - 24}
                  y2={panel.y + 32}
                  stroke={accent}
                  strokeWidth={1.25}
                  opacity={weight.hubRule}
                />
                <line
                  x1={panel.x + 24}
                  y1={panel.y + 58}
                  x2={panel.x + panel.w - 96}
                  y2={panel.y + 58}
                  stroke={palette.hairline}
                  strokeWidth={1}
                  opacity={weight.hubRule}
                />
                <line
                  x1={panel.x + 24}
                  y1={panel.y + 78}
                  x2={panel.x + panel.w - 140}
                  y2={panel.y + 78}
                  stroke={palette.hairline}
                  strokeWidth={1}
                  opacity={weight.hubRule}
                />
              </motion.g>
            ) : null}
          </g>
        ))}

        {/* The single accent moment. */}
        <motion.circle
          cx={accentPoint.x}
          cy={accentPoint.y}
          r={3}
          fill={accent}
          initial={reducedMotion ? false : { opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.6, ease: "easeOut" }}
        />
      </svg>

      {/*
        Sized to the layout's clear zone below the lowest panel (viewBox
        y 478 of 640, ≈75% down) rather than a fixed height picked
        independently of it — this is what keeps the gradient from
        eating into the shapes above it the way the previous fixed
        height did.
      */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40"
        style={{ background: "linear-gradient(to top, var(--panel) 0%, transparent 100%)" }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col gap-2">
        <p className="max-w-[26ch] font-display text-xl leading-snug text-ink-primary">
          {tagline ?? t("auth.tagline")}
        </p>
      </div>
    </aside>
  );
}

function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
