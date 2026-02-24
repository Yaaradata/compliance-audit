"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { getArchitecture } from "@/lib/data/architectures";
import { ROLE_LABELS } from "@/lib/data/roles";

export function AppHeader() {
  const { user, logout, selectedArchitectureId } = useAuth();
  const arch = selectedArchitectureId ? getArchitecture(selectedArchitectureId) : null;
  const initials = user?.name?.split(/\s+/).map((n) => n[0]).join("").toUpperCase().slice(0, 2) ?? "?";

  return (
    <header className="bg-[#0c2340] px-5 py-2.5 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <Link href={user?.role === "admin" ? "/admin" : "/dashboard"} className="text-base font-bold text-white hover:opacity-90">YaaraLabs</Link>
        <span className="text-[11px] text-blue-300 px-2 py-0.5 bg-blue-300/15 rounded">SWIFT Compliance Platform</span>
      </div>
      <div className="flex items-center gap-3">
        {arch && <span className="text-[11px] text-blue-300 font-semibold px-2 py-0.5 bg-blue-300/15 rounded">{arch.id} — {arch.subtitle}</span>}
        <span className="text-[11px] text-blue-300">Assessment Cycle: 2025</span>
        {user && (
          <>
            <span className="text-[11px] text-blue-200">{ROLE_LABELS[user.role]}</span>
            <div className="w-7 h-7 rounded-full bg-blue-800 flex items-center justify-center text-white text-[11px] font-semibold" title={user.email}>{initials}</div>
            {user.role !== "admin" && (
              <Link href="/select-architecture" className="text-[11px] text-blue-300 hover:underline">Change architecture</Link>
            )}
            <button type="button" onClick={() => logout()} className="text-[11px] text-blue-300 hover:underline">Log out</button>
          </>
        )}
      </div>
    </header>
  );
}
