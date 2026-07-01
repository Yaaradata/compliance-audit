"use client";

import { useState } from "react";
import type { V5ScreenId } from "@/lib/Srilanka_Retail/v5/types";
import { useKeystoneV5Colors } from "../theme/KeystoneV5ThemeProvider";
import { BrandMark } from "./BrandMark";
import { V5_NAV } from "./navItems";

const COLLAPSED_WIDTH = 56;
const EXPANDED_WIDTH = 256;

export function SidebarNav({
  screen,
  onScreenChange,
  rippled,
}: {
  screen: V5ScreenId;
  onScreenChange: (id: V5ScreenId) => void;
  rippled: boolean;
}) {
  const C = useKeystoneV5Colors();
  const [open, setOpen] = useState(false);

  return (
    <aside
      className="sticky top-0 z-30 flex h-screen shrink-0 flex-col overflow-hidden border-r transition-[width] duration-200 ease-out"
      style={{
        width: open ? EXPANDED_WIDTH : COLLAPSED_WIDTH,
        borderColor: C.border,
        background: C.bgGrad,
      }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      aria-expanded={open}
      aria-label="Keystone navigation"
    >
      <div
        className={`border-b py-4 ${open ? "px-4" : "px-2"}`}
        style={{ borderColor: C.border }}
      >
        <BrandMark compact={!open} />
      </div>

      <nav
        className="sidebar-scroll flex flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden p-2"
        aria-label="Keystone demo screens"
      >
        {V5_NAV.map(([k, label, Icon]) => {
          const isActive = screen === k;
          const badge = (k === "C4" || k === "C5" || k === "C6") && rippled;
          const isHero = k === "C1" || k === "C6";

          return (
            <button
              key={k}
              type="button"
              onClick={() => onScreenChange(k)}
              title={open ? undefined : `${k}: ${label}`}
              aria-label={`${k} ${label}`}
              aria-current={isActive ? "page" : undefined}
              className={`relative flex w-full items-center rounded-md text-[13px] font-medium transition-colors focus:outline-none focus-visible:ring-2 ${
                open ? "gap-2.5 px-3 py-2.5 text-left" : "justify-center px-2 py-2.5"
              }`}
              style={{
                background: isActive ? C.raise : "transparent",
                color: isActive ? C.text : C.dim,
                border: `1px solid ${isActive ? C.border : "transparent"}`,
              }}
            >
              {open ? (
                <>
                  <span
                    className="tabular-nums text-[10px] font-semibold"
                    style={{ color: isActive ? C.accent : C.faint }}
                  >
                    {k}
                  </span>
                  <Icon size={15} color={isActive ? C.accent : C.faint} className="shrink-0" />
                  <span className="min-w-0 flex-1 truncate">{label}</span>
                  {isHero && (
                    <span
                      className="shrink-0 rounded px-1 py-0.5 text-[9px] font-semibold"
                      style={{ background: C.accentDim, color: C.accent }}
                    >
                      HERO
                    </span>
                  )}
                  {badge && (
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: C.green }}
                      aria-hidden
                    />
                  )}
                </>
              ) : (
                <span className="relative flex flex-col items-center gap-0.5">
                  <Icon size={18} color={isActive ? C.accent : C.faint} />
                  <span
                    className="tabular-nums text-[9px] font-semibold"
                    style={{ color: isActive ? C.accent : C.faint }}
                  >
                    {k}
                  </span>
                  {badge && (
                    <span
                      className="absolute -right-1 -top-0.5 h-1.5 w-1.5 rounded-full"
                      style={{ background: C.green }}
                      aria-hidden
                    />
                  )}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

export { V5_NAV };
