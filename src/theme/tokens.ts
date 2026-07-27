// ============================================================================
// SynapTech ERP Design Tokens
// Premium Enterprise Theme
// Designed for React + Tailwind CSS ERP
// ============================================================================

export const tokens = {
 light: {
  canvas: "#F8FAFC",
  panel: "#FFFFFF",
  sunken: "#F1F5F9",

  inkPrimary: "#0F172A",
  inkSecondary: "#475569",
  inkTertiary: "#94A3B8",

  signal: "#0F766E",
  signalHover: "#115E59",
  synapse: "#22D3EE",

  success: "#16A34A",
  error: "#DC2626",
  warning: "#CA8A04",

  hairline: "#E2E8F0",
},

dark: {
  canvas: "#09090B",
  panel: "#18181B",
  sunken: "#27272A",

  inkPrimary: "#FAFAFA",
  inkSecondary: "#A1A1AA",
  inkTertiary: "#71717A",

  signal: "#14B8A6",
  signalHover: "#2DD4BF",
  synapse: "#22D3EE",

  success: "#22C55E",
  error: "#EF4444",
  warning: "#EAB308",

  hairline: "#3F3F46",
}
} as const;

export type ThemeMode = "light" | "dark";