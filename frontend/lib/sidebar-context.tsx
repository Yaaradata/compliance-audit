"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "sidebar-open";

type SidebarContextValue = {
  open: boolean;
  toggle: () => void;
  setOpen: (value: boolean, persist?: boolean) => void;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpenState] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) setOpenState(stored === "true");
    } catch {
      /* ignore */
    }
  }, []);

  const setOpen = useCallback((value: boolean, persist = true) => {
    setOpenState(value);
    if (persist) {
      try {
        localStorage.setItem(STORAGE_KEY, String(value));
      } catch {
        /* ignore */
      }
    }
  }, []);

  const toggle = useCallback(() => {
    setOpenState((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  return (
    <SidebarContext.Provider value={{ open, toggle, setOpen }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    return { open: true, toggle: () => {}, setOpen: () => {} };
  }
  return ctx;
}
