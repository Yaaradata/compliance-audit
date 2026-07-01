"use client";

import { ChevronDown, RotateCcw } from "lucide-react";
import { Eyebrow } from "../primitives/ui";
import {
  KeystoneV5ThemeToggle,
  useKeystoneV5Colors,
} from "../theme/KeystoneV5ThemeProvider";
import type { KeystoneV5ThemeMode } from "../theme/palette";

export function AppHeader({
  screenTitle,
  mode,
  onToggleTheme,
  onReset,
}: {
  screenTitle: string;
  mode: KeystoneV5ThemeMode;
  onToggleTheme: () => void;
  onReset: () => void;
}) {
  const C = useKeystoneV5Colors();

  return (
    <header
      className="sticky top-0 z-20 border-b px-5 py-4 sm:px-8"
      style={{ borderColor: C.border, background: C.bgGrad }}
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Eyebrow>{`Keystone · ${screenTitle}`}</Eyebrow>
          <h1 className="mt-1 text-lg font-semibold tracking-tight sm:text-xl">{screenTitle}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px]"
            style={{ background: C.panel, border: `1px solid ${C.border}`, color: C.dim }}
          >
            Period: May 2026 <ChevronDown size={13} />
          </span>
          <KeystoneV5ThemeToggle mode={mode} onToggle={onToggleTheme} />
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium focus:outline-none focus-visible:ring-2"
            style={{ background: C.panel, border: `1px solid ${C.border}`, color: C.dim }}
          >
            <RotateCcw size={13} /> Reset demo
          </button>
        </div>
      </div>
    </header>
  );
}
