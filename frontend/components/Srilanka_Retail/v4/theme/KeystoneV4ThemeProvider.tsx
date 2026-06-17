"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Moon, Sun } from "lucide-react";
import { PALETTES, type KeystoneV4ThemeMode } from "./palette";
import type { KeystonePalette } from "@/lib/Srilanka_Retail/v4/types";

const ThemeCtx = createContext<KeystonePalette>(PALETTES.light);

export function useKeystoneV4Colors() {
  return useContext(ThemeCtx);
}

export function KeystoneV4ThemeProvider({
  mode,
  children,
}: {
  mode: KeystoneV4ThemeMode;
  children: ReactNode;
}) {
  return <ThemeCtx.Provider value={PALETTES[mode]}>{children}</ThemeCtx.Provider>;
}

export function KeystoneV4ThemeToggle({
  mode,
  onToggle,
}: {
  mode: KeystoneV4ThemeMode;
  onToggle: () => void;
}) {
  const C = useKeystoneV4Colors();
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

export function useKeystoneV4ThemeMode(): [KeystoneV4ThemeMode, (mode: KeystoneV4ThemeMode) => void] {
  const [mode, setMode] = useState<KeystoneV4ThemeMode>("light");

  useEffect(() => {
    const saved = localStorage.getItem("keystone-v4-theme");
    if (saved === "light" || saved === "dark") setMode(saved);
  }, []);

  const setAndPersist = (next: KeystoneV4ThemeMode) => {
    setMode(next);
    localStorage.setItem("keystone-v4-theme", next);
  };

  return [mode, setAndPersist];
}
