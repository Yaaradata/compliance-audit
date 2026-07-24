"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { DASHBOARD_LABELS, effectiveAccess, isAdminRole } from "@/lib/demo-access";

export type DemoSession = {
  signedIn: boolean;
  name?: string;
  email?: string;
  role?: string;
  access?: string;
};

type Props = {
  /** Notifies the parent so region cards can update lock state. */
  onSessionChange?: (session: DemoSession) => void;
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
}

function firstName(name: string): string {
  return name.trim().split(/\s+/).filter(Boolean)[0] ?? name;
}

function isAdmin(session: DemoSession): boolean {
  return isAdminRole(session.role) || (session.access ?? "").trim() === "*";
}

function accessLabels(access: string): string[] {
  const effective = access.trim();
  if (effective === "*") return [];
  return effective
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((key) => DASHBOARD_LABELS[key] ?? key);
}

export function UserButton({ onSessionChange }: Props) {
  const router = useRouter();
  const [session, setSession] = useState<DemoSession | null>(null);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch("/api/access/me", { cache: "no-store" });
        const d = (await r.json()) as DemoSession;
        if (cancelled) return;
        const next: DemoSession = {
          signedIn: Boolean(d.signedIn),
          name: d.name,
          email: d.email,
          role: d.role,
          access: d.signedIn ? effectiveAccess(d.role, d.access) : d.access,
        };
        setSession(next);
        onSessionChange?.(next);
      } catch {
        if (cancelled) return;
        const next: DemoSession = { signedIn: false };
        setSession(next);
        onSessionChange?.(next);
      }
    })();
    return () => {
      cancelled = true;
    };
    // Intentionally once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  if (session === null) {
    return (
      <div
        className="h-9 w-36 animate-pulse rounded-full bg-slate-200/80"
        aria-hidden
        aria-label="Loading session"
      />
    );
  }

  if (!session.signedIn) {
    return (
      <button
        type="button"
        onClick={() => router.push("/access?next=/select_region")}
        className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
      >
        Sign in
      </button>
    );
  }

  const name = session.name ?? "User";
  const admin = isAdmin(session);
  const labels = accessLabels(session.access ?? "");

  const signOut = async () => {
    setOpen(false);
    await fetch("/api/access/logout", { method: "POST" });
    const next: DemoSession = { signedIn: false };
    setSession(next);
    onSessionChange?.(next);
    router.refresh();
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-[11px] font-bold text-white">
          {initials(name)}
        </span>
        <span>{firstName(name)}</span>
        <svg
          viewBox="0 0 12 12"
          className={`h-3 w-3 text-slate-500 transition ${open ? "rotate-180" : ""}`}
          aria-hidden
        >
          <path
            d="M2.5 4.5 L6 8 L9.5 4.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
        >
          <div className="border-b border-slate-100 px-3.5 py-3">
            <div className="text-sm font-semibold text-slate-900">{name}</div>
            {session.email ? (
              <div className="mt-0.5 text-xs text-slate-500">{session.email}</div>
            ) : null}
            <div className="mt-2">
              {admin ? (
                <span className="inline-block rounded-md bg-violet-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-800">
                  ADMIN
                </span>
              ) : (
                <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600">
                  REVIEWER
                </span>
              )}
            </div>
          </div>

          <div className="px-3.5 py-2.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Dashboards
            </div>
            {admin ? (
              <p className="mt-1.5 text-sm text-slate-700">All dashboards</p>
            ) : labels.length > 0 ? (
              <ul className="mt-1.5 space-y-1">
                {labels.map((label) => (
                  <li key={label} className="text-sm text-slate-700">
                    {label}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1.5 text-sm text-slate-500">No dashboards granted</p>
            )}
          </div>

          <div className="border-t border-slate-100 p-1.5">
            <button
              type="button"
              role="menuitem"
              onClick={signOut}
              className="w-full rounded-lg px-2.5 py-2 text-left text-sm font-medium text-rose-700 hover:bg-rose-50"
            >
              Sign out
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
