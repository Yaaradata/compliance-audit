"use client";

import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarProvider } from "@/lib/sidebar-context";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col" style={{ background: "var(--background)" }}>
        <AppHeader />
        <div className="flex flex-1 overflow-hidden min-w-0">
          <AppSidebar />
          <main className="flex-1 min-w-0 overflow-y-auto p-5">
            <div className="max-w-[1100px] mx-auto w-full">{children}</div>
          </main>
        </div>
        <footer className="px-5 py-2.5 text-center text-[10px] border-t shrink-0" style={{ color: "var(--foreground-subtle)", borderColor: "var(--border)", background: "var(--surface)" }}>
          YaaraLabs SWIFT Compliance Platform · Phase 1 Pilot · February 2026
        </footer>
      </div>
    </SidebarProvider>
  );
}
