"use client";

import { useState } from "react";
import { ChevronDown, Search, Sparkles } from "lucide-react";
import { useApp } from "../context/AppContext";
import { Btn } from "../primitives";

const TIME_OPTIONS = [
  "Now",
  "Pre-dispatch (14-Jun 06:00)",
  "Pre-declaration (12-Jun 18:00)",
  "Post-inspection snapshot",
];

export function TopBar() {
  const { searchQuery, setSearchQuery, timeSelector, setTimeSelector, openEvidencePack, activeScreen, inspectionMode } =
    useApp();
  const [timeOpen, setTimeOpen] = useState(false);

  const packScope = activeScreen === "excise" ? { type: "period" as const, ref: "2026-06" } : { type: "period" as const, ref: "2026-06" };

  return (
    <header
      className="flex h-14 shrink-0 items-center gap-4 px-4"
      style={{ backgroundColor: "var(--surface-card)", borderBottom: "1px solid var(--border-subtle)" }}
    >
      {/* Global search */}
      <div className="relative flex-1 max-w-[420px]">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-secondary)" }} />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search batch ID, FL no., CusDec ref…"
          className="w-full rounded-md py-2 pl-9 pr-3 text-[13px] outline-none"
          style={{ backgroundColor: "var(--surface-raised)", color: "var(--text-primary)", border: "1px solid var(--border-subtle)" }}
        />
      </div>

      {/* Time selector */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setTimeOpen((o) => !o)}
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px]"
          style={{ backgroundColor: "var(--surface-raised)", color: "var(--text-primary)", border: "1px solid var(--border-subtle)" }}
        >
          {timeSelector}
          <ChevronDown size={13} />
        </button>
        {timeOpen ? (
          <div
            className="absolute right-0 top-full z-20 mt-1 w-64 overflow-hidden rounded-lg lion-fade-in"
            style={{ backgroundColor: "var(--surface-overlay)", border: "1px solid var(--border-subtle)" }}
          >
            {TIME_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  setTimeSelector(opt);
                  setTimeOpen(false);
                }}
                className="block w-full px-3 py-2 text-left text-[12px] transition-colors hover:brightness-125"
                style={{ color: opt === timeSelector ? "var(--text-primary)" : "var(--text-secondary)" }}
              >
                {opt}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {/* Generate evidence pack */}
      <Btn variant="primary" onClick={() => openEvidencePack(packScope, inspectionMode ? "SLSI" : "EXCISE")}>
        <span className="flex items-center gap-1.5">
          <Sparkles size={14} />
          Generate Evidence Pack
        </span>
      </Btn>
    </header>
  );
}
