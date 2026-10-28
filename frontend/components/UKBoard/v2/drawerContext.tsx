"use client";

/** UK Board v2 — which detail drawer is open. UI state only; nothing persists. */
import { createContext, useContext } from "react";
import type { DrawerKey } from "./drawerKeys";

export interface DrawerApi {
  openKey: DrawerKey | null;
  open: (key: DrawerKey, opener?: HTMLElement | null) => void;
  close: () => void;
}

export const DrawerContext = createContext<DrawerApi | null>(null);

export function useDrawer(): DrawerApi {
  const ctx = useContext(DrawerContext);
  if (!ctx) throw new Error("useDrawer must be used inside the UK Board v2 shell");
  return ctx;
}
