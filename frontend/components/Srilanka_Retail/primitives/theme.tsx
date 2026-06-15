"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Moon, Sun } from "lucide-react";

type KeystoneTheme = "dark" | "light";

const ThemeCtx = createContext<{
  theme: KeystoneTheme;
  toggle: () => void;
} | null>(null);

export function KeystoneThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<KeystoneTheme>("dark");

  useEffect(() => {
    const saved = localStorage.getItem("keystone-theme");
    if (saved === "light" || saved === "dark") setTheme(saved);
  }, []);

  const toggle = () => {
    setTheme((t) => {
      const next = t === "dark" ? "light" : "dark";
      localStorage.setItem("keystone-theme", next);
      return next;
    });
  };

  return (
    <ThemeCtx.Provider value={{ theme, toggle }}>
      <div data-keystone-theme={theme} className="keystone-root">
        {children}
      </div>
    </ThemeCtx.Provider>
  );
}

export function useKeystoneTheme() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error("useKeystoneTheme must be used within KeystoneThemeProvider");
  return ctx;
}

export function ThemeToggle() {
  const { theme, toggle } = useKeystoneTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-[12px] font-medium transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2"
      style={{
        background: "var(--ks-panel)",
        border: "1px solid var(--ks-border)",
        color: "var(--ks-dim)",
      }}
    >
      {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
      {theme === "dark" ? "Light" : "Dark"}
    </button>
  );
}
