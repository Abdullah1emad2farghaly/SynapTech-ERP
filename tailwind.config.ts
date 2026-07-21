import type { Config } from "tailwindcss";

// Design tokens from Synaptech ERP Authentication UX Spec (§2)
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "rgb(var(--color-canvas) / <alpha-value>)",
        panel: "rgb(var(--color-panel) / <alpha-value>)",
        sunken: "rgb(var(--color-sunken) / <alpha-value>)",
        "ink-primary": "rgb(var(--color-ink-primary) / <alpha-value>)",
        "ink-secondary": "rgb(var(--color-ink-secondary) / <alpha-value>)",
        "ink-tertiary": "rgb(var(--color-ink-tertiary) / <alpha-value>)",
        signal: "rgb(var(--color-signal) / <alpha-value>)",
        "signal-hover": "rgb(var(--color-signal-hover) / <alpha-value>)",
        synapse: "rgb(var(--color-synapse) / <alpha-value>)",
        success: "rgb(var(--color-success) / <alpha-value>)",
        error: "rgb(var(--color-error) / <alpha-value>)",
        warning: "rgb(var(--color-warning) / <alpha-value>)",
        hairline: "rgb(var(--color-hairline) / <alpha-value>)",
      },
      fontFamily: {
        display: ["'Cabinet Grotesk'", "'General Sans'", "system-ui", "sans-serif"],
        body: ["Inter", "'IBM Plex Sans Arabic'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "16px",
      },
      boxShadow: {
        elevation1:
          "0 1px 2px rgba(18,22,42,0.04), 0 8px 24px rgba(18,22,42,0.06)",
      },
      transitionTimingFunction: {
        control: "ease-out",
        state: "cubic-bezier(0.16,1,0.3,1)",
      },
      transitionDuration: {
        control: "160ms",
        state: "280ms",
      },
    },
  },
  plugins: [],
} satisfies Config;
