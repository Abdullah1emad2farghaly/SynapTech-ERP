// Typed source of truth for the design tokens defined in globals.css.
// Components should reference Tailwind classes (bg-panel, text-ink-primary, etc.)
// rather than importing this directly — this file exists for places that need
// raw values in JS, e.g. the SynapseFieldPanel canvas drawing.

export const tokens = {
  light: {
    // Backgrounds
    canvas: "#F6F7FB",
    panel: "#FFFFFF",
    sunken: "#EEF0F6",

    // Text
    inkPrimary: "#12162A",
    inkSecondary: "#565C79",
    inkTertiary: "#9098B8",

    // Brand
    signal: "#4338CA",
    signalHover: "#3730A3",
    synapse: "#22D3EE",

    // Status
    success: "#0F9D68",
    error: "#DC2626",
    warning: "#D97706",

    // Borders
    hairline: "#E2E4F0",
  },

  dark: {
    // Backgrounds (Neutral Black Theme)
    canvas: "#090909",
    panel: "#141414",
    sunken: "#1C1C1C",

    // Text
    inkPrimary: "#FAFAFA",
    inkSecondary: "#B3B3B3",
    inkTertiary: "#7A7A7A",

    // Brand
    signal: "#6366F1",
    signalHover: "#818CF8",
    synapse: "#22D3EE",

    // Status
    success: "#22C55E",
    error: "#EF4444",
    warning: "#F59E0B",

    // Borders
    hairline: "#2A2A2A",
  },
} as const;

export type ThemeMode = "light" | "dark";