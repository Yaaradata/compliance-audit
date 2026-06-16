"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  Check,
  FlaskConical,
  FolderCheck,
  LayoutDashboard,
  Scale,
  Shield,
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
  const { activeScreen, navigate } = useApp();
  const [open, setOpen] = useState(false);

  return (
    <nav
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      aria-label="Main navigation"
      className={`flex h-full shrink-0 flex-col overflow-hidden transition-[width] duration-200 ease-out ${
        open ? "w-[240px]" : "w-14"
      }`}
      style={{ backgroundColor: "var(--surface-raised)", borderRight: "1px solid var(--border-subtle)" }}
    >
      <div className={`shrink-0 border-b py-4 ${open ? "px-5" : "px-2"}`} style={{ borderColor: "var(--border-subtle)" }}>
        {open ? (
          <>
            <div className="text-[18px] font-bold tracking-tight" style={{ color: "var(--lion-gold)" }}>
              Lion Brewery
            </div>
            <div className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
              Ceylon PLC · Biyagama
            </div>
          </>
        ) : (
          <div className="flex justify-center">
            <Shield size={20} style={{ color: "var(--lion-gold)" }} aria-hidden />
          </div>
        )}
      </div>

      <div className={`lion-scroll flex-1 overflow-y-auto overflow-x-hidden ${open ? "px-3" : "px-1.5"}`}>
        {NAV.map(({ id, label, icon: Icon }) => {
          const active = activeScreen === id;
          return (
            <button
              key={id}
              type="button"
              title={!open ? label : undefined}
              onClick={() => navigate(id)}
              className={`mb-0.5 flex w-full items-center rounded-md py-2.5 text-[13px] font-medium transition-colors ${
                open ? "gap-3 px-3 text-left" : "justify-center px-0"
              }`}
              style={{
                color: active ? "var(--text-primary)" : "var(--text-secondary)",
                backgroundColor: active ? "var(--surface-card)" : "transparent",
                borderLeft: open ? (active ? "2px solid var(--ai-accent)" : "2px solid transparent") : "none",
              }}
            >
              <Icon size={17} className="shrink-0" style={{ color: active ? "var(--ai-accent)" : "var(--text-secondary)" }} />
              {open ? <span className="truncate">{label}</span> : null}
            </button>
          );
        })}
      </div>

      <PersonaSwitcher open={open} />
    </nav>
  );
}

function PersonaSwitcher({ open }: { open: boolean }) {
  const { persona, setPersona } = useApp();
  const [popover, setPopover] = useState(false);

  useEffect(() => {
    if (!open) setPopover(false);
  }, [open]);

  return (
    <div className={`relative shrink-0 border-t ${open ? "px-3 pb-2 pt-2" : "px-1.5 py-2"}`} style={{ borderColor: "var(--border-subtle)" }}>
      {popover && open ? (
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
                setPopover(false);
              }}
              className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:brightness-110"
            >
              <Avatar color={p.color} initials={p.avatarInitials} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[12px] font-medium" style={{ color: "var(--text-primary)" }}>
                  {p.name}
                </div>
                <div className="truncate text-[10px]" style={{ color: "var(--text-secondary)" }}>
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
        title={!open ? persona.name : undefined}
        onClick={() => setPopover((o) => !o)}
        className={`flex w-full items-center rounded-md transition-colors hover:brightness-110 ${
          open ? "gap-2.5 px-3 py-2.5" : "justify-center py-2"
        }`}
        style={{ backgroundColor: "var(--surface-card)" }}
      >
        <Avatar color={persona.color} initials={persona.avatarInitials} />
        {open ? (
          <>
            <div className="min-w-0 flex-1 text-left">
              <div className="truncate text-[12px] font-semibold" style={{ color: "var(--text-primary)" }}>
                {persona.name}
              </div>
              <div className="truncate text-[10px]" style={{ color: "var(--text-secondary)" }}>
                {persona.role}
              </div>
            </div>
            <ChevronUp size={14} style={{ color: "var(--text-secondary)", transform: popover ? "rotate(180deg)" : "none" }} />
          </>
        ) : null}
      </button>
    </div>
  );
}

function Avatar({ color, initials }: { color: string; initials: string }) {
  return (
    <span
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
      style={{ backgroundColor: color, color: "var(--text-inverse)" }}
    >
      {initials}
    </span>
  );
}
