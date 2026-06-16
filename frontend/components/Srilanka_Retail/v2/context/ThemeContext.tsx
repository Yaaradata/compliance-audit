"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Moon, Sun } from "lucide-react";

export type LionTheme = "dark" | "light";

const THEME_STORAGE_KEY = "lion-v2-theme";

const ThemeCtx = createContext<{
  theme: LionTheme;
  toggleTheme: () => void;
} | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<LionTheme>("dark");

  useEffect(() => {
    const stored = sessionStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark") setTheme(stored);
  }, []);

  const toggleTheme = () => {
    setTheme((t) => {
      const next = t === "dark" ? "light" : "dark";
      sessionStorage.setItem(THEME_STORAGE_KEY, next);
      return next;
    });
  };

  return (
    <ThemeCtx.Provider value={{ theme, toggleTheme }}>
      <div data-lion-theme={theme} className="lion-v2-root h-full w-full">
        {children}
      </div>
    </ThemeCtx.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors hover:brightness-110"
      style={{
        backgroundColor: "var(--surface-raised)",
        color: "var(--text-secondary)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
      {theme === "dark" ? "Light" : "Dark"}
    </button>
  );
}
