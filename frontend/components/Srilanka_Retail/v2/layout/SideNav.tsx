"use client";

import { useState } from "react";
import {
  BookOpen,
  Check,
  FlaskConical,
  FolderCheck,
  LayoutDashboard,
  Scale,
  Store,
  ChevronUp,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { PERSONAS } from "@/lib/Srilanka_Retail/v2/personas";
import type { ScreenId } from "@/lib/Srilanka_Retail/v2/types";

const NAV: { id: ScreenId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "excise", label: "Excise Workbench", icon: Scale },
  { id: "batches", label: "Batches", icon: FlaskConical },
  { id: "pos-licences", label: "POS Licences", icon: Store },
  { id: "evidence", label: "Evidence Packs", icon: FolderCheck },
  { id: "registry", label: "Registry", icon: BookOpen },
];

export function SideNav() {
  const { activeScreen, navigate, persona } = useApp();

  return (
    <nav
      className="flex h-full w-[240px] shrink-0 flex-col"
      style={{ backgroundColor: "var(--surface-raised)", borderRight: "1px solid var(--border-subtle)" }}
    >
      <div className="px-5 py-5">
        <div className="text-[18px] font-bold tracking-tight" style={{ color: "var(--lion-gold)" }}>
          Lion Brewery
        </div>
        <div className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
          Ceylon PLC · Biyagama
        </div>
      </div>

      <div className="flex-1 px-3">
        {NAV.map(({ id, label, icon: Icon }) => {
          const active = activeScreen === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => navigate(id)}
              className="mb-0.5 flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-[13px] font-medium transition-colors"
              style={{
                color: active ? "var(--text-primary)" : "var(--text-secondary)",
                backgroundColor: active ? "var(--surface-card)" : "transparent",
                borderLeft: active ? "2px solid var(--ai-accent)" : "2px solid transparent",
              }}
            >
              <Icon size={17} style={{ color: active ? "var(--ai-accent)" : "var(--text-secondary)" }} />
              {label}
            </button>
          );
        })}
      </div>

      <PersonaSwitcher />

      <div className="px-5 py-3 text-[11px]" style={{ color: "var(--text-secondary)", borderTop: "1px solid var(--border-subtle)" }}>
        Theme · <span style={{ color: "var(--text-primary)" }}>Dark</span> · {persona.role}
      </div>
    </nav>
  );
}

function PersonaSwitcher() {
  const { persona, setPersona } = useApp();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative px-3 pb-2">
      {open ? (
        <div
          className="absolute bottom-full left-3 right-3 mb-2 overflow-hidden rounded-lg lion-fade-in"
          style={{ backgroundColor: "var(--surface-overlay)", border: "1px solid var(--border-subtle)" }}
        >
          {PERSONAS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setPersona(p.id);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:brightness-125"
            >
              <Avatar color={p.color} initials={p.avatarInitials} />
              <div className="flex-1">
                <div className="text-[12px] font-medium" style={{ color: "var(--text-primary)" }}>
                  {p.name}
                </div>
                <div className="text-[10px]" style={{ color: "var(--text-secondary)" }}>
                  {p.role}
                </div>
              </div>
              {p.id === persona.id ? <Check size={14} style={{ color: "var(--ai-accent)" }} /> : null}
            </button>
          ))}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 transition-colors hover:brightness-125"
        style={{ backgroundColor: "var(--surface-card)" }}
      >
        <Avatar color={persona.color} initials={persona.avatarInitials} />
        <div className="flex-1 text-left">
          <div className="text-[12px] font-semibold" style={{ color: "var(--text-primary)" }}>
            {persona.name}
          </div>
          <div className="text-[10px]" style={{ color: "var(--text-secondary)" }}>
            {persona.role}
          </div>
        </div>
        <ChevronUp size={14} style={{ color: "var(--text-secondary)", transform: open ? "rotate(180deg)" : "none" }} />
      </button>
    </div>
  );
}

function Avatar({ color, initials }: { color: string; initials: string }) {
  return (
    <span
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
      style={{ backgroundColor: color, color: "#0d1117" }}
    >
      {initials}
    </span>
  );
}
