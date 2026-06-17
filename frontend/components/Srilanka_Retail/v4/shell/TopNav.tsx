"use client";

import type { LucideIcon } from "lucide-react";
import { FileText, FolderCheck, Gauge, LayoutGrid, Receipt, Truck } from "lucide-react";
import type { V4ScreenId } from "@/lib/Srilanka_Retail/v4/types";
import { useKeystoneV4Colors } from "../theme/KeystoneV4ThemeProvider";

const NAV: [V4ScreenId, string, LucideIcon][] = [
  ["C1", "Four-Way Reconciliation", Receipt],
  ["C2", "Quality Gate + ABV", Gauge],
  ["C3", "Dispatch + Receivables", Truck],
  ["C4", "Evidence Packs", FolderCheck],
  ["C5", "Risk Matrix + Exceptions", LayoutGrid],
  ["C6", "Board Report", FileText],
];

export function TopNav({
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
    <nav className="flex min-w-0 flex-1 gap-1 overflow-x-auto" aria-label="Keystone demo screens">
      {NAV.map(([k, label, Icon]) => {
        const isActive = screen === k;
        const badge = (k === "C4" || k === "C5" || k === "C6") && rippled;
        const isHero = k === "C1" || k === "C6";
        return (
          <button
            key={k}
            type="button"
            onClick={() => onScreenChange(k)}
            className="relative flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-[13px] font-medium transition-colors focus:outline-none focus-visible:ring-2"
            style={{
              background: isActive ? C.raise : "transparent",
              color: isActive ? C.text : C.dim,
              border: `1px solid ${isActive ? C.border : "transparent"}`,
            }}
          >
            <span className="tabular-nums text-[10px] font-semibold" style={{ color: isActive ? C.accent : C.faint }}>
              {k}
            </span>
            <Icon size={14} color={isActive ? C.accent : C.faint} />
            <span className="whitespace-nowrap">{label}</span>
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
  );
}

export { NAV as V4_NAV };
