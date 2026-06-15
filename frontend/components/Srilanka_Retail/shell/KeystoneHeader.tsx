"use client";

import { ShieldCheck, RotateCcw, ChevronDown } from "lucide-react";
import { useKeystoneStore } from "@/lib/Srilanka_Retail/store";
import { ThemeToggle } from "../primitives/theme";
import { Btn } from "../primitives/ui";
import type { KeystoneNavItem, KeystoneScreenId } from "./config";
import { KeystoneNav } from "./KeystoneNav";

interface KeystoneHeaderProps {
  screen: KeystoneScreenId;
  activeNav: KeystoneNavItem;
  rippled: boolean;
  onSelectScreen: (id: KeystoneScreenId) => void;
  onReset: () => void;
  navItems: KeystoneNavItem[];
}

export function KeystoneHeader({
  screen,
  activeNav,
  rippled,
  onSelectScreen,
  onReset,
  navItems,
}: KeystoneHeaderProps) {
  const company = useKeystoneStore((s) => s.company);
  const periods = useKeystoneStore((s) => s.periods);
  const currentPeriod = periods.find((p) => p.current) ?? periods[0];

  return (
    <header
      className="sticky top-0 z-20 border-b"
      style={{ borderColor: "var(--ks-border)", background: "var(--ks-bg-grad)" }}
    >
      {/* top bar — brand + controls (theme lives here) */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-8">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-md"
            style={{
              background: "var(--ks-accent-dim)",
              border: "1px solid var(--ks-accent-edge)",
            }}
          >
            <ShieldCheck size={17} style={{ color: "var(--ks-accent)" }} />
          </div>
          <div>
            <div className="text-[15px] font-semibold tracking-tight">Keystone</div>
            <div className="text-[10px]" style={{ color: "var(--ks-faint)" }}>
              {company.name}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px]"
            style={{
              background: "var(--ks-panel)",
              border: "1px solid var(--ks-border)",
              color: "var(--ks-dim)",
            }}
          >
            Period: {currentPeriod?.label} <ChevronDown size={13} />
          </span>
          <ThemeToggle />
          <Btn kind="ghost" icon={RotateCcw} onClick={onReset}>
            Reset demo
          </Btn>
        </div>
      </div>

      {/* horizontal screen nav — replaces sidebar */}
      <div className="px-5 sm:px-8">
        <KeystoneNav
          active={screen}
          rippled={rippled}
          onSelect={onSelectScreen}
          items={navItems}
        />
      </div>

      {/* page title row — matches reference: Keystone · {screen} */}
      <div className="flex flex-wrap items-end justify-between gap-3 px-5 pb-5 pt-4 sm:px-8">
        <div>
          <div
            className="text-[11px] font-semibold uppercase tracking-[0.14em]"
            style={{ color: "var(--ks-faint)" }}
          >
            Keystone · {activeNav.label}
          </div>
          <h1 className="mt-1 text-lg font-semibold tracking-tight sm:text-xl">
            {activeNav.label}
          </h1>
        </div>
      </div>
    </header>
  );
}
