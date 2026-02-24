"use client";

import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <AppHeader />
      <div className="flex flex-1 overflow-hidden">
        <AppSidebar />
        <main className="flex-1 overflow-y-auto p-5">
          <div className="max-w-[1100px] mx-auto">{children}</div>
        </main>
      </div>
      <footer className="px-5 py-2.5 text-center text-[10px] text-gray-400 border-t border-gray-200 bg-white">
        YaaraLabs SWIFT Compliance Platform · Phase 1 Pilot · February 2026
      </footer>
    </div>
  );
}
