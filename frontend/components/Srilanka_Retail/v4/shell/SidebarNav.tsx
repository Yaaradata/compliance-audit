"use client";

import type { LucideIcon } from "lucide-react";
import { FileText, FolderCheck, Gauge, LayoutGrid, Receipt, Truck } from "lucide-react";
import type { V4ScreenId } from "@/lib/Srilanka_Retail/v4/types";
import { useKeystoneV4Colors } from "../theme/KeystoneV4ThemeProvider";
import { BrandMark } from "./BrandMark";

const NAV: [V4ScreenId, string, LucideIcon][] = [
  ["C1", "Four-Way Reconciliation", Receipt],
  ["C2", "Quality Gate + ABV", Gauge],
  ["C3", "Dispatch + Receivables", Truck],
  ["C4", "Evidence Packs", FolderCheck],
  ["C5", "Risk Matrix + Exceptions", LayoutGrid],
  ["C6", "Board Report", FileText],
];

export function SidebarNav({
  screen,
  onScreenChange,
  rippled,
}: {
  screen: V4ScreenId;
  onScreenChange: (id: V4ScreenId) => void;
  rippled: boolean;
}) {
  const C = useKeystoneV4Colors();

  return (
    <aside
      className="shrink-0 border-b lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:flex-col lg:border-b-0 lg:border-r"
      style={{ borderColor: C.border, background: C.bgGrad }}
    >
      <BrandMark />
      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-1 lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden lg:pb-4">
        {NAV.map(([k, label, Icon]) => {
          const isActive = screen === k;
          const badge = (k === "C4" || k === "C5" || k === "C6") && rippled;
          const isHero = k === "C1" || k === "C6";
          return (
            <button
              key={k}
              type="button"
              onClick={() => onScreenChange(k)}
              className="group relative flex shrink-0 items-center gap-2.5 rounded-md px-3 py-2.5 text-left text-[13px] transition-colors focus:outline-none focus-visible:ring-2 lg:w-full"
              style={{
                background: isActive ? C.raise : "transparent",
                color: isActive ? C.text : C.dim,
                border: `1px solid ${isActive ? C.border : "transparent"}`,
                borderLeft: `3px solid ${isActive ? C.accent : "transparent"}`,
              }}
            >
              <span className="tabular-nums text-[10px] font-semibold" style={{ color: isActive ? C.accent : C.faint }}>
                {k}
              </span>
              <Icon size={15} color={isActive ? C.accent : C.faint} />
              <span className="flex-1 truncate font-medium">{label}</span>
              {isHero && (
                <span
                  className="rounded px-1 py-0.5 text-[9px] font-semibold"
                  style={{ background: C.accentDim, color: C.accent }}
                >
                  HERO
                </span>
              )}
              {badge && <span className="h-1.5 w-1.5 rounded-full" style={{ background: C.green }} />}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

export { NAV as V4_SIDEBAR_NAV };
