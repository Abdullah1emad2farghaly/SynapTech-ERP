// Typed source of truth for the design tokens defined in globals.css.
// Components should reference Tailwind classes (bg-panel, text-ink-primary, etc.)
// rather than importing this directly — this file exists for places that need
// raw values in JS, e.g. the SynapseFieldPanel canvas drawing.

export const tokens = {
  light: {
    canvas: "#F6F7FB",
    panel: "#FFFFFF",
    sunken: "#EEF0F6",
    inkPrimary: "#12162A",
    inkSecondary: "#565C79",
    inkTertiary: "#9098B8",
    signal: "#4338CA",
    signalHover: "#3730A3",
    synapse: "#22D3EE",
    success: "#0F9D68",
    error: "#DC2626",
    warning: "#D97706",
    hairline: "#E2E4F0",
  },
  dark: {
    canvas: "#0A0E1A",
    panel: "#10152A",
    sunken: "#161C36",
    inkPrimary: "#F2F3F9",
    inkSecondary: "#A8AEC9",
    inkTertiary: "#666E93",
    signal: "#818CF8",
    signalHover: "#A5B0FB",
    synapse: "#67E8F9",
    success: "#34D399",
    error: "#F87171",
    warning: "#FBBF24",
    hairline: "#232A4A",
  },
} as const;

export type ThemeMode = "light" | "dark";
