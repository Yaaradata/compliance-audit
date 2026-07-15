"use client";

import Link from "next/link";
import { Building2 } from "lucide-react";
import { useUkpaVersion } from "../ukpa/UkpaVersionProvider";
import { useUkpaV3Session } from "./UkpaV3SessionProvider";

/**
 * Shared v3 chrome — CCO persona by default; Internal Audit toggle is read-only.
 */
export function UkpaV3Shell({
  children,
  cycleLabel,
  activeNav,
}: {
  children: React.ReactNode;
  cycleLabel: string;
  activeNav: "inbox" | "silence" | "other";
}) {
  const version = useUkpaVersion();
  const { persona, setPersona, personaLabel, assuranceLine } = useUkpaV3Session();
  const iaOn = persona === "internal-audit";

  return (
    <div
      className="flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden bg-slate-100 text-slate-900"
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, system-ui, sans-serif',
      }}
    >
      <header className="z-30 shrink-0 bg-slate-900 text-white">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-6 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-slate-700">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold leading-tight">UK Banking Process Audit</div>
              <div className="text-[11px] leading-tight text-slate-400">
                Enforcement intelligence · {version.toUpperCase()}
              </div>
              {assuranceLine ? (
                <div className="mt-0.5 text-[10px] leading-snug text-slate-500">{assuranceLine}</div>
              ) : null}
            </div>
          </div>

          <nav className="hidden items-center gap-1 sm:flex">
            <NavLink href="/UK_Process_Audit/v3" active={activeNav === "inbox"}>
              Signals Inbox
            </NavLink>
            <NavLink href="/UK_Process_Audit/v3/silence" active={activeNav === "silence"}>
              Heartbeat
            </NavLink>
          </nav>

          <div className="flex shrink-0 items-center gap-3">
            <label className="flex cursor-pointer items-center gap-2 rounded-md bg-slate-800 px-2.5 py-1.5 ring-1 ring-slate-700">
              <input
                type="checkbox"
                checked={iaOn}
                onChange={(e) =>
                  setPersona(e.target.checked ? "internal-audit" : "chief-compliance-officer")
                }
                className="h-3.5 w-3.5 accent-slate-300"
              />
              <span className="text-[11px] font-medium text-slate-200">Internal Audit</span>
            </label>
            <div className="hidden text-right md:block">
              <div className="text-xs font-medium">{personaLabel}</div>
              <div className="text-[10px] text-slate-400">{cycleLabel}</div>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700 text-[10px] font-semibold">
              {iaOn ? "IA" : "CCO"}
            </div>
          </div>
        </div>
      </header>

      <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-auto">
        {children}
      </main>
    </div>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-md px-3 py-1.5 text-[12px] font-semibold ${
        active
          ? "bg-white text-slate-900"
          : "text-slate-300 hover:bg-slate-800 hover:text-white"
      }`}
    >
      {children}
    </Link>
  );
}
