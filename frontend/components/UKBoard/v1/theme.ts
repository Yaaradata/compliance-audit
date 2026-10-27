/**
 * UK Board v1 — theme tokens. Light-first, conservative, low-chroma, with a dark toggle.
 * Scoped to the app root as CSS variables (no global theme, no storage).
 * Dark mode: lime #dcfc84 is never used on status, delta, gauge or marker; purple #bc6cd3
 * is the AI marker only; #3a3a3a borders are decorative only.
 */
import type { CSSProperties } from "react";
import type { Theme } from "./state/boardStore";

const LIGHT: Record<string, string> = {
  "--ukb-canvas": "#f5f6f8",
  "--ukb-surface": "#ffffff",
  "--ukb-surface-2": "#f1f3f6",
  "--ukb-border": "#e1e4e9",
  "--ukb-text": "#1b1f24",
  "--ukb-muted": "#4b5563",
  "--ukb-subtle": "#5f6773",
  "--ukb-accent": "#2f4a6d",
  "--ukb-focus": "#2f4a6d",
  "--ukb-red": "#b42318",
  "--ukb-red-bg": "#fdeceb",
  "--ukb-amber": "#8a5300",
  "--ukb-amber-bg": "#fdf3e1",
  "--ukb-green": "#2d6a3e",
  "--ukb-green-bg": "#e8f2ea",
  "--ukb-grey": "#4b5563",
  "--ukb-ai": "#bc6cd3",
  "--ukb-ai-text": "#7b2d93",
  "--ukb-highlight": "#e8eef7",
  "--ukb-track": "#c7ccd4",
};

const DARK: Record<string, string> = {
  "--ukb-canvas": "#1c1c1c",
  "--ukb-surface": "#2a2a2a",
  "--ukb-surface-2": "#333333",
  "--ukb-border": "#3a3a3a",
  "--ukb-text": "#ffffff",
  "--ukb-muted": "#d0d0d0",
  "--ukb-subtle": "#b8b8b8",
  "--ukb-accent": "#a9bcd8",
  "--ukb-focus": "#a9bcd8",
  "--ukb-red": "#ff8f85",
  "--ukb-red-bg": "#3b2422",
  "--ukb-amber": "#ffc561",
  "--ukb-amber-bg": "#3a2f1c",
  "--ukb-green": "#86d29b",
  "--ukb-green-bg": "#1f3324",
  "--ukb-grey": "#c4c4c4",
  "--ukb-ai": "#bc6cd3",
  "--ukb-ai-text": "#ffffff",
  "--ukb-highlight": "#33404f",
  "--ukb-track": "#8a8a8a",
};

export function themeVars(theme: Theme): CSSProperties {
  return (theme === "dark" ? DARK : LIGHT) as CSSProperties;
}

/** Shared class fragments. */
export const ui = {
  card: "rounded-xl border border-[var(--ukb-border)] bg-[var(--ukb-surface)]",
  focus:
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ukb-focus)]",
  muted: "text-[var(--ukb-muted)]",
  subtle: "text-[var(--ukb-subtle)]",
  button:
    "inline-flex min-h-[32px] items-center justify-center rounded-md border border-[var(--ukb-track)] bg-[var(--ukb-surface)] px-3 py-1 text-xs font-semibold text-[var(--ukb-text)] hover:bg-[var(--ukb-surface-2)] disabled:cursor-not-allowed disabled:opacity-60",
  primaryButton:
    "inline-flex min-h-[32px] items-center justify-center rounded-md bg-[var(--ukb-accent)] px-3 py-1 text-xs font-semibold text-[var(--ukb-surface)] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50",
  link: "font-semibold text-[var(--ukb-accent)] underline-offset-2 hover:underline",
};
