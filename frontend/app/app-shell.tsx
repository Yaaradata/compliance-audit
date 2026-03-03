"use client";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { SidebarProvider, useSidebar } from "@/lib/sidebar-context";

/**
 * Layout: Left = fixed sidebar (YaaraLabs nav). Right = content area:
 *   Top row = header (full width of content area). Below = dashboard content.
 * Header and content use the same horizontal padding for grid alignment.
 * On small screens, sidebar overlays content and can be toggled from header.
 */
const CONTENT_PX = "px-2 sm:px-4";

function AppShellInner({ children }: { children: React.ReactNode }) {
  const { open, toggle } = useSidebar();
  return (
    <div className="min-h-screen flex" style={{ background: "var(--background)" }}>
      {/* Mobile backdrop when sidebar open */}
      <div
        role="button"
        tabIndex={-1}
        aria-label="Close menu"
        onClick={toggle}
        onKeyDown={(e) => e.key === "Escape" && toggle()}
        className={`fixed inset-0 z-30 bg-black/40 transition-opacity md:hidden ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className={`shrink-0 border-b border-[var(--border)] bg-[var(--surface)] ${CONTENT_PX}`}>
          <AppHeader />
        </header>
        <main className={`flex-1 overflow-y-auto min-h-0 ${CONTENT_PX} py-2 sm:py-3`}>
          {children}
        </main>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppShellInner>{children}</AppShellInner>
    </SidebarProvider>
  );
}
