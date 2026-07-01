"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Moon, Sun } from "lucide-react";
import { PALETTES } from "./palette";
import type { KeystoneV5ThemeMode } from "./palette";
export type { KeystoneV5ThemeMode } from "./palette";
import type { KeystonePalette } from "@/lib/Srilanka_Retail/v5/types";

const ThemeCtx = createContext<KeystonePalette>(PALETTES.light);

export function useKeystoneV5Colors() {
  return useContext(ThemeCtx);
}

export function KeystoneV5ThemeProvider({
  mode,
  children,
}: {
  mode: KeystoneV5ThemeMode;
  children: ReactNode;
}) {
  return <ThemeCtx.Provider value={PALETTES[mode]}>{children}</ThemeCtx.Provider>;
}

export function KeystoneV5ThemeToggle({
  mode,
  onToggle,
}: {
  mode: KeystoneV5ThemeMode;
  onToggle: () => void;
}) {
  const C = useKeystoneV5Colors();
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={mode === "light" ? "Switch to dark theme" : "Switch to light theme"}
      className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium focus:outline-none focus-visible:ring-2"
      style={{ background: C.panel, border: `1px solid ${C.border}`, color: C.dim }}
    >
      {mode === "light" ? <Moon size={13} /> : <Sun size={13} />}
      {mode === "light" ? "Dark" : "Light"}
    </button>
  );
}

export function useKeystoneV5ThemeMode(): [KeystoneV5ThemeMode, (mode: KeystoneV5ThemeMode) => void] {
  const [mode, setMode] = useState<KeystoneV5ThemeMode>("light");

  useEffect(() => {
    const saved = localStorage.getItem("keystone-v5-theme");
    if (saved === "light" || saved === "dark") setMode(saved);
  }, []);

  const setAndPersist = (next: KeystoneV5ThemeMode) => {
    setMode(next);
    localStorage.setItem("keystone-v5-theme", next);
  };

  return [mode, setAndPersist];
}
